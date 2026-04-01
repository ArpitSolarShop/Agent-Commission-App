"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/auth"

const DealSchema = z.object({
  leadId: z.string().min(1),
  dealValue: z.coerce.number().positive("Deal value must be positive"),
  category: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

// ── COMMISSION ENGINE: Graph Traversal ──
async function getActiveRate(agentId: string, baseRate: number, commissionType: string, newDealValue: number) {
  if (commissionType !== "TIERED") return baseRate
  
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const volumeAgg = await prisma.deal.aggregate({
    where: {
      status: "CLOSED_WON",
      closedAt: { gte: startOfMonth },
      commissions: { some: { agentId } }
    },
    _sum: { dealValue: true }
  })
  
  const currentVolume = (volumeAgg._sum.dealValue || 0) + newDealValue
  
  const tiers = await prisma.commissionTier.findMany({
    where: { agentId },
    orderBy: { volumeThreshold: "desc" }
  })
  
  for (const tier of tiers) {
    if (currentVolume >= tier.volumeThreshold) return tier.rate
  }
  
  return baseRate
}

async function calculateCommissions(dealId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { lead: { include: { owner: true } } },
  })

  if (!deal || !deal.lead) throw new Error("Deal or Lead not found")

  const commissions: { agentId: string; role: string; commissionType: string; rate: number; amount: number }[] = []
  const visited = new Set<string>() // Cycle prevention

  // 1. OWNER commission — the agent who submitted the lead
  const owner = deal.lead.owner
  const ownerRate = await getActiveRate(owner.id, owner.commissionRate, owner.commissionType, deal.dealValue)

  commissions.push({
    agentId: owner.id,
    role: "OWNER",
    commissionType: owner.commissionType,
    rate: ownerRate,
    amount: owner.commissionType === "FIXED_AMOUNT" 
      ? ownerRate 
      : (deal.dealValue * ownerRate) / 100,
  })
  visited.add(owner.id)

  // 2. Walk UP the hierarchy for OVERRIDE commissions
  let currentAgentId = owner.parentId

  while (currentAgentId) {
    if (visited.has(currentAgentId)) break // Cycle guard

    const parentAgent = await prisma.agent.findUnique({
      where: { id: currentAgentId },
    })

    if (!parentAgent) break

    visited.add(parentAgent.id)

    const parentRate = await getActiveRate(parentAgent.id, parentAgent.commissionRate, parentAgent.commissionType, deal.dealValue)

    commissions.push({
      agentId: parentAgent.id,
      role: "OVERRIDE",
      commissionType: parentAgent.commissionType,
      rate: parentRate,
      amount: parentAgent.commissionType === "FIXED_AMOUNT"
        ? parentRate
        : (deal.dealValue * parentRate) / 100,
    })

    currentAgentId = parentAgent.parentId
  }

  // 3. Persist all commissions in a transaction
  await prisma.$transaction(
    commissions.map((c) =>
      prisma.commission.upsert({
        where: {
          dealId_agentId_role: {
            dealId,
            agentId: c.agentId,
            role: c.role,
          },
        },
        update: {
          commissionType: c.commissionType,
          rate: c.rate,
          amount: c.amount,
        },
        create: {
          dealId,
          agentId: c.agentId,
          role: c.role,
          commissionType: c.commissionType,
          rate: c.rate,
          amount: c.amount,
          status: "PENDING",
        },
      })
    )
  )

  return commissions
}

