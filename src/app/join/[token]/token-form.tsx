"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitApplication } from "@/app/actions/recruitment"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  SALESPERSON: "Direct Salesperson",
  SALES_AGENT: "Sales Agent",
  SUB_SALES_AGENT: "Sub Sales Agent",
}

interface Props {
  token: string
  presetRole: string
  presetCommissionRate: number
}

export function TokenJoinForm({ token, presetRole, presetCommissionRate }: Props) {
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("requestedRole", presetRole)
    formData.set("inviteToken", token)

    try {
      const res = await submitApplication(formData)
      if ("error" in res && res.error) {
        const errorVal = res.error as any
        if (typeof errorVal === "string") setError(errorVal)
        else if (errorVal.general) setError(errorVal.general[0])
        else setError("Please check all fields and try again.")
      } else if (res.success) {
        setSuccess(true)
      }
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setIsPending(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-5 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-zinc-900 p-10 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Application Submitted!</h2>
          <p className="text-sm text-zinc-500 mt-2">
            Your application is now under review. You&apos;ll receive login credentials via email once approved.
          </p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 w-full text-left space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">What happens next?</p>
          <ol className="text-xs text-zinc-500 space-y-1 mt-2 list-decimal list-inside">
            <li>Admin reviews your application</li>
            <li>You receive your login credentials (default: solar123)</li>
            <li>Log in and start earning commissions 💰</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      {/* Role badge */}
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-50 dark:border-zinc-800">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Joining as</p>
          <p className="text-sm font-black text-primary">{ROLE_LABELS[presetRole] ?? presetRole}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Commission Rate</p>
          <p className="text-sm font-black text-emerald-600">{presetCommissionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-bold">Full Name *</Label>
          <Input id="name" name="name" required placeholder="Rajesh Kumar" className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-bold">Phone Number *</Label>
          <Input id="phone" name="phone" required placeholder="+91 9876543210" className="rounded-xl" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold">Email Address *</Label>
        <Input id="email" name="email" type="email" required placeholder="rajesh@example.com" className="rounded-xl" />
        <p className="text-[10px] text-zinc-400">Your login credentials will be sent to this email.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location" className="text-xs font-bold">City / Region</Label>
        <Input id="location" name="location" placeholder="Mumbai, Maharashtra" className="rounded-xl" />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <Button
        className="w-full rounded-xl font-black h-11 shadow-lg shadow-primary/20"
        type="submit"
        disabled={isPending}
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
        ) : (
          "Submit Application 🚀"
        )}
      </Button>

      <p className="text-center text-[10px] text-zinc-400">
        By applying, you agree to the Arpit Solar partner terms.
      </p>
    </form>
  )
}
