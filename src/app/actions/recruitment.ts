"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getSessionOrThrow, requireRole } from "@/lib/authorization"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

// ─────────────────────────────────────────────────────────────────
// INVITE TOKEN ACTIONS
// ─────────────────────────────────────────────────────────────────

const GenerateInviteSchema = z.object({
  roleForInvitee: z.enum(["SALESPERSON", "SALES_AGENT", "SUB_SALES_AGENT"]),
  commissionRate: z.coerce.number().min(0).max(100).default(5),
  expiresInHours: z.coerce.number().min(1).max(168).default(48), // max 1 week
})

export async function generateInviteToken(formData: FormData) {
  const user = await getSessionOrThrow()
  // Allow ADMIN and SALESPERSON to generate invite links
  if (user.role !== "ADMIN" && user.role !== "SALESPERSON") {
    return { error: "Not authorized to generate invite links" }
  }

  const raw = Object.fromEntries(formData)
  const parsed = GenerateInviteSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: "Invalid input" }
  }

  const { roleForInvitee, commissionRate, expiresInHours } = parsed.data

  const token = randomBytes(20).toString("hex")
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

  await (prisma as any).inviteToken.create({
    data: {
      token,
      createdByUserId: user.id,
      createdByAgentId: user.agentId ?? null,
      roleForInvitee,
      commissionRate,
      expiresAt,
    },
  })

  return { success: true, token }
}

export async function validateInviteToken(token: string) {
  const record = await (prisma as any).inviteToken.findUnique({
    where: { token },
    include: {
      application: { select: { id: true } },
    },
  })

  if (!record) return { valid: false, reason: "not_found" }
  if (record.usedAt) return { valid: false, reason: "used", data: record }
  if (new Date() > new Date(record.expiresAt)) return { valid: false, reason: "expired", data: record }

  // Fetch creator info for display
  let creatorName: string | null = null
  if (record.createdByAgentId) {
    const agent = await prisma.agent.findUnique({
      where: { id: record.createdByAgentId },
      select: { name: true },
    })
    creatorName = agent?.name ?? null
  }

  return {
    valid: true,
    data: {
      id: record.id,
      token: record.token,
      roleForInvitee: record.roleForInvitee as string,
      commissionRate: Number(record.commissionRate),
      expiresAt: record.expiresAt as Date,
      creatorName,
    },
  }
}

