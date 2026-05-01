"use client"

import { useState, useTransition } from "react"
import { updateDealDocuments } from "@/app/actions/deals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExternalLink, Link2, Pencil, X, Check } from "lucide-react"

interface DocLinkProps {
  dealId: string
  label: string
  field: "quotationUrl" | "proposalUrl" | "agreementUrl" | "surveyReportUrl"
  initialUrl: string | null
}

function DocLinkEditor({ dealId, label, field, initialUrl }: DocLinkProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [url, setUrl] = useState(initialUrl || "")
  const [isPending, startTransition] = useTransition()

  async function handleSave() {
    startTransition(async () => {
      await updateDealDocuments(dealId, { [field]: url })
      setIsEditing(false)
    })
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 text-sm w-full">
        <span className="text-zinc-500 w-24 flex-shrink-0">{label}:</span>
        <Input 
          size={1}
          className="h-7 text-xs flex-1" 
          placeholder="Paste document URL..." 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          disabled={isPending}
        />
        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={handleSave} disabled={isPending}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400" onClick={() => { setUrl(initialUrl || ""); setIsEditing(false) }} disabled={isPending}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex justify-between items-center text-sm w-full group">
      <span className="text-zinc-500 w-24 flex-shrink-0">{label}:</span> 
      <div className="flex-1 flex justify-end items-center gap-2">
        {initialUrl ? (
          <a href={initialUrl} target="_blank" className="text-primary hover:underline flex items-center gap-1 font-medium truncate max-w-[150px]">
            <Link2 className="h-3 w-3" /> View
          </a>
        ) : (
          <span className="text-zinc-400 italic text-xs">Not uploaded</span>
        )}
        <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
          <Pencil className="h-3 w-3 text-zinc-500" />
        </Button>
      </div>
    </div>
  )
}

export function DocumentManager({ dealId, docs }: { 
  dealId: string; 
  docs: { quotationUrl: string | null; proposalUrl: string | null; agreementUrl: string | null; surveyReportUrl: string | null } 
}) {
  return (
    <div className="space-y-3">
      <DocLinkEditor dealId={dealId} label="Quotation" field="quotationUrl" initialUrl={docs.quotationUrl} />
      <DocLinkEditor dealId={dealId} label="Proposal" field="proposalUrl" initialUrl={docs.proposalUrl} />
      <DocLinkEditor dealId={dealId} label="Agreement" field="agreementUrl" initialUrl={docs.agreementUrl} />
      <DocLinkEditor dealId={dealId} label="Site Survey" field="surveyReportUrl" initialUrl={docs.surveyReportUrl} />
    </div>
  )
}
