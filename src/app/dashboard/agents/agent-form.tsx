"use client"

import { useRouter } from "next/navigation"
import React, { useTransition } from "react"
import { createAgent, updateAgent } from "@/app/actions/agents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Agent {
  id: string
  name: string
  agentCode: string
  email: string | null
  phone: string | null
  type: string
  parentId: string | null
  commissionType: string
  commissionRate: number
}

interface AgentOption {
  id: string
  name: string
  agentCode: string
}

export function AgentForm({
  agent,
  allAgents,
}: {
  agent?: Agent | null
  allAgents: AgentOption[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = !!agent
  const [commType, setCommType] = React.useState(agent?.commissionType ?? "PERCENTAGE")

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEdit
        ? await updateAgent(agent!.id, formData)
        : await createAgent(formData)

      if (result.success) {
        router.push("/dashboard/agents")
        router.refresh()
      }
    })
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Agent" : "Add New Agent"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Name *</label>
              <Input id="name" name="name" required defaultValue={agent?.name ?? ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="agentCode">Agent Code *</label>
              <Input id="agentCode" name="agentCode" required placeholder="AGT-001" defaultValue={agent?.agentCode ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" name="email" type="email" defaultValue={agent?.email ?? ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="phone">Phone</label>
              <Input id="phone" name="phone" defaultValue={agent?.phone ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                required
                defaultValue={agent?.type ?? "SUB_AGENT"}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="SALESPERSON">Salesperson</option>
                <option value="CHANNEL_PARTNER">Channel Partner</option>
                <option value="SUB_AGENT">Sub Agent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="commissionType">Commission Type *</label>
              <select
                id="commissionType"
                name="commissionType"
                required
                value={commType}
                onChange={(e) => setCommType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="commissionRate">
                {commType === "PERCENTAGE" ? "Commission Rate (%)" : "Commission Amount ($)"}
              </label>
              <Input
                id="commissionRate"
                name="commissionRate"
                type="number"
                step="0.1"
                min="0"
                {...(commType === "PERCENTAGE" ? { max: "100" } : {})}
                required
                defaultValue={agent?.commissionRate ?? 5}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="parentId">Parent Agent</label>
            <select
              id="parentId"
              name="parentId"
              defaultValue={agent?.parentId ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">— No Parent (Top Level) —</option>
              {allAgents
                .filter((a) => a.id !== agent?.id)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.agentCode})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update Agent" : "Create Agent"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
