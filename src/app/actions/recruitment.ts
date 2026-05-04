"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getSessionOrThrow, requireRole } from "@/lib/authorization"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

const ApplySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is too short"),
  location: z.string().optional(),
  requestedRole: z.enum(["SALESPERSON", "SUB_SALES_AGENT", "SALES_AGENT"]),
  referrerCode: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if ((data.requestedRole === "SALES_AGENT" || data.requestedRole === "SUB_SALES_AGENT") && !data.referrerCode) {
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

  const { name, email, phone, location, requestedRole, referrerCode, notes } = parsed.data

  let referrerId = null
  if (referrerCode) {
    const referrer = await prisma.agent.findUnique({
      where: { agentCode: referrerCode }
    })
    if (referrer) referrerId = referrer.id
  }

  // Check if they already applied
  const existing = await (prisma as any).recruitmentRequest.findFirst({
    where: { email, status: "PENDING" }
  })
  
  if (existing) {
    return { error: { general: ["You already have a pending application."] } }
  }

  // Create the request
  await (prisma as any).recruitmentRequest.create({
    data: {
      name,
      email,
      phone,
      location,
      requestedRole,
      referrerId,
      notes,
    }
  })

  return { success: true }
}

export async function getPendingApplications() {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  return (prisma as any).recruitmentRequest.findMany({
    where: { status: "PENDING" },
    include: { referrer: true },
    orderBy: { createdAt: "desc" }
  })
}

export async function approveApplication(formData: FormData) {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  const id = formData.get("id") as string
  const agentCode = formData.get("agentCode") as string
  const commissionRate = parseFloat(formData.get("commissionRate") as string)
  const commissionType = formData.get("commissionType") as string || "PERCENTAGE"
  const parentId = formData.get("parentId") as string || null

  const application = await (prisma as any).recruitmentRequest.findUnique({ where: { id } })
  if (!application) return { error: "Application not found" }
  
  if (application.status !== "PENDING") return { error: "Application already processed" }

  // Check if agentCode is already taken
  const existingAgent = await prisma.agent.findUnique({
    where: { agentCode }
  })
  if (existingAgent) {
    return { error: `Agent code "${agentCode}" is already in use.` }
  }

  // Create Agent and User
  await (prisma as any).$transaction(async (tx: any) => {
    // 1. Mark as approved
    await tx.recruitmentRequest.update({
      where: { id },
      data: { status: "APPROVED" }
    })

    // 2. Create Agent
    const agent = await tx.agent.create({
      data: {
        name: application.name,
        email: application.email,
        phone: application.phone,
        agentCode,
        type: application.requestedRole,
        parentId: parentId || null,
        commissionType,
        commissionRate,
        isActive: true,
      }
    })

    // 3. Create User account with a temporary password (e.g., 'solar123')
    const hashedPassword = await bcrypt.hash("solar123", 10)
    await tx.user.create({
      data: {
        name: application.name,
        email: application.email,
        password: hashedPassword,
        role: application.requestedRole === "SALESPERSON" ? "SALESPERSON" : "AGENT",
        agentId: agent.id,
      }
    })
  })

  revalidatePath("/dashboard/admin/recruitment")
  revalidatePath("/dashboard/agents/hierarchy")
  revalidatePath("/dashboard/agents")
  return { success: true }
}

export async function rejectApplication(id: string, note: string) {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  await (prisma as any).recruitmentRequest.update({
    where: { id },
    data: { status: "REJECTED", notes: note }
  })

  revalidatePath("/dashboard/admin/recruitment")
  return { success: true }
}
