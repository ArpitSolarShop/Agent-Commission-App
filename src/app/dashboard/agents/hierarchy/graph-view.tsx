"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionLineType,
  BackgroundVariant,
  Panel,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { AgentNode, AgentNodeData } from "./AgentNode"
import { getLayoutedElements } from "./useLayout"

interface RawAgent {
  id: string
  name: string
  agentCode: string
  type: string
  parentId: string | null
  commissionType: string
  commissionRate: number
  isActive: boolean
  _count: { ownedLeads: number; children: number }
}

const nodeTypes = {
  agentNode: AgentNode,
}

export function GraphView({ agents }: { agents: RawAgent[] }) {
  const router = useRouter()
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [isLayouting, setIsLayouting] = useState(true)

  const handleNodeClick = useCallback(
    (id: string) => {
      router.push(`/dashboard/agents/${id}`)
    },
    [router]
  )

  useEffect(() => {
    if (agents.length === 0) return

    const initialNodes: Node[] = agents.map((agent) => ({
      id: agent.id,
      type: "agentNode",
      position: { x: 0, y: 0 },
      data: {
        ...agent,
        onView: handleNodeClick,
      } as AgentNodeData,
      // Initially hide to prevent flash of stacked nodes before layout
      style: { opacity: 0 },
    }))

    const initialEdges: Edge[] = agents
      .filter((agent) => agent.parentId)
      .map((agent) => ({
        id: `e-${agent.parentId}-${agent.id}`,
        source: agent.parentId!,
        target: agent.id,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#a1a1aa", strokeWidth: 2 }, // zinc-400
      }))

    setIsLayouting(true)

    getLayoutedElements(initialNodes, initialEdges).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
      setIsLayouting(false)
    })
  }, [agents, handleNodeClick, setNodes, setEdges])

  if (agents.length === 0) {
    return (
      <Card className="h-[600px] flex flex-col items-center justify-center text-zinc-400">
        <Users className="h-12 w-12 mb-4" />
        <p>No agents in the hierarchy yet.</p>
      </Card>
    )
  }

  return (
    <Card className="h-[700px] w-full border-zinc-200 dark:border-zinc-800 overflow-hidden relative shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
        className="bg-zinc-50/50 dark:bg-zinc-900/50"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e4e4e7" />
        <Controls showInteractive={false} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-md rounded-lg overflow-hidden" />
        
        <Panel position="top-left" className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            <span>Total Agents: {agents.length}</span>
          </div>
          {isLayouting && <div className="text-xs text-blue-500 mt-1 animate-pulse">Calculating optimal layout...</div>}
        </Panel>
      </ReactFlow>
    </Card>
  )
}

