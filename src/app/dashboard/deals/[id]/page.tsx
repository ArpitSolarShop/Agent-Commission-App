import { getDealById } from "@/app/actions/deals"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, User, IndianRupee, Phone, Mail, MapPin, Calendar, Briefcase, ChevronRight } from "lucide-react"
import { DealStatusChanger } from "./status-changer"
import { DocumentManager } from "./document-manager"

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deal = await getDealById(id)

  if (!deal) notFound()

  const statusColor: Record<string, string> = {
    NEW_QUALIFIED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    SITE_VISIT_DONE: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    PROPOSAL_SENT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    NEGOTIATION: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    CLOSED_WON: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CLOSED_LOST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* ── App-style Header ── */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/deals">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
            {deal.name || "Deal Details"}
          </h1>
          <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest">
            {deal.lead.name}
          </p>
        </div>
        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wide ${statusColor[deal.status] || "bg-zinc-100 text-zinc-600"}`}>
          {deal.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* ── Deal Value Hero Card ── */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 rounded-3xl p-5 md:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Final Deal Value</p>
            <p className="text-3xl md:text-4xl font-black tracking-tight mt-1">₹{deal.dealValue.toLocaleString("en-IN")}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <IndianRupee className="h-7 w-7 text-emerald-400" />
          </div>
        </div>
        {(deal.originalPrice || deal.discount) && (
          <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-500">Original</p>
              <p className="text-sm font-bold text-zinc-300">₹{deal.originalPrice?.toLocaleString("en-IN") || "-"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-500">Discount</p>
              <p className="text-sm font-bold text-red-400">-₹{deal.discount?.toLocaleString("en-IN") || "0"}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Customer Details ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Customer</h2>
        </div>
        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
          <div className="flex items-center gap-3 px-5 py-3.5">
            <User className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            <span className="text-sm text-zinc-500 w-16 flex-shrink-0">Name</span>
            <Link href={`/dashboard/leads/${deal.lead.id}`} className="text-sm font-semibold text-primary ml-auto">
              {deal.lead.name}
            </Link>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <Phone className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            <span className="text-sm text-zinc-500 w-16 flex-shrink-0">Phone</span>
            <span className="text-sm font-medium ml-auto font-mono">{deal.lead.contacts?.[0]?.phoneNumber || "-"}</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <Mail className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            <span className="text-sm text-zinc-500 w-16 flex-shrink-0">Email</span>
            <span className="text-sm font-medium ml-auto truncate max-w-[180px]">{deal.lead.email || "-"}</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <MapPin className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            <span className="text-sm text-zinc-500 w-16 flex-shrink-0">Location</span>
            <span className="text-sm font-medium ml-auto">{deal.lead.location || "-"}</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <Briefcase className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            <span className="text-sm text-zinc-500 w-16 flex-shrink-0">Type</span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ml-auto ${deal.lead.customerType === "COMMERCIAL" ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-sky-700"}`}>
              {deal.lead.customerType || "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Deal Info ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Deal Info</h2>
        </div>
        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
          <div className="flex items-center gap-3 px-5 py-3.5">
            <span className="text-sm text-zinc-500 flex-1">Owner</span>
            <span className="text-sm font-semibold">{deal.lead.owner?.name || "-"}</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <span className="text-sm text-zinc-500 flex-1">Expected Close</span>
            <span className="text-sm font-semibold">{deal.expectedCloseDate ? deal.expectedCloseDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
          </div>
        </div>
      </div>

      {/* ── Update Status ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pipeline Stage</h2>
        </div>
        <div className="p-5">
          <DealStatusChanger dealId={deal.id} currentStatus={deal.status} />
        </div>
      </div>

      {/* ── Documents ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Documents</h2>
          <Link href={`/dashboard/quotation?dealId=${deal.id}&name=${encodeURIComponent(deal.lead.name)}&phone=${deal.lead.contacts?.[0]?.phoneNumber || ""}&email=${deal.lead.email || ""}`}>
            <button className="text-[10px] font-bold text-primary flex items-center gap-1 active:scale-95 transition-transform">
              <FileText className="h-3 w-3" />
              QUOTATION BUILDER
            </button>
          </Link>
        </div>
        <div className="p-5">
          <DocumentManager dealId={deal.id} docs={{
            quotationUrl: deal.quotationUrl,
            proposalUrl: deal.proposalUrl,
            agreementUrl: deal.agreementUrl,
            surveyReportUrl: deal.surveyReportUrl
          }} />
        </div>
      </div>

      {/* ── Commissions ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Commission Breakdown</h2>
        </div>
        {deal.commissions.length > 0 ? (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {deal.commissions.map((c) => (
              <div key={c.id} className="px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                  {c.agent.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{c.agent.name}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{c.agent.agentCode} · {c.role} · {c.rate}%</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-emerald-600">₹{c.amount.toLocaleString("en-IN")}</p>
                  <Badge
                    variant={c.status === "PAID" ? "success" : c.status === "APPROVED" ? "success" : c.status === "DISPUTED" ? "destructive" : "warning"}
                    className="text-[9px] h-4 px-1.5"
                  >
                    {c.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-zinc-400">
            <IndianRupee className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs font-medium">Commissions calculated when deal is &quot;CLOSED WON&quot;</p>
          </div>
        )}
      </div>

      {/* ── Notes ── */}
      {deal.notes && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Internal Notes</h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{deal.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}
