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
  tiers?: { id: string; volumeThreshold: number; rate: number }[]
}

interface AgentOption {
  id: string
  name: string
  agentCode: string
}

import { Plus, Trash2 } from "lucide-react"

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
  const [agentType, setAgentType] = React.useState(agent?.type ?? "SUB_SALES_AGENT")
  const [tiers, setTiers] = React.useState<{ volumeThreshold: number; rate: number }[]>(
    agent?.tiers ? agent.tiers.map(t => ({ volumeThreshold: t.volumeThreshold, rate: t.rate })) : []
  )

  const addTier = () => setTiers([...tiers, { volumeThreshold: 0, rate: 0 }])
  const removeTier = (idx: number) => setTiers(tiers.filter((_, i) => i !== idx))
  const updateTier = (idx: number, field: "volumeThreshold" | "rate", val: number) => {
    const newTiers = [...tiers]
    newTiers[idx][field] = val
    setTiers(newTiers)
  }

  async function handleSubmit(formData: FormData) {
    if (commType === "TIERED") {
      formData.set("tiersJson", JSON.stringify(tiers))
    }

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
              <label className="text-sm font-medium" htmlFor="agentCode">
                Agent Code {isEdit && "*"}
              </label>
              <Input 
                id="agentCode" 
                name="agentCode" 
                required={isEdit} 
                placeholder={isEdit ? "AGT-001" : "Auto-generated"} 
                defaultValue={agent?.agentCode ?? ""} 
                readOnly={isEdit}
                className={!isEdit ? "bg-zinc-50 dark:bg-zinc-900/50" : ""}
              />
              {!isEdit && (
                <p className="text-[10px] text-zinc-500">Leave blank to auto-generate code.</p>
              )}
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
                value={agentType}
                onChange={(e) => setAgentType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="SALESPERSON">Salesperson</option>
                <option value="SALES_AGENT">Sales Agent</option>
                <option value="SUB_SALES_AGENT">Sub Sales Agent</option>
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
                <option value="TIERED">Volume Tiered (%)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="commissionRate">
                {commType === "FIXED_AMOUNT" 
                  ? "Commission Amount ($)" 
                  : commType === "TIERED" 
                    ? "Base Commission Rate (%)" 
                    : "Commission Rate (%)"}
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

          {commType === "TIERED" && (
            <div className="space-y-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Volume Tiers</label>
                <Button type="button" variant="outline" size="sm" onClick={addTier} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add Tier
                </Button>
              </div>
              
              {tiers.length === 0 && (
                <div className="text-xs text-zinc-500 italic pb-2">No tiers added. Base rate will apply.</div>
              )}

              {tiers.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Threshold (₹)</label>
                    <Input 
                      type="number" min="0" required
                      value={tier.volumeThreshold} 
                      onChange={e => updateTier(idx, "volumeThreshold", Number(e.target.value))} 
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Tier Rate (%)</label>
                    <Input 
                      type="number" min="0" step="0.1" required
                      value={tier.rate} 
                      onChange={e => updateTier(idx, "rate", Number(e.target.value))} 
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="mt-5 text-zinc-400 hover:text-red-500" onClick={() => removeTier(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="parentId">
              Parent Agent {(agentType === "SALES_AGENT" || agentType === "SUB_SALES_AGENT") && "*"}
            </label>
            <select
              id="parentId"
              name="parentId"
              required={agentType === "SALES_AGENT" || agentType === "SUB_SALES_AGENT"}
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
