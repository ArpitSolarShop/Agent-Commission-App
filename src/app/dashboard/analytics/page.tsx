import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Filter
} from "lucide-react"

import { RevenueChart } from "@/components/analytics/revenue-chart"
import { ConversionFunnel } from "@/components/analytics/conversion-funnel"
import { AgentLeaderboard } from "@/components/analytics/agent-leaderboard"

export default async function AnalyticsDashboard() {
  const session = await auth()
  const role = session?.user?.role

  if (role !== "ADMIN" && role !== "SALESPERSON") {
    redirect("/dashboard")
  }

  // 1. Conversion Funnel Data
  const totalLeads = await prisma.lead.count()
  const qualifiedDeals = await prisma.deal.count({
    where: { status: { notIn: ["CLOSED_LOST"] } }
  })
  const closedWon = await prisma.deal.count({
    where: { status: "CLOSED_WON" }
  })

  const funnelData = [
    { stage: "Total Leads", count: totalLeads },
    { stage: "Qualified", count: qualifiedDeals },
    { stage: "Closed Won", count: closedWon },
  ]

  // 2. Top Agents Leaderboard
  // We'll calculate top agents by pulling agents with their paid commissions
  const agents = await prisma.agent.findMany({
    where: { isActive: true },
    include: {
      commissions: {
        where: { status: "PAID" }
      },
      ownedLeads: {
        include: { deals: { where: { status: "CLOSED_WON" } } }
      }
    }
  })

  const leaderboardData = agents.map(agent => {
    const totalEarned = agent.commissions.reduce((sum, c) => sum + c.amount, 0)
    let dealsClosed = 0
    agent.ownedLeads.forEach(lead => {
      dealsClosed += lead.deals.length
    })

    return {
      id: agent.id,
      name: agent.name,
      totalEarned,
      dealsClosed
    }
  }).sort((a, b) => b.totalEarned - a.totalEarned).slice(0, 5)

  // 3. Monthly Revenue & Commission (Last 6 months)
  // For simplicity, we'll fetch all CLOSED_WON deals and PAID commissions from the last 6 months
  // and bucket them by month.
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1) // Start of that month

  const recentDeals = await prisma.deal.findMany({
    where: { 
      status: "CLOSED_WON",
      closedAt: { gte: sixMonthsAgo }
    }
  })

  const recentCommissions = await prisma.commission.findMany({
    where: {
      status: "PAID",
      createdAt: { gte: sixMonthsAgo }
    }
  })

  // Initialize buckets
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthlyData: Record<string, { revenue: number, commission: number }> = {}

  for (let i = 0; i < 6; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`
    monthlyData[key] = { revenue: 0, commission: 0 }
  }

  recentDeals.forEach(deal => {
    if (deal.closedAt) {
      const key = `${monthNames[deal.closedAt.getMonth()]} ${deal.closedAt.getFullYear().toString().slice(2)}`
      if (monthlyData[key]) {
        monthlyData[key].revenue += (deal.dealValue || 0)
      }
    }
  })

  recentCommissions.forEach(comm => {
    const key = `${monthNames[comm.createdAt.getMonth()]} ${comm.createdAt.getFullYear().toString().slice(2)}`
    if (monthlyData[key]) {
      monthlyData[key].commission += comm.amount
    }
  })

  // Convert to array and reverse to chronological order
  const revenueChartData = Object.keys(monthlyData).map(key => ({
    month: key,
    revenue: monthlyData[key].revenue,
    commission: monthlyData[key].commission
  })).reverse()

  // 4. Additional Sales KPIs
  const activePipelineDeals = await prisma.deal.aggregate({
    _sum: { dealValue: true },
    where: { status: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } }
  })
  const pipelineValue = activePipelineDeals._sum.dealValue || 0

  const wonDealsAgg = await prisma.deal.aggregate({
    _avg: { dealValue: true },
    where: { status: "CLOSED_WON" }
  })
  const avgDealSize = wonDealsAgg._avg.dealValue || 0

  const closedDealsStats = await prisma.deal.findMany({
    where: { status: "CLOSED_WON", closedAt: { not: null } },
    select: { createdAt: true, closedAt: true }
  })
  let totalDays = 0
  closedDealsStats.forEach(d => {
    if (d.closedAt) {
      totalDays += (d.closedAt.getTime() - d.createdAt.getTime()) / (1000 * 3600 * 24)
    }
  })
  const avgTimeToClose = closedDealsStats.length > 0 ? Math.round(totalDays / closedDealsStats.length) : 0

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-20 md:pb-0">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] md:text-xs font-black text-zinc-400 uppercase tracking-widest">
          Performance & Metrics
        </p>
        <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Analytics Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* ── Left Column (Main Charts) ── */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Revenue Trends</span>
              <TrendingUp className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="p-4">
              <RevenueChart data={revenueChartData} />
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Conversion Funnel</span>
              <Filter className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="p-4">
              <ConversionFunnel data={funnelData} />
            </div>
          </div>

        </div>

        {/* ── Right Column (Leaderboard & Quick Stats) ── */}
        <div className="space-y-5">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Conversion */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 rounded-2xl border border-primary/20 p-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Win Rate</h3>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-primary">
                  {totalLeads > 0 ? Math.round((closedWon / totalLeads) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Pipeline */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Pipeline</h3>
              <div className="flex items-end gap-1">
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  ₹{pipelineValue > 100000 ? `${(pipelineValue / 100000).toFixed(1)}L` : pipelineValue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Avg Deal */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Avg Deal</h3>
              <div className="flex items-end gap-1">
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  ₹{avgDealSize > 100000 ? `${(avgDealSize / 100000).toFixed(1)}L` : avgDealSize.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Velocity */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Velocity</h3>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {avgTimeToClose}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 mb-1">DAYS</span>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Top Agents</span>
              <Users className="h-4 w-4 text-amber-500" />
            </div>
            <AgentLeaderboard data={leaderboardData} />
          </div>

        </div>
      </div>
    </div>
  )
}
