"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { createDeal } from "@/app/actions/deals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Deal Details</CardTitle></CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="leadId">Lead *</label>
            <select
              id="leadId"
              name="leadId"
              required
              defaultValue={defaultLeadId ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="" disabled>Select lead...</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dealValue">Deal Value (₹) *</label>
              <Input id="dealValue" name="dealValue" type="number" step="0.01" min="1" required placeholder="50000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category">Category</label>
              <Input id="category" name="category" placeholder="e.g. Solar Panel" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="notes">Notes</label>
            <Textarea id="notes" name="notes" placeholder="Deal details..." />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Deal"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
