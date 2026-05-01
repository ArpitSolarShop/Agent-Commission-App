"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { createDeal } from "@/app/actions/deals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"

interface LeadOption {
  id: string
  name: string
}

export function DealForm({ leads, defaultLeadId }: { leads: LeadOption[]; defaultLeadId?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createDeal(formData)
      if (result.success) {
        router.push(`/dashboard/deals/${result.dealId}`)
        router.refresh()
      }
    })
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* App-style header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">New Deal</h1>
      </div>

      <form action={handleSubmit} className="space-y-5">
        {/* Lead Selection */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="leadId">Select Lead *</label>
          </div>
          <div className="p-4">
            <select
              id="leadId"
              name="leadId"
              required
              defaultValue={defaultLeadId ?? ""}
              className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
            >
              <option value="" disabled>Choose a lead...</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pricing Details</label>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="originalPrice">Original Price (₹)</label>
                <Input id="originalPrice" name="originalPrice" type="number" step="0.01" min="0" placeholder="60,000" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="discount">Discount (₹)</label>
                <Input id="discount" name="discount" type="number" step="0.01" min="0" placeholder="10,000" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="dealValue">Final Deal Value (₹) *</label>
              <Input id="dealValue" name="dealValue" type="number" step="0.01" min="1" required placeholder="50,000" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-lg font-black" />
            </div>
          </div>
        </div>

        {/* Close Date & Notes */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Additional Info</label>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="expectedCloseDate">Expected Close Date</label>
              <Input id="expectedCloseDate" name="expectedCloseDate" type="date" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="notes">Notes</label>
              <Textarea id="notes" name="notes" placeholder="Any details about this deal..." className="min-h-[80px] rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 pb-6 space-y-3">
          <Button type="submit" disabled={isPending} className="w-full h-12 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating Deal...</>
            ) : (
              "Create Deal"
            )}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()} className="w-full h-11 rounded-2xl font-bold text-zinc-500">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
