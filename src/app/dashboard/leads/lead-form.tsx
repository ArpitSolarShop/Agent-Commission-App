"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { createLead, checkDuplicatePhone } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

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
  const [dupStatus, setDupStatus] = useState<{ checking: boolean; result: any }>({ checking: false, result: null })
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
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Submit New Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Customer Name *</label>
              <Input id="name" name="name" required placeholder="Ravi Sharma" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="phoneNumber">Phone Number *</label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                required
                placeholder="9876543210"
                onBlur={handlePhoneBlur}
              />
              {dupStatus.checking && (
                <p className="text-xs text-zinc-500 animate-pulse">Checking for duplicates...</p>
              )}
              {dupStatus.result?.isDuplicate && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    This phone belongs to <strong>{dupStatus.result.existingLead.name}</strong>{" "}
                    (owned by {dupStatus.result.existingLead.owner.name})
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" name="email" type="email" placeholder="ravi@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="location">Location *</label>
              <Input id="location" name="location" required placeholder="Enter city or address" />
            </div>
          </div>

          {role === "ADMIN" || role === "SALESPERSON" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="sourceType">Source *</label>
                <select
                  id="sourceType"
                  name="sourceType"
                  required
                  defaultValue="AGENT"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="AGENT">Agent</option>
                  <option value="SALESPERSON">Salesperson</option>
                  <option value="DIRECT">Direct</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="ownerId">Lead Owner *</label>
                <select
                  id="ownerId"
                  name="ownerId"
                  required
                  defaultValue={defaultOwnerId ?? ""}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          ) : (
            <div className="hidden">
              <input type="hidden" name="sourceType" value="AGENT" />
              <input type="hidden" name="ownerId" value={defaultOwnerId ?? ""} />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="notes">Notes</label>
            <Textarea id="notes" name="notes" placeholder="Additional details about the lead..." />
          </div>

          {formError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-3">
              <AlertTriangle className="h-4 w-4" />
              {formError}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isPending || dupStatus.result?.isDuplicate}>
              {isPending ? "Submitting..." : "Submit Lead"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
