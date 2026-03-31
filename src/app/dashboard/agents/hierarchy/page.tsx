import { getAgentHierarchy } from "@/app/actions/agents"
import { HierarchyTree } from "./hierarchy-tree"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function HierarchyPage() {
  const agents = await getAgentHierarchy()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Hierarchy</h1>
          <p className="text-sm text-zinc-500">Visual view of your agent network tree.</p>
        </div>
      </div>
      <HierarchyTree agents={agents} />
    </div>
  )
}
