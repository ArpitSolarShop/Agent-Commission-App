import { getCommissions } from "@/app/actions/deals"
import { auth } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CommissionActions } from "@/app/dashboard/commissions/commission-actions"
import { cn } from "@/lib/utils"
import { Banknote, IndianRupee, ArrowUpRight } from "lucide-react"

export default async function CommissionsPage() {
  const session = await auth()
  const isAgent = session?.user?.role === "AGENT"
  
  const commissions = await getCommissions(isAgent && session?.user?.agentId ? { agentId: session.user.agentId } : undefined)
  const isAdmin = session?.user?.role === "ADMIN"

  const totalEarnings = commissions.reduce((sum, c) => sum + c.amount, 0)
  const pendingEarnings = commissions.filter(c => c.status !== "PAID").reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] md:hidden font-black text-zinc-400 uppercase tracking-widest">Financials</p>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic font-sans hidden md:block">Commissions</h1>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 md:hidden">My Earnings</h1>
          <p className="text-sm text-zinc-500 hidden md:block">
            {isAgent ? "Your personal commission ledger." : "Track and manage all agent commissions."}
          </p>
        </div>
      </div>

      {/* ── Summary Stats for Mobile ── */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        <div className="bg-emerald-600 rounded-3xl p-4 text-white shadow-lg shadow-emerald-600/10">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100/70">Total Earned</p>
          <p className="text-lg font-black mt-1 truncate">₹{totalEarnings.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Pending</p>
          <p className="text-lg font-black mt-1 text-zinc-900 dark:text-zinc-100 truncate">₹{pendingEarnings.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* ── Desktop View ── */}
      <Card className="hidden md:block border-none md:border md:shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardContent className="p-0 md:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                {!isAgent && <TableHead>Agent</TableHead>}
                <TableHead>Lead / Deal</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((c) => (
                <TableRow key={c.id}>
                  {!isAgent && (
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{c.agent.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono font-bold">{c.agent.agentCode}</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{c.deal.lead.name}</span>
                      <span className="text-[10px] text-zinc-400 truncate max-w-[150px] font-mono">{c.deal.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold">₹{c.deal.dealValue.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter h-5">{c.role}</Badge>
                  </TableCell>
                  <TableCell className="font-black text-sm text-emerald-600 dark:text-emerald-400">₹{c.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={c.status === "PAID" ? "success" : c.status === "APPROVED" ? "success" : c.status === "DISPUTED" ? "destructive" : "warning"}
                      className="text-[10px] font-black uppercase"
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <CommissionActions commission={c} isAdmin={isAdmin} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Mobile List (App-style) ── */}
      <div className="md:hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TRANSACTIONS ({commissions.length})</span>
        </div>
        {commissions.length > 0 ? (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {commissions.map((c) => (
              <div key={c.id} className="p-5 active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors">
                 <div className="flex justify-between items-start mb-3">
                   <div className="flex gap-3">
                     <div className={cn(
                       "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm",
                       c.status === "PAID" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                     )}>
                       <IndianRupee className="h-4 w-4" />
                     </div>
                     <div className="min-w-0">
                       <h3 className="font-black text-zinc-900 dark:text-zinc-50 text-sm leading-tight tracking-tight truncate max-w-[140px]">{c.deal.lead.name}</h3>
                       <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{c.role} REWARD</p>
                     </div>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-base text-emerald-600 dark:text-emerald-400 leading-none">+₹{c.amount.toLocaleString("en-IN")}</p>
                      <Badge 
                        variant={c.status === "PAID" ? "success" : c.status === "APPROVED" ? "success" : c.status === "DISPUTED" ? "destructive" : "warning"}
                        className="text-[8px] h-4 py-0 px-1 font-black uppercase mt-1.5"
                      >
                        {c.status}
                      </Badge>
                   </div>
                 </div>

                 {!isAgent && (
                   <div className="flex items-center gap-2 mb-3">
                     <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-500 uppercase flex-shrink-0">
                       {c.agent.name.charAt(0)}
                     </div>
                     <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight truncate">{c.agent.name} ({c.agent.agentCode})</span>
                   </div>
                 )}

                 <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800/50">
                   <div className="flex flex-col">
                     <span className="text-[8px] font-black text-zinc-400 tracking-widest uppercase">DEAL VALUE</span>
                     <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-300">₹{c.deal.dealValue.toLocaleString("en-IN")}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <CommissionActions commission={c} isAdmin={isAdmin} />
                   </div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-400">
            <Banknote className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-xs font-medium uppercase tracking-widest">No transaction records found</p>
          </div>
        )}
      </div>
    </div>
  )
}
