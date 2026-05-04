import { getAgents } from "@/app/actions/agents"
import Link from "next/link"
import { getSessionOrThrow } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { ReferralCard } from "./referral-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users, ChevronRight, UserPlus } from "lucide-react"

export default async function AgentsPage() {
  const agents = await getAgents()
  const session = await getSessionOrThrow()
  
  let currentUserAgentCode = ""
  if (session.agentId) {
    const agent = await prisma.agent.findUnique({ where: { id: session.agentId } })
    if (agent) currentUserAgentCode = agent.agentCode
  }

  const typeColor: Record<string, string> = {
    SALESPERSON: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    SALES_AGENT: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    SUB_SALES_AGENT: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] md:hidden font-black text-zinc-400 uppercase tracking-widest">Team Network</p>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            <span className="md:hidden">{agents.length} Agents</span>
            <span className="hidden md:inline">Agents</span>
          </h1>
          <p className="text-sm text-zinc-500 hidden md:block">Manage your agent network and hierarchy.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/agents/hierarchy">
            <Button variant="outline" size="sm" className="rounded-xl h-9 md:h-10 border-zinc-200 dark:border-zinc-800">
              <Users className="md:mr-2 h-4 w-4" />
              <span className="hidden md:inline">Network Map</span>
            </Button>
          </Link>
          <Link href="/dashboard/agents/new" className="hidden md:block">
            <Button size="sm" className="font-bold rounded-xl h-10 shadow-sm shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </Link>
        </div>
      </div>

      {currentUserAgentCode && (
        <div className="mb-2">
          <ReferralCard agentCode={currentUserAgentCode} />
        </div>
      )}

      {/* ── Desktop View ── */}
      <Card className="hidden md:block border-none md:border md:shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardContent className="p-0 md:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-mono text-xs text-zinc-500 font-bold tracking-tight">{agent.agentCode}</TableCell>
                  <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">{agent.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight">
                      {agent.type.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs font-semibold">{agent.parent?.name ?? "—"}</TableCell>
                  <TableCell className="font-bold">
                    {agent.commissionType === "PERCENTAGE" ? `${agent.commissionRate}%` : `₹${agent.commissionRate}`}
                  </TableCell>
                  <TableCell className="font-medium text-primary">{agent._count.ownedLeads}</TableCell>
                  <TableCell>
                    <Badge variant={agent.isActive ? "success" : "destructive"} className="text-[10px]">
                      {agent.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/agents/${agent.id}`}>
                      <ChevronRight className="h-4 w-4 text-zinc-300" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Mobile View (App-style) ── */}
      <div className="md:hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">AGENT DIRECTORY ({agents.length})</span>
        </div>
        {agents.length > 0 ? (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {agents.map((agent) => (
              <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}>
                <div className="flex items-center gap-3 px-5 py-4 active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{agent.name}</p>
                      <Badge variant={agent.isActive ? "success" : "destructive"} className="text-[9px] h-5 px-1.5 flex-shrink-0">
                        {agent.isActive ? "ACTIVE" : "OFFLINE"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest">{agent.agentCode}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${typeColor[agent.type] || "bg-zinc-100 text-zinc-600"}`}>
                        {agent.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-tight">Manager: {agent.parent?.name ?? "Karan Direct"}</span>
                      <div className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800 rounded-md border border-zinc-100 dark:border-zinc-700">
                        <span className="text-[10px] font-black text-zinc-500 uppercase">Leads: </span>
                        <span className="text-[10px] font-black text-primary">{agent._count.ownedLeads}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-300 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-400">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-xs font-medium">No agents found</p>
          </div>
        )}
      </div>

      {/* ── FAB for Mobile ── */}
      <Link href="/dashboard/agents/new" className="md:hidden fixed bottom-20 right-5 z-40">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 bg-zinc-900 dark:bg-primary hover:scale-105 active:scale-90 transition-all text-white">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  )
}
