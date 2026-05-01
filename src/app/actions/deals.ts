"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSessionOrThrow, requireDealAccess, requireLeadAccess, hasRole, getSubtreeAgentIds, requireRole } from "@/lib/authorization"

const DealSchema = z.object({
  leadId: z.string().min(1),
  name: z.string().optional().or(z.literal("")),
  dealValue: z.coerce.number().positive("Deal value must be positive"),
  originalPrice: z.coerce.number().optional().or(z.literal("")),
  discount: z.coerce.number().optional().or(z.literal("")),
  expectedCloseDate: z.string().optional().or(z.literal("")),
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
  const user = await getSessionOrThrow()
  const where: any = {}
  
  if (!hasRole(user, "ADMIN")) {
    const agentId = user.agentId
    if (agentId) {
      const subtreeIds = await getSubtreeAgentIds(agentId)
      where.lead = {
        OR: [
          { ownerId: { in: subtreeIds } },
          { assignments: { some: { agentId } } }
        ]
      }
    } else {
      where.id = "none"
    }
  }

  return prisma.deal.findMany({
    where,
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
  const user = await getSessionOrThrow()
  await requireDealAccess(user, id, "OWNER", "ASSIGNED", "ANCESTOR")

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

  return deal
}

export async function createDeal(formData: FormData) {
  const user = await getSessionOrThrow()
  const raw = Object.fromEntries(formData)
  const parsed = DealSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { leadId, dealValue, category, notes, name, originalPrice, discount, expectedCloseDate } = parsed.data

  await requireLeadAccess(user, leadId, "OWNER", "ASSIGNED", "ANCESTOR")

  let dealName = name
  if (!dealName) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { name: true } })
    if (lead) {
      dealName = `${lead.name}'s Project`
    }
  }

  const deal = await (prisma.deal as any).create({
    data: {
      leadId,
      name: dealName || "New Project",
      dealValue,
      originalPrice: originalPrice ? Number(originalPrice) : null,
      discount: discount ? Number(discount) : 0,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      category: category || null,
      notes: notes || null,
      status: "NEW_QUALIFIED",
    },
  })

  revalidatePath("/dashboard/deals")
  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true, dealId: deal.id }
}

export async function updateDealDocuments(dealId: string, docs: { quotationUrl?: string; proposalUrl?: string; agreementUrl?: string; surveyReportUrl?: string }) {
  const user = await getSessionOrThrow()
  await requireDealAccess(user, dealId, "OWNER", "ASSIGNED", "ANCESTOR")

  await (prisma.deal as any).update({
    where: { id: dealId },
    data: docs,
  })

  revalidatePath(`/dashboard/deals/${dealId}`)
  return { success: true }
}

export async function updateDealStatus(dealId: string, status: string) {
  const user = await getSessionOrThrow()
  await requireDealAccess(user, dealId, "OWNER", "ASSIGNED", "ANCESTOR")

  const deal = await prisma.deal.findUnique({ where: { id: dealId } })
  if (!deal) return { error: "Deal not found" }

  const updateData: { status: string; closedAt?: Date } = { status }

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
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  await prisma.commission.update({
    where: { id: commissionId },
    data: { status: "APPROVED" },
  })
  revalidatePath("/dashboard/commissions")
  return { success: true }
}

export async function disputeCommission(commissionId: string, note: string) {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

  await prisma.commission.update({
    where: { id: commissionId },
    data: { status: "DISPUTED", disputeNote: note },
  })
  revalidatePath("/dashboard/commissions")
  return { success: true }
}

export async function recordPayout(commissionId: string, formData: FormData) {
  const user = await getSessionOrThrow()
  requireRole(user, "ADMIN")

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
        paidBy: paidBy || user.name || "admin",
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
  const user = await getSessionOrThrow()
  const where: { agentId?: string; status?: string } = {}
  
  if (!hasRole(user, "ADMIN")) {
    // Non-admins can only see their own commissions
    where.agentId = user.agentId
  } else if (filters?.agentId) {
    where.agentId = filters.agentId
  }
  
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
