import { prisma } from "@/lib/prisma"
import { AgentForm } from "../agent-form"

export default async function NewAgentPage() {
  const allAgents = await prisma.agent.findMany({
    select: { id: true, name: true, agentCode: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add New Agent</h1>
      <AgentForm allAgents={allAgents} />
    </div>
  )
}
