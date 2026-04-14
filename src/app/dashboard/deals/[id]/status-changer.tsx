"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateDealStatus } from "@/app/actions/deals"

const STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED_WON", "CLOSED_LOST"]

export function DealStatusChanger({ dealId, currentStatus }: { dealId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isClosed = currentStatus === "CLOSED_WON" || currentStatus === "CLOSED_LOST"

  function handleChange(status: string) {
    if (confirm(`Are you sure you want to change the status to ${status}? This will trigger commission calculations if set to CLOSED_WON.`)) {
      startTransition(async () => {
        const result = await updateDealStatus(dealId, status)
        if (result.success) {
          router.refresh()
        }
      })
    }
  }

  return (
    <div className="space-y-2">
      <select
        value={currentStatus}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending || isClosed}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace("_", " ")}</option>
        ))}
      </select>
      {isClosed && <p className="text-[10px] text-zinc-500">Deal is closed and immutable.</p>}
      {isPending && <p className="text-xs text-zinc-400 animate-pulse">Updating deal & commissions...</p>}
    </div>
  )
}
