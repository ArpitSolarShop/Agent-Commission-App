import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Target, 
  TrendingUp, 
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart,
  PieChart
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Welcome back, {session?.user?.name}. Here's what's happening.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow rounded-2xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 px-4 pt-4">
            <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Leads</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-extrabold tracking-tight">{totalLeads}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-2xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 px-4 pt-4">
            <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-extrabold tracking-tight">{activeDeals}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-2xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 px-4 pt-4">
            <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Earned</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-extrabold tracking-tight">₹{totalEarned > 1000 ? `${(totalEarned/1000).toFixed(1)}k` : totalEarned}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow rounded-2xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 px-4 pt-4">
            <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-extrabold tracking-tight">₹{pendingCommissions > 1000 ? `${(pendingCommissions/1000).toFixed(1)}k` : pendingCommissions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 uppercase tracking-widest text-xs font-bold text-zinc-400">
          <CardTitle className="text-sm">Deals Pipeline</CardTitle>
          <BarChart className="h-4 w-4 opacity-50" />
        </CardHeader>
        <CardContent className="px-2 md:px-6 pb-6">
          <DashboardChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Leads */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 uppercase tracking-widest text-xs font-bold text-zinc-400">
            <CardTitle className="text-sm">Recent Leads</CardTitle>
            <Link href="/dashboard/leads">
              <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2">VIEW ALL</Button>
            </Link>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <div className="space-y-1">
              {recentLeads.map((lead) => (
                <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors active:scale-[0.98]">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{lead.name}</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-medium">{lead.location || "N/A"}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider h-5">{lead.status}</Badge>
                  </div>
                </Link>
              ))}
              {recentLeads.length === 0 && (
                <div className="py-12 text-center text-zinc-400 text-sm">No leads yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Commissions */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 uppercase tracking-widest text-xs font-bold text-zinc-400">
            <CardTitle className="text-sm">Earnings</CardTitle>
            <Link href="/dashboard/commissions">
              <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2">LEDGER</Button>
            </Link>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <div className="space-y-1">
              {recentCommissions.map((comm) => (
                <div key={comm.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors active:scale-[0.98]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">+ ₹{comm.amount.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-medium">{comm.deal.lead.name}</span>
                  </div>
                  <Badge 
                    variant={comm.status === "PAID" ? "success" : comm.status === "PENDING" ? "warning" : "default"}
                    className="text-[9px] uppercase tracking-tighter h-5"
                  >
                    {comm.status}
                  </Badge>
                </div>
              ))}
              {recentCommissions.length === 0 && (
                <div className="py-12 text-center text-zinc-400 text-sm">No earnings yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
