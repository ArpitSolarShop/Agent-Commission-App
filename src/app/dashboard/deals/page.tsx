import { getDeals } from "@/app/actions/deals"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Briefcase } from "lucide-react"

const statusVariant: Record<string, "default" | "success" | "destructive" | "outline" | "warning"> = {
  NEW_QUALIFIED: "outline",
  SITE_VISIT_DONE: "default",
  PROPOSAL_SENT: "warning",
  NEGOTIATION: "warning",
  CLOSED_WON: "success",
  CLOSED_LOST: "destructive",
}

export default async function DealsPage() {
  const deals = await getDeals()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic font-sans hidden sm:block">Deals</h1>
          <p className="text-sm text-zinc-500 hidden sm:block">{deals.length} active deals in pipeline</p>
          <div className="sm:hidden">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">SALES PIPE</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Active Deals</h1>
          </div>
        </div>
        <Link href="/dashboard/deals/new" className="hidden sm:block">
          <Button className="font-bold rounded-xl h-10 shadow-sm shadow-primary/20"><Plus className="mr-2 h-4 w-4" />New Deal</Button>
        </Link>
      </div>

      <Card className="border-none md:border md:shadow-sm bg-transparent md:bg-white dark:md:bg-zinc-900">
        <CardContent className="p-0 md:p-6">
          {/* Desktop View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Deal Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commissions</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">{deal.lead.name}</TableCell>
                    <TableCell className="text-zinc-500 text-xs font-semibold uppercase tracking-tight">{deal.lead.owner.name}</TableCell>
                    <TableCell className="font-black text-sm">₹{deal.dealValue.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[deal.status] ?? "outline"} className="text-[10px] font-black uppercase text-center">
                        {deal.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600">{deal._count.commissions} Records</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/deals/${deal.id}`}>
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

          {/* Mobile View (Android App feel) */}
          <div className="md:hidden space-y-4 px-1 pb-10">
            <div className="px-2 mb-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">PIPELINE ({deals.length})</span>
            </div>
            {deals.map((deal) => (
              <Link key={deal.id} href={`/dashboard/deals/${deal.id}`} className="block">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm active:scale-[0.98] transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                       <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-primary">
                         <Briefcase className="h-5 w-5" />
                       </div>
                       <div>
                         <h3 className="font-black text-zinc-900 dark:text-zinc-50 text-base leading-tight tracking-tight">{deal.lead.name}</h3>
                         <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{deal.lead.owner.name}</p>
                       </div>
                    </div>
                    <Badge variant={statusVariant[deal.status] ?? "outline"} className="text-[9px] h-5 py-0 px-2 uppercase font-black">
                      {deal.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-zinc-400 tracking-widest uppercase">DEAL AMOUNT</span>
                      <span className="text-base font-black text-zinc-900 dark:text-zinc-200 italic">₹{deal.dealValue.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-black text-zinc-400 tracking-widest uppercase">COMMISSIONS</span>
                       <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">{deal._count.commissions} SLOTS</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {deals.length === 0 && (
            <div className="text-center py-20 text-zinc-400">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-10" />
              <p className="text-sm font-bold">No deals in pipeline.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAB for Mobile */}
      <Link href="/dashboard/deals/new" className="md:hidden fixed bottom-20 right-6 z-40">
        <Button size="icon" className="h-15 w-15 rounded-full shadow-xl shadow-primary/40 bg-zinc-900 dark:bg-primary hover:scale-105 active:scale-95 transition-all text-white">
          <Plus className="h-7 w-7" />
        </Button>
      </Link>
    </div>

  )
}