export async function getDeals() {
  return prisma.deal.findMany({
    include: {
      lead: {
        select: { name: true, owner: { select: { name: true, agentCode: true } } },
      },
      _count: { select: { commissions: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getDealById(id: string) {
  const session = await auth()
  const role = session?.user?.role
  const agentId = session?.user?.agentId

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      lead: {
        include: {
          owner: true,
          contacts: { where: { isPrimary: true } },
          assignments: true,
        },
      },
      commissions: {
        include: {
          agent: { select: { id: true, name: true, agentCode: true, type: true } },
          payout: true,
        },
        orderBy: { role: "asc" },
      },
    },
  })

  if (!deal) return null

  if (role !== "ADMIN" && agentId) {
    const isOwner = deal.lead.ownerId === agentId
    const isAssigned = deal.lead.assignments.some(a => a.agentId === agentId)
    if (!isOwner && !isAssigned) throw new Error("Unauthorized to access this deal")
  }

  return deal
}

export async function createDeal(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = DealSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { leadId, dealValue, category, notes } = parsed.data

  const deal = await prisma.deal.create({
    data: {
      leadId,
      dealValue,
      category: category || null,
      notes: notes || null,
      status: "OPEN",
    },
  })

  revalidatePath("/dashboard/deals")
  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true, dealId: deal.id }
}

export async function updateDealStatus(dealId: string, status: string) {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } })
  if (!deal) return { error: "Deal not found" }

  const updateData: any = { status }

  if (status === "CLOSED_WON") {
    updateData.closedAt = new Date()

    // Update deal first
    await prisma.deal.update({ where: { id: dealId }, data: updateData })

    // Trigger commission engine
    const commissions = await calculateCommissions(dealId)

    // Also update the lead status
    await prisma.lead.update({
      where: { id: deal.leadId },
      data: { status: "CLOSED_WON" },
    })

    revalidatePath("/dashboard/deals")
    revalidatePath(`/dashboard/deals/${dealId}`)
    revalidatePath("/dashboard/commissions")
    return { success: true, commissionsGenerated: commissions.length }
  }

  if (status === "CLOSED_LOST") {
    updateData.closedAt = new Date()
    await prisma.deal.update({ where: { id: dealId }, data: updateData })
    await prisma.lead.update({ where: { id: deal.leadId }, data: { status: "CLOSED_LOST" } })
  } else {
    await prisma.deal.update({ where: { id: dealId }, data: updateData })
  }

  revalidatePath("/dashboard/deals")
  revalidatePath(`/dashboard/deals/${dealId}`)
  return { success: true }
}

export async function approveCommission(commissionId: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Only Administrators can approve commissions")

  await prisma.commission.update({
    where: { id: commissionId },
    data: { status: "APPROVED" },
  })
  revalidatePath("/dashboard/commissions")
  return { success: true }
}

export async function disputeCommission(commissionId: string, note: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Only Administrators can dispute commissions")

  await prisma.commission.update({
    where: { id: commissionId },
    data: { status: "DISPUTED", disputeNote: note },
  })
  revalidatePath("/dashboard/commissions")
  return { success: true }
}

export async function recordPayout(commissionId: string, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Only Administrators can record payouts")

  const method = formData.get("method") as string
  const reference = formData.get("reference") as string
  const paidBy = formData.get("paidBy") as string

  const commission = await prisma.commission.findUnique({ where: { id: commissionId } })
  if (!commission) return { error: "Commission not found" }

  await prisma.$transaction([
    prisma.payout.create({
      data: {
        commissionId,
        agentId: commission.agentId,
        amount: commission.amount,
        method: method || null,
        reference: reference || null,
        paidBy: paidBy || session.user.name || "admin",
      },
    }),
    prisma.commission.update({
      where: { id: commissionId },
      data: { status: "PAID" },
    }),
  ])

  revalidatePath("/dashboard/commissions")
  return { success: true }
}

export async function getCommissions(filters?: { agentId?: string; status?: string }) {
  const where: any = {}
  if (filters?.agentId) where.agentId = filters.agentId
  if (filters?.status) where.status = filters.status

  return prisma.commission.findMany({
    where,
    include: {
      agent: { select: { id: true, name: true, agentCode: true } },
      deal: {
        select: {
          id: true,
          dealValue: true,
          status: true,
          lead: { select: { name: true } },
        },
      },
      payout: true,
    },
    orderBy: { createdAt: "desc" },
  })
}
