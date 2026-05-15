import { getCommissions } from "@/app/actions/deals"
import { auth } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CommissionActions } from "@/app/dashboard/commissions/commission-actions"
import { cn } from "@/lib/utils"
import {
  Banknote,
  IndianRupee,
  Wallet,
  Sparkles,
  Trophy,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star
} from "lucide-react"

// Milestones for the happiness progress tracker
const MILESTONES = [
  { label: "Rising Star", amount: 10000, icon: "⭐" },
  { label: "Silver Partner", amount: 50000, icon: "🥈" },
  { label: "Gold Partner", amount: 100000, icon: "🥇" },
  { label: "Platinum Elite", amount: 500000, icon: "💎" },
]

function getMilestone(earned: number) {
  const achieved = MILESTONES.filter(m => earned >= m.amount)
  const next = MILESTONES.find(m => earned < m.amount)
  const current = achieved[achieved.length - 1] ?? null
  const progress = next ? Math.min(100, Math.round((earned / next.amount) * 100)) : 100
  return { current, next, progress, achieved: achieved.length }
}

export default async function CommissionsPage() {
  const session = await auth()
  const isAgent = session?.user?.role === "AGENT" || session?.user?.role === "SALESPERSON"
  const isAdmin = session?.user?.role === "ADMIN"

  const commissions = await getCommissions(
    !isAdmin && session?.user?.agentId
      ? { agentId: session.user.agentId }
      : undefined
  )

  const totalEarnings = commissions.reduce((sum, c) => sum + Number(c.amount), 0)
  const paidEarnings = commissions.filter(c => c.status === "PAID").reduce((sum, c) => sum + Number(c.amount), 0)
  const pendingEarnings = commissions.filter(c => c.status !== "PAID").reduce((sum, c) => sum + Number(c.amount), 0)
  const paidCount = commissions.filter(c => c.status === "PAID").length

  const { current: currentMilestone, next: nextMilestone, progress, achieved } = getMilestone(paidEarnings)

  // Group commissions by month for agent ledger
  const grouped: Record<string, typeof commissions> = {}
  commissions.forEach(c => {
    const key = new Date(c.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(c)
  })

  // ── AGENT / SALESPERSON WALLET VIEW ──────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="space-y-5 max-w-lg mx-auto pb-24">

        {/* Page title */}
        <div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">My Earnings</p>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5">
            Happiness Wallet
          </h1>
        </div>

        {/* ── Premium Wallet Card ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-emerald-950 text-white shadow-2xl shadow-zinc-900/30 border border-zinc-700/40">
          {/* Decorative glows */}
          <div className="absolute -top-12 -right-12 w-52 h-52 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/15 rounded-full blur-2xl pointer-events-none" />
          {/* Chip decoration */}
          <div className="absolute top-5 right-5 w-10 h-7 rounded-md border border-amber-400/40 bg-gradient-to-br from-amber-400/20 to-amber-300/10 backdrop-blur-sm" />

          <div className="relative z-10 p-6 space-y-5">
            {/* Card header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black tracking-widest uppercase text-zinc-300">
                  Arpit Solar · Happiness Wallet
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
              </div>
            </div>

            {/* Balance */}
            <div className="space-y-0.5">
              <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1.5">
                Total Happiness Earned <Sparkles className="w-3 h-3 text-amber-400" />
              </p>
              <p className="text-4xl font-black tracking-tight">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </p>
              {currentMilestone && (
                <p className="text-[10px] text-emerald-400 font-bold">
                  {currentMilestone.icon} {currentMilestone.label}
                </p>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Paid Out</p>
                <p className="text-sm font-black text-emerald-400 mt-0.5">
                  ₹{paidEarnings.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Pending</p>
                <p className="text-sm font-black text-amber-400 mt-0.5">
                  ₹{pendingEarnings.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Deals Won</p>
                <p className="text-sm font-black text-zinc-200 mt-0.5">{paidCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Milestone / Happiness Progress ── */}
        {nextMilestone && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                  Next: {nextMilestone.icon} {nextMilestone.label}
                </span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400">
                ₹{paidEarnings.toLocaleString("en-IN")} / ₹{nextMilestone.amount.toLocaleString("en-IN")}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400">
              Earn ₹{(nextMilestone.amount - paidEarnings).toLocaleString("en-IN")} more to unlock {nextMilestone.label}
            </p>
          </div>
        )}
        {!nextMilestone && achieved === MILESTONES.length && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 p-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">💎 Platinum Elite</p>
              <p className="text-[10px] text-zinc-500">You&apos;ve reached the highest tier. Incredible work!</p>
            </div>
          </div>
        )}

        {/* ── Transaction Ledger ── */}
        <div className="space-y-1">
          <div className="px-1 flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Transaction Ledger</span>
            <span className="text-[10px] font-bold text-zinc-400">{commissions.length} records</span>
          </div>

          {commissions.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Banknote className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-xs font-medium uppercase tracking-widest">No earnings recorded yet</p>
              <p className="text-[10px] text-zinc-300 mt-1">Your commissions will appear here once deals are closed</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([month, records]) => {
                const monthTotal = records.reduce((s, r) => s + Number(r.amount), 0)
                return (
                  <div key={month}>
                    {/* Month header */}
                    <div className="flex items-center justify-between px-1 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{month}</span>
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                        +₹{monthTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {/* Transactions */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
                      <div className="divide-y divide-zinc-50 dark:divide-zinc-800/30">
                        {records.map((c) => {
                          const isPaid = c.status === "PAID"
                          const isDisputed = c.status === "DISPUTED"
                          return (
                            <div key={c.id} className="flex items-center gap-3.5 px-4 py-3.5">
                              {/* Icon */}
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                                isPaid ? "bg-emerald-100 dark:bg-emerald-900/30" :
                                isDisputed ? "bg-red-100 dark:bg-red-900/30" :
                                "bg-amber-50 dark:bg-amber-900/20"
                              )}>
                                {isPaid
                                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  : isDisputed
                                  ? <IndianRupee className="w-4 h-4 text-red-500" />
                                  : <Clock className="w-4 h-4 text-amber-500" />
                                }
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                                  {c.deal.lead.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Badge
                                    variant="outline"
                                    className="text-[8px] h-3.5 px-1 font-black uppercase border-zinc-200 dark:border-zinc-700 text-zinc-500"
                                  >
                                    {c.role}
                                  </Badge>
                                  <span className="text-[9px] text-zinc-400">
                                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                  </span>
                                </div>
                              </div>

                              {/* Amount & status */}
                              <div className="text-right flex-shrink-0">
                                <p className={cn(
                                  "text-sm font-black leading-tight",
                                  isPaid ? "text-emerald-600 dark:text-emerald-400" :
                                  isDisputed ? "text-red-500" :
                                  "text-amber-500"
                                )}>
                                  +₹{Number(c.amount).toLocaleString("en-IN")}
                                </p>
                                <CommissionActions commission={{ ...c, amount: Number(c.amount) }} isAdmin={false} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── ADMIN VIEW ────────────────────────────────────────────────────────────
  const adminPaid = commissions.filter(c => c.status === "PAID").reduce((s, c) => s + Number(c.amount), 0)
  const adminPending = commissions.filter(c => c.status !== "PAID").reduce((s, c) => s + Number(c.amount), 0)

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Financials</p>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5 uppercase italic">
          Commissions
        </h1>
        <p className="text-sm text-zinc-500">Track and manage all agent commissions.</p>
      </div>

      {/* Admin summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400">Total Records</span>
            <TrendingUp className="w-4 h-4 text-zinc-300" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{commissions.length}</p>
        </div>
        <div className="bg-emerald-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-emerald-100/70">Total Paid Out</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          </div>
          <p className="text-2xl font-black">₹{adminPaid.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400">Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-500">₹{adminPending.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Desktop table */}
      <Card className="border border-zinc-100 dark:border-zinc-800/50 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-800/30">
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Agent</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Lead / Deal</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Deal Value</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Role</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Commission</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-zinc-400 text-xs">
                    No commission records found.
                  </TableCell>
                </TableRow>
              )}
              {commissions.map((c) => (
                <TableRow key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                        {c.agent.name.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">{c.agent.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono font-bold">{c.agent.agentCode}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 truncate max-w-[160px]">{c.deal.lead.name}</span>
                      <span className="text-[10px] text-zinc-400 truncate max-w-[160px] font-mono">{c.deal.id.slice(0, 12)}…</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    ₹{Number(c.deal.dealValue).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter h-5">{c.role}</Badge>
                  </TableCell>
                  <TableCell className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                    ₹{Number(c.amount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.status === "PAID" ? "success" : c.status === "APPROVED" ? "success" : c.status === "DISPUTED" ? "destructive" : "warning"}
                      className="text-[10px] font-black uppercase"
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <CommissionActions commission={{ ...c, amount: Number(c.amount) }} isAdmin={isAdmin} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
