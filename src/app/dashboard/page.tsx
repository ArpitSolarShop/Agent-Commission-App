import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Target, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  BarChart,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { DashboardChart } from "@/components/dashboard-chart"

export default async function DashboardPage() {
  const session = await auth()
  const role = session?.user?.role
  const agentId = session?.user?.agentId

  // Common stats based on role
  let totalLeads = 0
  let activeDeals = 0
  let totalEarned = 0
  let pendingCommissions = 0

  if (role === "ADMIN") {
    totalLeads = await prisma.lead.count()
    activeDeals = await prisma.deal.count({ where: { status: "OPEN" } })
    totalEarned = (await prisma.commission.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" }
    }))._sum.amount || 0
    pendingCommissions = (await prisma.commission.aggregate({
      _sum: { amount: true },
      where: { status: { in: ["PENDING", "APPROVED"] } }
    }))._sum.amount || 0
  } else if (agentId) {
    // For Agents/Salespeople
    totalLeads = await prisma.lead.count({ where: { ownerId: agentId } })
    activeDeals = await prisma.deal.count({ 
      where: { lead: { ownerId: agentId }, status: "OPEN" } 
    })
    totalEarned = (await prisma.commission.aggregate({
      _sum: { amount: true },
      where: { agentId, status: "PAID" }
    }))._sum.amount || 0
    pendingCommissions = (await prisma.commission.aggregate({
      _sum: { amount: true },
      where: { agentId, status: { in: ["PENDING", "APPROVED"] } }
    }))._sum.amount || 0
  }

  const recentLeads = await prisma.lead.findMany({
    where: role !== "ADMIN" && agentId ? { ownerId: agentId } : {},
    include: { owner: true },
    orderBy: { createdAt: "desc" },
    take: 5
  })

  // Prepare chart data for Deals Pipeline
  const dealStatusCount = await prisma.deal.groupBy({
    by: ['status'],
    where: role !== "ADMIN" && agentId ? { lead: { ownerId: agentId } } : {},
    _count: { status: true },
  })

  const rawChartData = dealStatusCount.map(d => ({
    name: d.status.replace("_", " "),
    value: d._count.status
  }))

  // Ensure consistent sort order (Open -> In Progress -> Won -> Lost)
  const statusOrder = ["OPEN", "IN PROGRESS", "CLOSED WON", "CLOSED LOST"]
  const chartData = rawChartData.sort((a, b) => statusOrder.indexOf(a.name) - statusOrder.indexOf(b.name))

  const recentCommissions = await prisma.commission.findMany({
    where: role !== "ADMIN" && agentId ? { agentId } : {},
    include: { agent: true, deal: { include: { lead: true } } },
    orderBy: { createdAt: "desc" },
    take: 5
  })

  const stats = [
    { label: "Leads", value: totalLeads, icon: Target, color: "text-primary bg-primary/10" },
    { label: "Active", value: activeDeals, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Earned", value: `₹${totalEarned > 1000 ? `${(totalEarned/1000).toFixed(1)}k` : totalEarned}`, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Pending", value: `₹${pendingCommissions > 1000 ? `${(pendingCommissions/1000).toFixed(1)}k` : pendingCommissions}`, icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  ]

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* ── Greeting ── */}
      <div>
        <p className="text-[10px] md:text-xs font-black text-zinc-400 uppercase tracking-widest">Welcome back</p>
        <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5">
          {session?.user?.name}
        </h1>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4 active:scale-[0.98] transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400">{s.label}</span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Chart ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Deals Pipeline</span>
          <BarChart className="h-4 w-4 text-zinc-300" />
        </div>
        <div className="px-2 md:px-5 py-4">
          <DashboardChart data={chartData} />
        </div>
      </div>

      {/* ── Recent Leads ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Recent Leads</span>
          <Link href="/dashboard/leads">
            <button className="text-[10px] font-bold text-primary active:scale-95 transition-transform">VIEW ALL</button>
          </Link>
        </div>
        {recentLeads.length > 0 ? (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {recentLeads.map((lead) => (
              <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
                <div className="flex items-center justify-between px-5 py-3.5 active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{lead.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">{lead.location || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider h-5">{lead.status}</Badge>
                    <ChevronRight className="h-4 w-4 text-zinc-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-zinc-400 text-xs">No leads yet.</div>
        )}
      </div>

      {/* ── Earnings ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Earnings</span>
          <Link href="/dashboard/commissions">
            <button className="text-[10px] font-bold text-primary active:scale-95 transition-transform">LEDGER</button>
          </Link>
        </div>
        {recentCommissions.length > 0 ? (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {recentCommissions.map((comm) => (
              <div key={comm.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">+ ₹{comm.amount.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">{comm.deal.lead.name}</p>
                </div>
                <Badge
                  variant={comm.status === "PAID" ? "success" : comm.status === "PENDING" ? "warning" : "default"}
                  className="text-[9px] uppercase tracking-tighter h-5"
                >
                  {comm.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-zinc-400 text-xs">No earnings yet.</div>
        )}
      </div>
    </div>
  )
}
