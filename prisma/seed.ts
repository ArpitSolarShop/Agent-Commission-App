import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding Database...")

  // Clean DB
  await prisma.deal.deleteMany()
  await prisma.leadContact.deleteMany()
  await prisma.leadActivity.deleteMany()
  await prisma.leadAssignment.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.commission.deleteMany()
  await prisma.payout.deleteMany()
  await prisma.user.deleteMany()
  await prisma.agent.deleteMany()

  const passwordHash = await bcrypt.hash("password123", 10)

  // 1. Create ADMIN
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin Super",
      email: "admin@company.com",
      password: passwordHash,
      role: "ADMIN",
    },
  })

  // 2. Create AGENT HIERARCHY
  // Level 1: Salesperson (Highest)
  const salespersonAgent = await prisma.agent.create({
    data: {
      name: "Sahil (Salesperson)",
      agentCode: "SAHIL-001",
      email: "sahil@company.com",
      type: "SALESPERSON",
      commissionRate: 1.0, // Override rate
      user: {
        create: {
          name: "Sahil",
          email: "sahil_sales@company.com",
          password: passwordHash,
          role: "SALESPERSON",
        },
      },
    },
  })

  // Level 2: Channel Partner (Middle)
  const channelPartnerAgent = await prisma.agent.create({
    data: {
      name: "Ramesh (Channel Partner)",
      agentCode: "RAMESH-002",
      email: "ramesh@partner.com",
      type: "CHANNEL_PARTNER",
      commissionRate: 2.0, // Override rate
      parentId: salespersonAgent.id,
      user: {
        create: {
          name: "Ramesh",
          email: "ramesh_channel@company.com",
          password: passwordHash,
          role: "AGENT",
        },
      },
    },
  })

  // Level 3: Sub-Agent (Lowest - Originator)
  const subAgent = await prisma.agent.create({
    data: {
      name: "Karan (Sub Agent)",
      agentCode: "KARAN-003",
      email: "karan@sub.com",
      type: "SUB_AGENT",
      commissionRate: 5.0, // Base agent rate (gets 5%)
      parentId: channelPartnerAgent.id,
      user: {
        create: {
          name: "Karan",
          email: "karan_sub@company.com",
          password: passwordHash,
          role: "AGENT",
        },
      },
    },
  })

  // 3. Create a Lead owned by Sub-Agent
  await prisma.lead.create({
    data: {
      name: "Ravi Sharma",
      location: "Delhi NCR, North India",
      sourceType: "AGENT",
      ownerId: subAgent.id,
      status: "NEW",
      contacts: {
        create: [
          { phoneNumber: "9876543210", isPrimary: true, label: "Personal" },
        ],
      },
      assignments: {
        create: [
          { agentId: salespersonAgent.id, assignedBy: adminUser.id },
        ],
      },
    },
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
