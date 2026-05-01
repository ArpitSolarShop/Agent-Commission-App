"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateDealStatus } from "@/app/actions/deals"

const STATUSES = [
  { value: "NEW_QUALIFIED", label: "New / Qualified", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "SITE_VISIT_DONE", label: "Site Visit Done", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "NEGOTIATION", label: "Negotiation", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "CLOSED_WON", label: "Closed Won ✓", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "CLOSED_LOST", label: "Closed Lost ✕", color: "bg-red-100 text-red-700 border-red-200" },
]

export function DealStatusChanger({ dealId, currentStatus }: { dealId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isClosed = currentStatus === "CLOSED_WON" || currentStatus === "CLOSED_LOST"

  function handleChange(status: string) {
    if (confirm(`Change status to "${STATUSES.find(s => s.value === status)?.label}"? This will trigger commission calculations if set to Closed Won.`)) {
      startTransition(async () => {
        const result = await updateDealStatus(dealId, status)
        if (result.success) {
          router.refresh()
        }
      })
    }
  }

  return (
    <div className="space-y-3">
      {/* Pill-style status selector for mobile */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => !isClosed && handleChange(s.value)}
            disabled={isPending || isClosed}
            className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
              currentStatus === s.value
                ? `${s.color} ring-2 ring-offset-1 ring-current/20 scale-105`
                : isClosed
                  ? "bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed"
                  : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {isClosed && <p className="text-[10px] text-zinc-400 font-medium">Deal is closed and immutable.</p>}
      {isPending && <p className="text-xs text-zinc-400 animate-pulse font-medium">Updating deal & commissions...</p>}
    </div>
  )
}
