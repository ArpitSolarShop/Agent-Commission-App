import { getLeads } from "@/app/actions/leads"
import { auth } from "@/auth"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Phone, Target, ChevronRight } from "lucide-react"

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  NEW: "outline",
  CONTACTED: "secondary",
  QUALIFIED: "warning",
  PROPOSAL: "default",
  NEGOTIATION: "default",
  CLOSED_WON: "success",
  CLOSED_LOST: "destructive",
}

export default async function LeadsPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"
  const agentId = session?.user?.agentId

  const leads = await getLeads(!isAdmin && agentId ? { agentId } : undefined)

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Mobile Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] md:hidden font-black text-zinc-400 uppercase tracking-widest">PIPELINE</p>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            <span className="md:hidden">{leads.length} Leads</span>
            <span className="hidden md:inline">{isAdmin ? "All Leads" : "My Assigned Leads"}</span>
          </h1>
          <p className="text-sm text-zinc-500 hidden md:block">{leads.length} leads total</p>
        </div>
        <Link href="/dashboard/leads/new" className="hidden md:block">
          <Button size="sm"><Plus className="mr-2 h-4 w-4" />Submit Lead</Button>
        </Link>
      </div>

      {/* Desktop Table View */}
      <Card className="border-none md:border md:shadow-sm bg-transparent md:bg-white dark:md:bg-zinc-900 hidden md:block">
        <CardContent className="p-0 md:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deals</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => {
                const primaryPhone = lead.contacts.find((c) => c.isPrimary)?.phoneNumber ?? lead.contacts[0]?.phoneNumber ?? "—"
                return (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-xs font-mono">
                        <Phone className="h-3 w-3" />{primaryPhone}
                      </span>
                    </TableCell>
                    <TableCell>{lead.location}</TableCell>
                    <TableCell><Badge variant="outline">{lead.sourceType}</Badge></TableCell>
                    <TableCell className="text-zinc-500 text-xs">{lead.owner.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[lead.status] ?? "outline"}>{lead.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>{lead._count.deals}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Mobile List (App-style) ── */}
      <div className="md:hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ALL LEADS ({leads.length})</span>
        </div>
        {leads.length > 0 ? (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {leads.map((lead) => {
              const primaryPhone = lead.contacts.find((c) => c.isPrimary)?.phoneNumber ?? lead.contacts[0]?.phoneNumber ?? "—"
              return (
                <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
                  <div className="flex items-center gap-3 px-5 py-4 active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{lead.name}</p>
                        <Badge variant={statusVariant[lead.status] ?? "outline"} className="text-[9px] h-5 px-1.5 flex-shrink-0">
                          {lead.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-0.5">
                          <Phone className="h-2.5 w-2.5" /> {primaryPhone}
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase">{lead.location}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-tight">{lead.owner.name}</span>
                        <span className="text-[10px] font-bold text-primary">{lead._count.deals} DEALS</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-300 flex-shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-400">
            <Target className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-xs font-medium">No leads found</p>
          </div>
        )}
      </div>

      {/* FAB for Mobile */}
      <Link href="/dashboard/leads/new" className="md:hidden fixed bottom-20 right-5 z-40">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 bg-zinc-900 dark:bg-primary hover:scale-105 active:scale-90 transition-all text-white">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  )
}
