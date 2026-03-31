import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { LeadForm } from "../lead-form"

export default async function NewLeadPage() {
  const session = await auth()

  const agents = await prisma.agent.findMany({
    where: { isActive: true },
    select: { id: true, name: true, agentCode: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Submit New Lead</h1>
      <LeadForm 
        agents={agents} 
        defaultOwnerId={session?.user?.agentId ?? undefined} 
        role={session?.user?.role ?? "AGENT"}
      />
    </div>
  )
}
