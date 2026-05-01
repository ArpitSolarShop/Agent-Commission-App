"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSessionOrThrow, requireLeadAccess, hasRole, getSubtreeAgentIds } from "@/lib/authorization"

const LeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional().or(z.literal("")),
  sourceType: z.enum(["AGENT", "SALESPERSON", "DIRECT"]),
  ownerId: z.string().min(1, "Owner is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  customerType: z.enum(["RESIDENTIAL", "COMMERCIAL"]).optional().or(z.literal("")),
})

// ── Duplicate Detection ──
export async function checkDuplicatePhone(phone: string) {
  const existing = await prisma.leadContact.findUnique({
    where: { phoneNumber: phone },
    include: {
      lead: {
        select: { id: true, name: true, owner: { select: { name: true, agentCode: true } } },
      },
    },
  })

  if (existing) {
    return {
      isDuplicate: true,
      existingLead: existing.lead,
    }
  }
  return { isDuplicate: false }
}

export async function getLeads(filters?: { agentId?: string; status?: string }) {
  const user = await getSessionOrThrow()
  const where: any = {}
  
  if (!hasRole(user, "ADMIN")) {
    // Non-admins only see leads in their subtree or explicitly assigned
    const agentId = user.agentId
    if (agentId) {
      const subtreeIds = await getSubtreeAgentIds(agentId)
      where.OR = [
        { ownerId: { in: subtreeIds } },
        { assignments: { some: { agentId } } }
      ]
    } else {
      // No agent linked, can only see explicitly assigned leads if any (should be none)
      where.id = "none" 
    }
  } else if (filters?.agentId) {
    // Admin filtering by a specific agent
    where.OR = [
      { ownerId: filters.agentId },
      { assignments: { some: { agentId: filters.agentId } } }
    ]
  }
  
  if (filters?.status) where.status = filters.status

  return prisma.lead.findMany({
    where,
    include: {
      owner: { select: { name: true, agentCode: true } },
      contacts: { select: { phoneNumber: true, isPrimary: true, label: true } },
      _count: { select: { deals: true } },
      assignments: { select: { agentId: true } }
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getLeadById(id: string) {
  const user = await getSessionOrThrow()
  await requireLeadAccess(user, id, "OWNER", "ASSIGNED", "ANCESTOR")

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      owner: true,
      contacts: true,
      assignments: { include: { agent: { select: { name: true, agentCode: true } } } },
      deals: {
        include: {
          commissions: { include: { agent: { select: { name: true } } } },
        },
      },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  })

  if (!lead) return null

  return lead
}

export async function createLead(formData: FormData) {
  const user = await getSessionOrThrow()
  const raw = Object.fromEntries(formData)
  const parsed = LeadSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { name, email, location, notes, sourceType, ownerId, phoneNumber, customerType } = parsed.data

  // Check duplicate phone
  const dupCheck = await checkDuplicatePhone(phoneNumber)
  if (dupCheck.isDuplicate) {
    return {
      error: {
        phoneNumber: [`This phone already belongs to lead "${dupCheck.existingLead!.name}" (owned by ${dupCheck.existingLead!.owner.name})`],
      },
    }
  }

  const lead = await prisma.lead.create({
    data: {
      name,
      email: email || null,
      location,
      notes: notes || null,
      customerType: customerType || null,
      sourceType,
      ownerId,
      contacts: {
        create: [{ phoneNumber, isPrimary: true, label: "Primary" }],
      },
    },
  })

  // ── Automatic Assignment up the Hierarchy ──
  // If the owner has parents, assign the lead to them automatically
  let currentAgent = await prisma.agent.findUnique({
    where: { id: ownerId },
    select: { parentId: true }
  })

  while (currentAgent?.parentId) {
    await prisma.leadAssignment.create({
      data: {
        leadId: lead.id,
        agentId: currentAgent.parentId,
        assignedBy: ownerId, // Assigned by the originator
      }
    })

    // Move up
    currentAgent = await prisma.agent.findUnique({
      where: { id: currentAgent.parentId },
      select: { parentId: true }
    })
  }

  // Log activity
  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      type: "CREATED",
      newValue: `Lead submitted via ${sourceType}. Auto-assigned to parent managers.`,
      byUserId: ownerId,
    },
  })

  revalidatePath("/dashboard/leads")
  return { success: true, leadId: lead.id }
}

export async function updateLeadStatus(leadId: string, status: string, userId: string) {
  const user = await getSessionOrThrow()
  await requireLeadAccess(user, leadId, "OWNER", "ASSIGNED", "ANCESTOR")
  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) return { error: "Lead not found" }

  const oldStatus = lead.status

  await prisma.lead.update({
    where: { id: leadId },
    data: { status },
  })

  await prisma.leadActivity.create({
    data: {
      leadId,
      type: "STATUS_CHANGE",
      oldValue: oldStatus,
      newValue: status,
      byUserId: userId,
    },
  })

  revalidatePath(`/dashboard/leads/${leadId}`)
  revalidatePath("/dashboard/leads")
  return { success: true }
}

export async function addLeadContact(leadId: string, formData: FormData) {
  const user = await getSessionOrThrow()
  await requireLeadAccess(user, leadId, "OWNER", "ASSIGNED", "ANCESTOR")
  const phoneNumber = formData.get("phoneNumber") as string
  const label = formData.get("label") as string

  if (!phoneNumber || phoneNumber.length < 10) {
    return { error: "Valid phone number required" }
  }

  const dupCheck = await checkDuplicatePhone(phoneNumber)
  if (dupCheck.isDuplicate) {
    return { error: `Phone already belongs to lead "${dupCheck.existingLead!.name}"` }
  }

  await prisma.leadContact.create({
    data: { leadId, phoneNumber, label: label || null },
  })

  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}

export async function assignLead(leadId: string, agentId: string, assignedBy: string) {
  const user = await getSessionOrThrow()
  await requireLeadAccess(user, leadId, "OWNER", "ANCESTOR") // Only owners and ancestors can assign
  await prisma.leadAssignment.create({
    data: { leadId, agentId, assignedBy },
  })

  await prisma.leadActivity.create({
    data: {
      leadId,
      type: "ASSIGNED",
      newValue: agentId,
      byUserId: assignedBy,
    },
  })

  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}
