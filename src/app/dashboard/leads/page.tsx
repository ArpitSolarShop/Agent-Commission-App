import { getLeads } from "@/app/actions/leads"
import { auth } from "@/auth"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Phone, Target } from "lucide-react"

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isAdmin ? "All Leads" : "My Assigned Leads"}</h1>
          <p className="text-sm text-zinc-500">{leads.length} leads total</p>
        </div>
        <Link href="/dashboard/leads/new">
          <Button size="sm"><Plus className="mr-2 h-4 w-4" />Submit Lead</Button>
        </Link>
      </div>

      <Card className="border-none md:border md:shadow-sm bg-transparent md:bg-white dark:md:bg-zinc-900">
        <CardContent className="p-0 md:p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block">
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
          </div>

          {/* Mobile Card List View (Android App Feel) */}
          <div className="md:hidden space-y-3 pb-4">
            {leads.map((lead) => {
              const primaryPhone = lead.contacts.find((c) => c.isPrimary)?.phoneNumber ?? lead.contacts[0]?.phoneNumber ?? "—"
              return (
                <Link key={lead.id} href={`/dashboard/leads/${lead.id}`} className="block">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm active:scale-[0.98] transition-transform">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{lead.name}</h3>
                        <p className="text-xs text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {primaryPhone}
                        </p>
                      </div>
                      <Badge variant={statusVariant[lead.status] ?? "outline"} className="text-[10px] py-0 px-2 h-5">
                        {lead.status.replace("_", " ")}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-50 dark:border-zinc-800/50">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                          {lead.owner.name.charAt(0)}
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-tight">{lead.location}</span>
                      </div>
                      <div className="text-[10px] font-medium text-primary">
                        {lead._count.deals} DEALS →
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {leads.length === 0 && (
            <div className="text-center py-12 text-zinc-400">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No leads found in this view.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button (FAB) for Mobile */}
      <Link href="/dashboard/leads/new" className="md:hidden fixed bottom-20 right-6 z-40">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg shadow-primary/40 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>

    </div>
  )
}
