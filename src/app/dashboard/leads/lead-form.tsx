"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { createLead, checkDuplicatePhone } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react"

interface AgentOption {
  id: string
  name: string
  agentCode: string
}

export function LeadForm({ 
  agents, 
  defaultOwnerId, 
  role 
}: { 
  agents: AgentOption[]; 
  defaultOwnerId?: string;
  role: string;
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dupStatus, setDupStatus] = useState<{ checking: boolean; result: { isDuplicate: boolean; existingLead?: { name: string; owner: { name: string } } } | null }>({ checking: false, result: null })
  const [formError, setFormError] = useState<string | null>(null)

  async function handlePhoneBlur(e: React.FocusEvent<HTMLInputElement>) {
    const phone = e.target.value.trim()
    if (phone.length < 10) return

    setDupStatus({ checking: true, result: null })
    const result = await checkDuplicatePhone(phone)
    setDupStatus({ checking: false, result })
  }

  async function handleSubmit(formData: FormData) {
    setFormError(null)
    startTransition(async () => {
      const result = await createLead(formData)
      if (result.success) {
        router.push("/dashboard/leads")
        router.refresh()
      } else if (result.error) {
        const errors = result.error as Record<string, string[]>
        const firstErr = Object.values(errors).flat()[0]
        setFormError(firstErr || "Submission failed")
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
        <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">New Lead</h1>
      </div>

      <form action={handleSubmit} className="space-y-5">
        {/* Customer Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Customer Info</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="name">Customer Name *</label>
              <Input id="name" name="name" required placeholder="Ravi Sharma" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="phoneNumber">Phone Number *</label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                required
                placeholder="9876543210"
                onBlur={handlePhoneBlur}
                className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-mono"
              />
              {dupStatus.checking && (
                <p className="text-xs text-zinc-500 animate-pulse">Checking for duplicates...</p>
              )}
              {dupStatus.result?.isDuplicate && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-xl p-3">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    This phone belongs to <strong>{dupStatus.result.existingLead?.name}</strong>{" "}
                    (owned by {dupStatus.result.existingLead?.owner?.name})
                  </span>
                </div>
              )}
              {dupStatus.result && !dupStatus.result.isDuplicate && (
                <div className="flex items-center gap-2 text-xs text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Phone number is available</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="email">Email</label>
                <Input id="email" name="email" type="email" placeholder="ravi@email.com" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="location">Location *</label>
                <Input id="location" name="location" required placeholder="City / Address" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="customerType">Customer Type</label>
              <select
                id="customerType"
                name="customerType"
                className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
              >
                <option value="">Select Type...</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Source & Assignment (Admin/Salesperson only) */}
        {role === "ADMIN" || role === "SALESPERSON" ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Assignment</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="sourceType">Lead Source *</label>
                <select
                  id="sourceType"
                  name="sourceType"
                  required
                  defaultValue="AGENT"
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                >
                  <option value="AGENT">Agent</option>
                  <option value="SALESPERSON">Salesperson</option>
                  <option value="DIRECT">Direct</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="ownerId">Lead Owner *</label>
                <select
                  id="ownerId"
                  name="ownerId"
                  required
                  defaultValue={defaultOwnerId ?? ""}
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                >
                  <option value="" disabled>Select owner...</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.agentCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden">
            <input type="hidden" name="sourceType" value="AGENT" />
            <input type="hidden" name="ownerId" value={defaultOwnerId ?? ""} />
          </div>
        )}

        {/* Notes */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Notes</span>
          </div>
          <div className="p-4">
            <Textarea id="notes" name="notes" placeholder="Additional details about the lead..." className="min-h-[80px] rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
          </div>
        </div>

        {/* Error */}
        {formError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-2xl p-4">
            <AlertTriangle className="h-4 w-4" />
            {formError}
          </div>
        )}

        {/* Submit */}
        <div className="pt-2 pb-6 space-y-3">
          <Button type="submit" disabled={isPending || dupStatus.result?.isDuplicate} className="w-full h-12 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
            ) : (
              "Submit Lead"
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
