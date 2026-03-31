"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Users, ChevronRight } from "lucide-react"
import { useState } from "react"

interface AgentNode {
  id: string
  name: string
  agentCode: string
  type: string
  parentId: string | null
  commissionRate: number
  isActive: boolean
  _count: { ownedLeads: number; children: number }
}

function TreeNode({ agent, childrenMap }: { agent: AgentNode; childrenMap: Map<string | null, AgentNode[]> }) {
  const [expanded, setExpanded] = useState(true)
  const children = childrenMap.get(agent.id) || []

  const typeColors: Record<string, string> = {
    SALESPERSON: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    CHANNEL_PARTNER: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    SUB_AGENT: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
  }

  return (
    <div className="ml-6 border-l border-zinc-200 dark:border-zinc-800 pl-4">
      <div className="flex items-center gap-2 py-2 group">
        {children.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        )}
        {children.length === 0 && <span className="w-5" />}

        <Link
          href={`/dashboard/agents/${agent.id}`}
          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex-1"
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {agent.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{agent.name}</div>
            <div className="text-xs text-zinc-500">{agent.agentCode} · {agent.commissionRate}%</div>
          </div>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${typeColors[agent.type] || ""}`}>
            {agent.type.replace("_", " ")}
          </span>
          {agent._count.ownedLeads > 0 && (
            <span className="text-xs text-zinc-400">{agent._count.ownedLeads} leads</span>
          )}
          {!agent.isActive && <Badge variant="destructive" className="text-[10px]">Inactive</Badge>}
        </Link>
      </div>

      {expanded && children.map((child) => (
        <TreeNode key={child.id} agent={child} childrenMap={childrenMap} />
      ))}
    </div>
  )
}

export function HierarchyTree({ agents }: { agents: AgentNode[] }) {
  // Build parent->children map
  const childrenMap = new Map<string | null, AgentNode[]>()
  for (const agent of agents) {
    const key = agent.parentId
    if (!childrenMap.has(key)) childrenMap.set(key, [])
    childrenMap.get(key)!.push(agent)
  }

  const roots = childrenMap.get(null) || []

  if (roots.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-400">
          <Users className="h-12 w-12 mb-4" />
          <p>No agents in the hierarchy yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {roots.map((root) => (
          <TreeNode key={root.id} agent={root} childrenMap={childrenMap} />
        ))}
      </CardContent>
    </Card>
  )
}
