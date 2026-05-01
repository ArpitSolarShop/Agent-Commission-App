"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Users, ZoomIn, ZoomOut, Maximize } from "lucide-react"

interface AgentNode {
  id: string
  name: string
  agentCode: string
  type: string
  parentId: string | null
  commissionType: string
  commissionRate: number
  isActive: boolean
  _count: { ownedLeads: number; children: number }
  // Layout coordinates (computed)
  x?: number
  y?: number
  width?: number
  height?: number
  depth?: number
  isHovered?: boolean
}

interface Point {
  x: number
  y: number
}

const TYPE_COLORS: Record<string, string> = {
  SALESPERSON: "#3b82f6", // blue-500
  CHANNEL_PARTNER: "#a855f7", // purple-500
  SUB_AGENT: "#71717a", // zinc-500
}

const TYPE_BG: Record<string, string> = {
  SALESPERSON: "#eff6ff", // blue-50
  CHANNEL_PARTNER: "#faf5ff", // purple-50
  SUB_AGENT: "#f4f4f5", // zinc-50
}

const NODE_WIDTH = 200
const NODE_HEIGHT = 80
const LEVEL_HEIGHT = 150
const SIBLING_SPACING = 30

export function GraphView({ agents }: { agents: AgentNode[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 })
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  
  // Build tree and calculate layout
  const [nodes, setNodes] = useState<AgentNode[]>([])
  
  useEffect(() => {
    if (agents.length === 0) return
    
    // 1. Build hierarchy map
    const childrenMap = new Map<string | null, AgentNode[]>()
    for (const agent of agents) {
      const key = agent.parentId
      if (!childrenMap.has(key)) childrenMap.set(key, [])
      childrenMap.get(key)!.push({ ...agent }) // clone
    }
    
    const roots = childrenMap.get(null) || []
    const layoutNodes: AgentNode[] = []
    
    // 2. Simple layout algorithm
    let currentX = 0
    
    const assignCoordinates = (node: AgentNode, depth: number): number => {
      node.depth = depth
      node.y = depth * LEVEL_HEIGHT + 50
      
      const children = childrenMap.get(node.id) || []
      
      if (children.length === 0) {
        // Leaf node
        node.x = currentX
        currentX += NODE_WIDTH + SIBLING_SPACING
        layoutNodes.push(node)
        return node.x
      }
      
      // Node with children - center above children
      let minX = Infinity
      let maxX = -Infinity
      
      for (const child of children) {
        const childX = assignCoordinates(child, depth + 1)
        minX = Math.min(minX, childX)
        maxX = Math.max(maxX, childX)
      }
      
      node.x = (minX + maxX) / 2
      layoutNodes.push(node)
      return node.x
    }
    
    // Layout all roots
    for (const root of roots) {
      assignCoordinates(root, 0)
      currentX += SIBLING_SPACING * 2 // Extra space between separate trees
    }
    
    // 3. Center the graph initially
    if (layoutNodes.length > 0 && containerRef.current) {
      const minX = Math.min(...layoutNodes.map(n => n.x!))
      const maxX = Math.max(...layoutNodes.map(n => n.x!))
      const graphWidth = maxX - minX + NODE_WIDTH
      
      const containerWidth = containerRef.current.clientWidth
      const startX = (containerWidth - graphWidth) / 2 - minX
      
      setOffset({ x: startX, y: 20 })
    }
    
    setNodes(layoutNodes)
  }, [agents])

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // Handle DPI scaling
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)
    
    // Apply pan and zoom
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)
    
    // Draw edges
    ctx.lineWidth = 1.5
    for (const node of nodes) {
      if (node.parentId) {
        const parent = nodes.find(n => n.id === node.parentId)
        if (parent) {
          const startX = parent.x! + NODE_WIDTH / 2
          const startY = parent.y! + NODE_HEIGHT
          const endX = node.x! + NODE_WIDTH / 2
          const endY = node.y!
          
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          
          // Draw curved elbow line
          const midY = startY + (endY - startY) / 2
          ctx.bezierCurveTo(startX, midY, endX, midY, endX, endY)
          
          // Highlight edge if parent or child is hovered
          if (hoveredNodeId === node.id || hoveredNodeId === parent.id) {
            ctx.strokeStyle = "#18181b" // zinc-900
            ctx.lineWidth = 2.5
          } else {
            ctx.strokeStyle = "#e4e4e7" // zinc-200
            ctx.lineWidth = 1.5
          }
          
          ctx.stroke()
        }
      }
    }
    
    // Draw nodes
    for (const node of nodes) {
      const isHovered = hoveredNodeId === node.id
      const color = TYPE_COLORS[node.type] || "#71717a"
      const bgColor = TYPE_BG[node.type] || "#ffffff"
      
      const x = node.x!
      const y = node.y!
      
      // Node shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.05)"
      ctx.shadowBlur = isHovered ? 15 : 10
      ctx.shadowOffsetY = isHovered ? 4 : 2
      
      // Node background
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.roundRect(x, y, NODE_WIDTH, NODE_HEIGHT, 8)
      ctx.fill()
      
      // Reset shadow for inner elements
      ctx.shadowColor = "transparent"
      
      // Node border
      ctx.strokeStyle = isHovered ? color : "#e4e4e7"
      ctx.lineWidth = isHovered ? 2 : 1
      ctx.stroke()
      
      // Top accent bar
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x, y, NODE_WIDTH, 4, [8, 8, 0, 0])
      ctx.fill()
      
      // Icon bg
      ctx.fillStyle = bgColor
      ctx.beginPath()
      ctx.arc(x + 24, y + 24, 12, 0, Math.PI * 2)
      ctx.fill()
      
      // Initial text
      ctx.fillStyle = color
      ctx.font = "bold 12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.name.charAt(0), x + 24, y + 24)
      
      // Name
      ctx.fillStyle = "#18181b" // zinc-900
      ctx.textAlign = "left"
      ctx.font = "bold 13px Inter, sans-serif"
      // Truncate name if too long
      let displayName = node.name
      if (ctx.measureText(displayName).width > 140) {
        displayName = displayName.substring(0, 16) + "..."
      }
      ctx.fillText(displayName, x + 44, y + 24)
      
      // Role badge
      const roleText = node.type.replace("_", " ")
      ctx.fillStyle = bgColor
      ctx.beginPath()
      ctx.roundRect(x + 12, y + 45, ctx.measureText(roleText).width + 12, 20, 4)
      ctx.fill()
      
      ctx.fillStyle = color
      ctx.font = "600 9px Inter, sans-serif"
      ctx.fillText(roleText, x + 18, y + 55)
      
      // Code & Leads
      ctx.fillStyle = "#71717a" // zinc-500
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(node.agentCode, x + NODE_WIDTH - 12, y + 24)
      
      if (node._count.ownedLeads > 0) {
        ctx.fillText(`${node._count.ownedLeads} leads`, x + NODE_WIDTH - 12, y + 55)
      }
    }
    
    ctx.restore()
  }, [nodes, scale, offset, hoveredNodeId])

  // Event handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = -e.deltaY * 0.001
    const newScale = Math.min(Math.max(0.2, scale + zoomFactor), 2)
    
    // Zoom towards mouse position
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / scale)
      const newOffsetY = mouseY - (mouseY - offset.y) * (newScale / scale)
      
      setScale(newScale)
      setOffset({ x: newOffsetX, y: newOffsetY })
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    if (canvasRef.current) {
      canvasRef.current.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    } else {
      // Hit detection for hover
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const mouseX = (e.clientX - rect.left - offset.x) / scale
      const mouseY = (e.clientY - rect.top - offset.y) / scale
      
      let foundHover = null
      // Check in reverse order (top z-index first)
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i]
        if (
          mouseX >= node.x! && mouseX <= node.x! + NODE_WIDTH &&
          mouseY >= node.y! && mouseY <= node.y! + NODE_HEIGHT
        ) {
          foundHover = node.id
          break
        }
      }
      
      if (foundHover !== hoveredNodeId) {
        setHoveredNodeId(foundHover)
        // Change cursor
        canvasRef.current.style.cursor = foundHover ? "pointer" : "grab"
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    if (canvasRef.current) {
      canvasRef.current.releasePointerCapture(e.pointerId)
      canvasRef.current.style.cursor = hoveredNodeId ? "pointer" : "grab"
    }
    
    // Handle click
    if (!isDragging || (Math.abs(e.clientX - dragStart.x - offset.x) < 5 && Math.abs(e.clientY - dragStart.y - offset.y) < 5)) {
      if (hoveredNodeId) {
        router.push(`/dashboard/agents/${hoveredNodeId}`)
      }
    }
  }

  if (agents.length === 0) {
    return (
      <Card className="h-[600px] flex flex-col items-center justify-center text-zinc-400">
        <Users className="h-12 w-12 mb-4" />
        <p>No agents in the hierarchy yet.</p>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800" ref={containerRef}>
      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <button 
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            onClick={() => setScale(s => Math.min(s + 0.2, 2))}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
          <button 
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            onClick={() => setScale(s => Math.max(s - 0.2, 0.2))}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
          <button 
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            onClick={() => {
              setScale(1)
              if (containerRef.current && nodes.length > 0) {
                const minX = Math.min(...nodes.map(n => n.x!))
                const maxX = Math.max(...nodes.map(n => n.x!))
                const startX = (containerRef.current.clientWidth - (maxX - minX + NODE_WIDTH)) / 2 - minX
                setOffset({ x: startX, y: 20 })
              }
            }}
            title="Reset View"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
          Total Nodes: {agents.length}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[600px] touch-none"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </Card>
  )
}
