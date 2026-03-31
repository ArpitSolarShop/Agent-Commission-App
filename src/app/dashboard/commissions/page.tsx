import { getCommissions } from "@/app/actions/deals"
import { auth } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CommissionActions } from "@/app/dashboard/commissions/commission-actions"
import { cn } from "@/lib/utils"
import { Banknote } from "lucide-react"

export default async function CommissionsPage() {
  const session = await auth()
  const isAgent = session?.user?.role === "AGENT"
  
  const commissions = await getCommissions(isAgent && session?.user?.agentId ? { agentId: session.user.agentId } : undefined)

  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic font-sans hidden sm:block">Commissions</h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest sm:hidden">Ledger</p>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:hidden">Earnings</h1>
          <p className="text-sm text-zinc-500 hidden sm:block">
            {isAgent ? "Your personal commission ledger." : "Track and manage all agent commissions."}
          </p>
        </div>
      </div>

      <Card className="border-none md:border md:shadow-sm bg-transparent md:bg-white dark:md:bg-zinc-900 overflow-hidden">
        <CardHeader className="hidden md:block border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-lg font-bold">Commission Ledger ({commissions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block">
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
          </div>

          {/* Mobile Card List (Android App Feel) */}
          <div className="md:hidden space-y-4 px-1 pb-10">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TRANSACTIONS ({commissions.length})</span>
            </div>
            {commissions.map((c) => (
              <div key={c.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden active:scale-[0.98] transition-transform">
                <div className="p-5 flex flex-col gap-4">
                   <div className="flex justify-between items-start">
                     <div className="flex gap-3">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg",
                         c.status === "PAID" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                       )}>
                         ₹
                       </div>
                       <div>
                         <h3 className="font-black text-zinc-900 dark:text-zinc-50 text-base leading-tight tracking-tight">{c.deal.lead.name}</h3>
                         <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{c.role} REWARD</p>
                       </div>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                       <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">+₹{c.amount.toLocaleString("en-IN")}</span>
                       <Badge 
                        variant={c.status === "PAID" ? "success" : c.status === "APPROVED" ? "success" : c.status === "DISPUTED" ? "destructive" : "warning"}
                        className="text-[8px] h-4 py-0 px-1 font-black uppercase"
                      >
                        {c.status}
                      </Badge>
                     </div>
                   </div>

                   {!isAgent && (
                     <div className="flex items-center gap-2 border-t border-zinc-50 dark:border-zinc-800/50 pt-3">
                       <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-500 uppercase">
                         {c.agent.name.charAt(0)}
                       </div>
                       <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">{c.agent.name} ({c.agent.agentCode})</span>
                     </div>
                   )}

                   <div className="flex items-center justify-between pt-1">
                     <div className="flex flex-col">
                       <span className="text-[9px] font-black text-zinc-400 tracking-widest uppercase">DEAL VALUE</span>
                       <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-300">₹{c.deal.dealValue.toLocaleString("en-IN")}</span>
                     </div>
                     <div className="flex gap-2">
                       <CommissionActions commission={c} isAdmin={isAdmin} />
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {commissions.length === 0 && (
            <div className="text-center py-20 text-zinc-400">
              <Banknote className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold">No reward records found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

  )
}
