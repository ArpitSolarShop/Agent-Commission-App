"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSessionOrThrow, requireRole, hasRole } from "@/lib/authorization"

const AgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  agentCode: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  type: z.enum(["CHANNEL_PARTNER", "SALESPERSON", "SUB_AGENT"]),
  parentId: z.string().optional().or(z.literal("")),
  commissionType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "TIERED"]).default("PERCENTAGE"),
  commissionRate: z.coerce.number().min(0),
  tiersJson: z.string().optional(),
})

export async function getAgents() {
  const user = await getSessionOrThrow()
  
  const where = hasRole(user, "ADMIN") 
    ? {} 
    : { parentId: user.agentId }

  return prisma.agent.findMany({
    where,
    include: {
      parent: { select: { name: true, agentCode: true } },
      _count: { select: { children: true, ownedLeads: true, commissions: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

async function getNextAgentCode() {
  const count = await prisma.agent.count()
  let nextNumber = count + 1
  let code = `AGT-${String(nextNumber).padStart(4, '0')}`
  
  // Ensure uniqueness even if some were deleted
  let exists = await prisma.agent.findUnique({ where: { agentCode: code } })
  while (exists) {
    nextNumber++
    code = `AGT-${String(nextNumber).padStart(4, '0')}`
    exists = await prisma.agent.findUnique({ where: { agentCode: code } })
  }
  
  return code
}

export async function getAgentById(id: string) {
  const user = await getSessionOrThrow()
  const role = user.role
  const agentId = user.agentId

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      parent: true,
      children: { include: { _count: { select: { ownedLeads: true } } } },
      ownedLeads: { take: 10, orderBy: { createdAt: "desc" }, include: { contacts: true } },
      commissions: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { deal: { select: { id: true, dealValue: true, status: true } } },
      },
      tiers: { orderBy: { volumeThreshold: "asc" } }
    },
  })

  if (!agent) return null

  if (role !== "ADMIN" && agentId) {
    if (agentId !== id && agent.parentId !== agentId) {
      throw new Error("Unauthorized to view this agent profile")
    }
  }

  return agent
}

export async function getAgentHierarchy() {
  return prisma.agent.findMany({
    select: {
      id: true,
      name: true,
      agentCode: true,
      type: true,
      parentId: true,
      commissionType: true,
      commissionRate: true,
      isActive: true,
      _count: { select: { ownedLeads: true, children: true } },
    },
    orderBy: { name: "asc" },
  })
}

export async function createAgent(formData: FormData) {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  const raw = Object.fromEntries(formData)
  const parsed = AgentSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { name, agentCode: providedCode, email, phone, type, parentId, commissionType, commissionRate, tiersJson } = parsed.data

  let agentCode = providedCode
  if (!agentCode) {
    agentCode = await getNextAgentCode()
  } else {
    // Check for duplicate code if one was provided
    const existing = await prisma.agent.findUnique({ where: { agentCode } })
    if (existing) {
      return { error: { agentCode: ["Agent code already exists"] } }
    }
  }

  let parsedTiers = []
  if (commissionType === "TIERED" && tiersJson) {
    parsedTiers = JSON.parse(tiersJson)
  }

  await prisma.agent.create({
    data: {
      name,
      agentCode,
      email: email || null,
      phone: phone || null,
      type,
      parentId: parentId || null,
      commissionType,
      commissionRate,
      tiers: commissionType === "TIERED" && parsedTiers.length > 0 ? {
        create: parsedTiers.map((t: { volumeThreshold: number | string; rate: number | string }) => ({
          volumeThreshold: Number(t.volumeThreshold),
          rate: Number(t.rate)
        }))
      } : undefined
    },
  })

  revalidatePath("/dashboard/agents")
  return { success: true }
}

export async function updateAgent(id: string, formData: FormData) {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  const raw = Object.fromEntries(formData)
  const parsed = AgentSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { name, agentCode, email, phone, type, parentId, commissionType, commissionRate, tiersJson } = parsed.data

  let parsedTiers = []
  if (commissionType === "TIERED" && tiersJson) {
    parsedTiers = JSON.parse(tiersJson)
  }

  // Check for duplicate code (excluding current agent)
  const existing = await prisma.agent.findFirst({
    where: { agentCode, NOT: { id } },
  })
  if (existing) {
    return { error: { agentCode: ["Agent code already exists"] } }
  }

  await prisma.agent.update({
    where: { id },
    data: {
      name,
      agentCode,
      email: email || null,
      phone: phone || null,
      type,
      parentId: parentId || null,
      commissionType,
      commissionRate,
      tiers: commissionType === "TIERED" ? {
        deleteMany: {},
        create: parsedTiers.map((t: { volumeThreshold: number | string; rate: number | string }) => ({
          volumeThreshold: Number(t.volumeThreshold),
          rate: Number(t.rate)
        }))
      } : { deleteMany: {} }
    },
  })

  revalidatePath("/dashboard/agents")
  revalidatePath(`/dashboard/agents/${id}`)
  return { success: true }
}

export async function toggleAgentStatus(id: string) {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  const agent = await prisma.agent.findUnique({ where: { id } })
  if (!agent) return { error: "Agent not found" }

  await prisma.agent.update({
    where: { id },
    data: { isActive: !agent.isActive },
  })

  revalidatePath("/dashboard/agents")
  return { success: true }
}
