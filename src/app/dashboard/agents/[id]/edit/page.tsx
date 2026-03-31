import { prisma } from "@/lib/prisma"
import { getAgentById } from "@/app/actions/agents"
import { notFound } from "next/navigation"
import { AgentForm } from "../../agent-form"

export default async function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agent = await getAgentById(id)

  if (!agent) notFound()

  const allAgents = await prisma.agent.findMany({
    select: { id: true, name: true, agentCode: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Agent: {agent.name}</h1>
      <AgentForm agent={agent} allAgents={allAgents} />
    </div>
  )
}
