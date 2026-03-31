"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { approveCommission, disputeCommission, recordPayout } from "@/app/actions/deals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { 
  CheckCircle2, 
  XCircle, 
  Banknote, 
  MessageSquare,
  ChevronDown
} from "lucide-react"

export function CommissionActions({ commission, isAdmin }: { commission: any; isAdmin: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [showDispute, setShowDispute] = useState(false)
  const [showPayout, setShowPayout] = useState(false)
  const router = useRouter()

  const isPaid = commission.status === "PAID"
  const isDisputed = commission.status === "DISPUTED"

  function handleApprove() {
    startTransition(async () => {
      const result = await approveCommission(commission.id)
      if (result.success) {
        router.refresh()
      }
    })
  }

  function handleDispute(formData: FormData) {
    const note = formData.get("note") as string
    startTransition(async () => {
      const result = await disputeCommission(commission.id, note)
      if (result.success) {
        setShowDispute(false)
        router.refresh()
      }
    })
  }

  function handlePayout(formData: FormData) {
    startTransition(async () => {
      const result = await recordPayout(commission.id, formData)
      if (result.success) {
        setShowPayout(false)
        router.refresh()
      }
    })
  }

  if (isPaid) return <span className="text-xs text-emerald-600 font-medium">Paid</span>

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {isAdmin && commission.status === "PENDING" && (
          <Button size="sm" variant="outline" onClick={handleApprove} disabled={isPending}>
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
          </Button>
        )}
        
        {isAdmin && (commission.status === "PENDING" || isDisputed) && (
          <Button size="sm" variant="ghost" onClick={() => setShowDispute(!showDispute)} disabled={isPending}>
            <MessageSquare className="h-3 w-3 mr-1" /> {isDisputed ? "Update Dispute" : "Dispute"}
          </Button>
        )}

        {isAdmin && commission.status === "APPROVED" && (
          <Button size="sm" variant="default" onClick={() => setShowPayout(!showPayout)} disabled={isPending}>
            <Banknote className="h-3 w-3 mr-1" /> Payout
          </Button>
        )}
      </div>

      {showDispute && (
        <Card className="absolute z-20 mt-10 w-64 shadow-xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs">Reason for Dispute</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-3">
            <form action={handleDispute} className="space-y-2">
              <Input name="note" placeholder="Write reason..." required defaultValue={commission.disputeNote ?? ""} className="text-xs" />
              <div className="flex gap-1 justify-end">
                <Button size="sm" variant="ghost" type="button" className="h-7 text-[10px]" onClick={() => setShowDispute(false)}>Cancel</Button>
                <Button size="sm" type="submit" className="h-7 text-[10px]">Submit</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showPayout && (
        <Card className="absolute z-20 mt-10 w-72 shadow-xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="py-2 px-4 border-b">
            <CardTitle className="text-sm">Record Payout</CardTitle>
          </CardHeader>
          <CardContent className="py-4 px-4">
            <form action={handlePayout} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Amount to Pay</label>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">₹{commission.amount.toLocaleString("en-IN")}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Payment Method</label>
                <Input name="method" placeholder="UPI, Bank, Cash..." required className="text-sm h-8" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Reference No.</label>
                <Input name="reference" placeholder="Ref/Txn ID" required className="text-sm h-8" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="ghost" type="button" className="flex-1 text-xs" onClick={() => setShowPayout(false)}>Cancel</Button>
                <Button size="sm" type="submit" className="flex-1 text-xs">Confirm Payment</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
