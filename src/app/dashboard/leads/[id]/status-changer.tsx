"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateLeadStatus } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"]

export function LeadStatusChanger({ leadId, currentStatus }: { leadId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleChange(status: string) {
    startTransition(async () => {
      await updateLeadStatus(leadId, status, "system")
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <select
        value={currentStatus}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace("_", " ")}</option>
        ))}
      </select>
      {isPending && <p className="text-xs text-zinc-400 animate-pulse">Updating...</p>}
    </div>
  )
}
