"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/auth"

const AgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  agentCode: z.string().min(1, "Agent code is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  type: z.enum(["CHANNEL_PARTNER", "SALESPERSON", "SUB_AGENT"]),
  parentId: z.string().optional().or(z.literal("")),
  commissionType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).default("PERCENTAGE"),
  commissionRate: z.coerce.number().min(0),
})

export async function getAgents() {
  return prisma.agent.findMany({
    include: {
      parent: { select: { name: true, agentCode: true } },
      _count: { select: { children: true, ownedLeads: true, commissions: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAgentById(id: string) {
  const session = await auth()
  const role = session?.user?.role
  const agentId = session?.user?.agentId

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
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Only Administrators can create agents")

  const raw = Object.fromEntries(formData)
  const parsed = AgentSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { name, agentCode, email, phone, type, parentId, commissionType, commissionRate } = parsed.data

  // Check for duplicate code
  const existing = await prisma.agent.findUnique({ where: { agentCode } })
  if (existing) {
    return { error: { agentCode: ["Agent code already exists"] } }
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
    },
  })

  revalidatePath("/dashboard/agents")
  return { success: true }
}

export async function updateAgent(id: string, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Only Administrators can update agents")

  const raw = Object.fromEntries(formData)
  const parsed = AgentSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { name, agentCode, email, phone, type, parentId, commissionType, commissionRate } = parsed.data

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
    },
  })

  revalidatePath("/dashboard/agents")
  revalidatePath(`/dashboard/agents/${id}`)
  return { success: true }
}

export async function toggleAgentStatus(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Only Administrators can toggle agent status")

  const agent = await prisma.agent.findUnique({ where: { id } })
  if (!agent) return { error: "Agent not found" }

  await prisma.agent.update({
    where: { id },
    data: { isActive: !agent.isActive },
  })

  revalidatePath("/dashboard/agents")
  return { success: true }
}
