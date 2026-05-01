"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LucideCopy, LucideCheck, LucideShare2 } from "lucide-react"

export function ReferralCard({ agentCode }: { agentCode: string }) {
  const [copied, setCopied] = useState(false)
  const link = typeof window !== "undefined" ? `${window.location.origin}/join?ref=${agentCode}` : `/join?ref=${agentCode}`

  function handleCopy() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: "Join Karan Agent Hub",
        text: "Join my team and start earning commissions!",
        url: link,
      }).catch(console.error)
    } else {
      handleCopy()
    }
  }

  if (!agentCode) return null

  return (
    <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Recruit New Agents</CardTitle>
        <CardDescription className="text-blue-700/70 dark:text-blue-300/70">
          Share your personal link to recruit sub-agents and earn overrides on their sales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input 
            readOnly 
            value={link} 
            className="bg-white/60 dark:bg-zinc-900/60 border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500" 
          />
          <Button onClick={handleCopy} variant="outline" className="shrink-0 border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/50">
            {copied ? <LucideCheck className="h-4 w-4" /> : <LucideCopy className="h-4 w-4" />}
          </Button>
          <Button onClick={handleShare} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
            <LucideShare2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
