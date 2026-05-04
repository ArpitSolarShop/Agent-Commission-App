import { getAgentById } from "@/app/actions/agents"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pencil, Users, Target, IndianRupee, ChevronRight, User, ShieldCheck } from "lucide-react"

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agent = await getAgentById(id)

  if (!agent) notFound()

  const totalCommission = agent.commissions.reduce((sum, c) => sum + c.amount, 0)

  const typeColor: Record<string, string> = {
    SALESPERSON: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    SALES_AGENT: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    SUB_SALES_AGENT: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto pb-10">
      {/* ── App-style Header ── */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/agents">
          <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
            {agent.name}
          </h1>
          <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest font-mono">
            {agent.agentCode}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={agent.isActive ? "success" : "destructive"} className="text-[9px] h-5 px-2 font-black uppercase">
            {agent.isActive ? "ACTIVE" : "INACTIVE"}
          </Badge>
          <Link href={`/dashboard/agents/${id}/edit`}>
            <button className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-90 transition-all">
              <Pencil className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* ── Agent Profile Summary Card ── */}
      <div className="bg-gradient-to-br from-primary/90 to-primary dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-6 text-white shadow-xl shadow-primary/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black">
            {agent.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-black">{agent.name}</h2>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${typeColor[agent.type] || "bg-white/20 text-white"}`}>
              {agent.type.replace("_", " ")}
            </span >
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Earnings</p>
            <p className="text-sm font-black mt-1 truncate">₹{totalCommission.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Rate</p>
            <p className="text-sm font-black mt-1 truncate">
               {agent.commissionType === "PERCENTAGE" ? `${agent.commissionRate}%` : `₹${agent.commissionRate}`}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Leads</p>
            <p className="text-sm font-black mt-1 truncate">{agent.ownedLeads.length}</p>
          </div>
        </div>
      </div>

      {/* ── Hierarchy Info ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Reports To</h2>
        </div>
        <div className="p-4">
          {agent.parent ? (
            <Link href={`/dashboard/agents/${agent.parent.id}`}>
              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50 active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{agent.parent.name}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{agent.parent.agentCode}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-300" />
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
               <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-400">
                  <ShieldCheck className="h-5 w-5" />
               </div>
               <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic">Top Level Administrator</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Sub-Agents ── */}
      {agent.children.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Downline ({agent.children.length})</h2>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {agent.children.map((child) => (
              <Link key={child.id} href={`/dashboard/agents/${child.id}`}>
                <div className="flex items-center gap-3 px-5 py-3.5 active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500">
                    {child.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{child.name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">{child._count.ownedLeads} Leads</p>
                  </div>
                  <Badge variant={child.isActive ? "success" : "outline"} className="text-[8px] h-4 px-1 flex-shrink-0">
                    {child.isActive ? "ACTIVE" : "OFF"}
                  </Badge>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Commission Ledger ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Earnings Ledger</h2>
        </div>
        {agent.commissions.length > 0 ? (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {agent.commissions.map((c) => (
              <div key={c.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Deal Reward</p>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-3 w-3 text-emerald-600" />
                    <span className="text-base font-black text-zinc-900 dark:text-zinc-100 italic">₹{c.amount.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-tighter">
                     {c.role} · {c.commissionType === "PERCENTAGE" ? `${c.rate}%` : `₹${c.rate}`}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={c.status === "APPROVED" ? "success" : c.status === "DISPUTED" ? "destructive" : "warning"}
                    className="text-[9px] font-black uppercase h-5"
                  >
                    {c.status}
                  </Badge>
                  <p className="text-[9px] text-zinc-400 mt-2 font-mono">{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-400">
            <IndianRupee className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-xs font-medium uppercase tracking-widest">No earnings recorded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
