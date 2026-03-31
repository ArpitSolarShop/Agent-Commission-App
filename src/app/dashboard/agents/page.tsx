import { getAgents } from "@/app/actions/agents"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users, Eye } from "lucide-react"

export default async function AgentsPage() {
  const agents = await getAgents()

  const typeColor: Record<string, "default" | "secondary" | "outline"> = {
    SALESPERSON: "default",
    CHANNEL_PARTNER: "secondary",
    SUB_AGENT: "outline",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="hidden sm:block">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">Agents</h1>
            <p className="text-sm text-zinc-500">Manage your agent network and hierarchy.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/dashboard/agents/hierarchy" className="flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-wider rounded-xl h-10 border-zinc-200 dark:border-zinc-800">
                <Users className="mr-2 h-4 w-4" />
                Network Map
              </Button>
            </Link>
            <Link href="/dashboard/agents/new" className="hidden sm:flex">
              <Button className="font-bold rounded-xl h-10 shadow-sm shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Add Agent
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="border-none md:border md:shadow-sm bg-transparent md:bg-white dark:md:bg-zinc-900">
        <CardHeader className="hidden md:block">
          <CardTitle className="text-lg font-bold">Agent Network ({agents.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {/* Desktop View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Rate %</TableHead>
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
                      <Badge variant={typeColor[agent.type] ?? "outline"} className="text-[10px] uppercase font-bold tracking-tight">
                        {agent.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-500 text-xs font-semibold">{agent.parent?.name ?? "—"}</TableCell>
                    <TableCell className="font-bold">{agent.commissionRate}%</TableCell>
                    <TableCell className="font-medium text-primary">{agent._count.ownedLeads}</TableCell>
                    <TableCell>
                      <Badge variant={agent.isActive ? "success" : "destructive"} className="text-[10px]">
                        {agent.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/agents/${agent.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View (Native App feel) */}
          <div className="md:hidden space-y-3 pb-6">
            <div className="px-1 mb-2">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Agent Network ({agents.length})</h2>
            </div>
            {agents.map((agent) => (
              <Link key={agent.id} href={`/dashboard/agents/${agent.id}`} className="block">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm active:scale-[0.98] transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-primary text-base">
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-zinc-900 dark:text-zinc-50 text-base tracking-tight leading-tight">{agent.name}</h3>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">{agent.agentCode}</p>
                      </div>
                    </div>
                    <Badge variant={agent.isActive ? "success" : "destructive"} className="text-[9px] h-5 py-0 px-2 uppercase font-black">
                      {agent.isActive ? "ACTIVE" : "OFFLINE"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">ROLE</span>
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase truncate">
                        {agent.type.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">MANAGER</span>
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase truncate">
                        {agent.parent?.name ?? "Karan Direct"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center gap-2">
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tight">Leads</span>
                       <span className="text-xs font-black text-primary">{agent._count.ownedLeads}</span>
                    </div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest italic flex items-center gap-1">
                      Details <span>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {agents.length === 0 && (
            <div className="text-center py-16 text-zinc-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold">No agents found in results.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAB for Mobile */}
      <Link href="/dashboard/agents/new" className="md:hidden fixed bottom-20 right-6 z-40">
        <Button size="icon" className="h-15 w-15 rounded-full shadow-xl shadow-primary/40 bg-primary hover:scale-105 active:scale-95 transition-all text-white">
          <Plus className="h-7 w-7" />
        </Button>
      </Link>
    </div>
  )
}