export async function getMyInviteTokens() {
  const user = await getSessionOrThrow()
  if (user.role !== "ADMIN" && user.role !== "SALESPERSON") {
    return []
  }

  return (prisma as any).inviteToken.findMany({
    where: { createdByUserId: user.id },
    include: { application: { select: { id: true, name: true, status: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
}

// ─────────────────────────────────────────────────────────────────
// RECRUITMENT REQUEST ACTIONS
// ─────────────────────────────────────────────────────────────────

const ApplySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is too short"),
  location: z.string().optional(),
  requestedRole: z.enum(["SALESPERSON", "SUB_SALES_AGENT", "SALES_AGENT"]),
  referrerCode: z.string().optional(),
  notes: z.string().optional(),
  inviteToken: z.string().optional(),
}).superRefine((data, ctx) => {
  if (
    (data.requestedRole === "SALES_AGENT" || data.requestedRole === "SUB_SALES_AGENT") &&
    !data.referrerCode &&
    !data.inviteToken
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Referrer Code (Parent) is required for Sales Agents and Sub Sales Agents",
      path: ["referrerCode"],
    })
  }
})

export async function submitApplication(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = ApplySchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { name, email, phone, location, requestedRole, referrerCode, notes, inviteToken } = parsed.data

  let referrerId = null
  let inviteTokenId: string | null = null

  // Validate invite token if provided
  if (inviteToken) {
    const validation = await validateInviteToken(inviteToken)
    if (!validation.valid) {
      return { error: { general: ["This invite link is invalid or has expired."] } }
    }
    inviteTokenId = validation.data!.id
    // If token has creator agent, use as referrer
    const tokenRecord = await (prisma as any).inviteToken.findUnique({ where: { token: inviteToken } })
    if (tokenRecord?.createdByAgentId) referrerId = tokenRecord.createdByAgentId
  } else if (referrerCode) {
    const referrer = await prisma.agent.findUnique({ where: { agentCode: referrerCode } })
    if (referrer) referrerId = referrer.id
  }

  // Check if they already applied
  const existing = await (prisma as any).recruitmentRequest.findFirst({
    where: { email, status: "PENDING" },
  })

  if (existing) {
    return { error: { general: ["You already have a pending application."] } }
  }

  // Create the request and mark token as used atomically
  await (prisma as any).$transaction(async (tx: any) => {
    const request = await tx.recruitmentRequest.create({
      data: {
        name,
        email,
        phone,
        location,
        requestedRole,
        referrerId,
        notes,
        inviteTokenId,
      },
    })

    if (inviteToken && inviteTokenId) {
      await tx.inviteToken.update({
        where: { id: inviteTokenId },
        data: { usedAt: new Date() },
      })
    }

    return request
  })

  return { success: true }
}

export async function getPendingApplications() {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  return (prisma as any).recruitmentRequest.findMany({
    where: { status: "PENDING" },
    include: {
      referrer: true,
      inviteToken: { select: { createdByUserId: true, roleForInvitee: true, commissionRate: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAllApplications() {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  return (prisma as any).recruitmentRequest.findMany({
    include: {
      referrer: true,
      inviteToken: { select: { createdByUserId: true, roleForInvitee: true, commissionRate: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function approveApplication(formData: FormData) {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  const id = formData.get("id") as string
  const agentCode = formData.get("agentCode") as string
  const commissionRate = parseFloat(formData.get("commissionRate") as string)
  const commissionType = (formData.get("commissionType") as string) || "PERCENTAGE"
  const parentId = (formData.get("parentId") as string) || null

  const application = await (prisma as any).recruitmentRequest.findUnique({
    where: { id },
    include: { referrer: true },
  })
  if (!application) return { error: "Application not found" }

  if (application.status !== "PENDING") return { error: "Application already processed" }

  // Check if agentCode is already taken
  const existingAgent = await prisma.agent.findUnique({ where: { agentCode } })
  if (existingAgent) {
    return { error: `Agent code "${agentCode}" is already in use.` }
  }

  // Check if user email already exists
  const existingUser = await prisma.user.findUnique({ where: { email: application.email } })
  if (existingUser) {
    return { error: `A user with email "${application.email}" already exists.` }
  }

  await (prisma as any).$transaction(async (tx: any) => {
    // 1. Mark as approved
    await tx.recruitmentRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    })

    // 2. Create Agent
    const agent = await tx.agent.create({
      data: {
        name: application.name,
        email: application.email,
        phone: application.phone,
        agentCode,
        type: application.requestedRole,
        parentId: parentId || application.referrerId || null,
        commissionType,
        commissionRate,
        isActive: true,
      },
    })

    // 3. Create User account with temporary password "solar123"
    const hashedPassword = await bcrypt.hash("solar123", 10)
    await tx.user.create({
      data: {
        name: application.name,
        email: application.email,
        password: hashedPassword,
        role: application.requestedRole === "SALESPERSON" ? "SALESPERSON" : "AGENT",
        agentId: agent.id,
      },
    })
  })

  revalidatePath("/dashboard/admin/recruitment")
  revalidatePath("/dashboard/agents")
  return { success: true }
}

export async function rejectApplication(id: string, note: string) {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  await (prisma as any).recruitmentRequest.update({
    where: { id },
    data: { status: "REJECTED", notes: note },
  })

  revalidatePath("/dashboard/admin/recruitment")
  return { success: true }
}
