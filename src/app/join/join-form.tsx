"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitApplication } from "@/app/actions/recruitment"
import { LucideAlertCircle, LucideCheckCircle2 } from "lucide-react"

export function JoinForm() {
  const searchParams = useSearchParams()
  const referralCode = searchParams.get("ref") || ""

  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState("SUB_SALES_AGENT")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await submitApplication(formData)
      if ("error" in res && res.error) {
        const errorVal = res.error as any;
        if (typeof errorVal === "string") setError(errorVal)
        else if (errorVal.general) setError(errorVal.general[0])
        else setError("Please check all fields and try again.")
      } else if (res.success) {
        setSuccess(true)
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setIsPending(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <LucideCheckCircle2 className="h-12 w-12 text-emerald-500" />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Application Submitted!</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Thank you for applying. Our team will review your application and contact you soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" required placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" required placeholder="+91 9876543210" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" required placeholder="john@example.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">City / Region</Label>
          <Input id="location" name="location" placeholder="Mumbai, Maharashtra" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestedRole">I want to join as a:</Label>
          <select 
            id="requestedRole" 
            name="requestedRole"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
            required
          >
            <option value="SALESPERSON">Direct Salesperson (Internal)</option>
            <option value="SALES_AGENT">Sales Agent</option>
            <option value="SUB_SALES_AGENT">Sub Sales Agent</option>
          </select>
        </div>

        {referralCode ? (
          <div className="space-y-2">
            <Label htmlFor="referrerCode">Referral Code</Label>
            <Input id="referrerCode" name="referrerCode" defaultValue={referralCode} readOnly className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500" />
            <p className="text-xs text-zinc-500">You were invited by this agent.</p>
          </div>
        ) : (role === "SALES_AGENT" || role === "SUB_SALES_AGENT") ? (
          <div className="space-y-2">
            <Label htmlFor="referrerCode">Referrer Code *</Label>
            <Input id="referrerCode" name="referrerCode" required placeholder="e.g. AGT-0001" />
            <p className="text-xs text-zinc-500">A parent agent code is required for this role.</p>
          </div>
        ) : (
          <div className="space-y-2 hidden">
             <Input id="referrerCode" name="referrerCode" defaultValue="" />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Why do you want to join? (Optional)</Label>
          <textarea 
            id="notes" 
            name="notes"
            rows={3}
            className="flex w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
          ></textarea>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-500">
          <LucideAlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  )
}
