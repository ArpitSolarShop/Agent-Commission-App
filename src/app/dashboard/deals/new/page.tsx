import { prisma } from "@/lib/prisma"
import { DealForm } from "../deal-form"

export default async function NewDealPage({ searchParams }: { searchParams: Promise<{ leadId?: string }> }) {
  const { leadId } = await searchParams

  const leads = await prisma.lead.findMany({
    where: { status: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create New Deal</h1>
      <DealForm leads={leads} defaultLeadId={leadId} />
    </div>
  )
}
