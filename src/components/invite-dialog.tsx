"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { generateInviteToken } from "@/app/actions/recruitment"
import { Link2, Copy, Check, Loader2, QrCode, UserPlus } from "lucide-react"
import QRCode from "qrcode"

const ROLE_OPTIONS = [
  { value: "SUB_SALES_AGENT", label: "Sub Sales Agent" },
  { value: "SALES_AGENT", label: "Sales Agent" },
  { value: "SALESPERSON", label: "Direct Salesperson" },
]

const EXPIRY_OPTIONS = [
  { value: "24", label: "24 hours" },
  { value: "48", label: "2 days" },
  { value: "168", label: "7 days" },
]

export function InviteDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [role, setRole] = useState("SUB_SALES_AGENT")
  const [commissionRate, setCommissionRate] = useState("5")
  const [expiresInHours, setExpiresInHours] = useState("48")

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      setGeneratedLink(null)
      setQrDataUrl(null)
      setCopied(false)
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.set("roleForInvitee", role)
      formData.set("commissionRate", commissionRate)
      formData.set("expiresInHours", expiresInHours)

      const result = await generateInviteToken(formData)
      if (result.success && result.token) {
        const link = `${window.location.origin}/join/${result.token}`
        setGeneratedLink(link)
        // Generate QR code
        const qr = await QRCode.toDataURL(link, { margin: 1, width: 220, color: { dark: "#18181b", light: "#ffffff" } })
        setQrDataUrl(qr)
      }
    })
  }

  function handleCopy() {
    if (!generatedLink) return
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl font-bold border-primary/30 text-primary hover:bg-primary/5">
          <UserPlus className="w-4 h-4 mr-1.5" />
          Invite Agent
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-base font-black flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Generate Invite Link
          </DialogTitle>
          <p className="text-xs text-zinc-500 mt-0.5">Share this link to recruit new agents on the go.</p>
        </DialogHeader>

        {!generatedLink ? (
          <form onSubmit={handleGenerate} className="p-5 space-y-4">
            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Role for Invitee</label>
              <div className="grid grid-cols-1 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      role === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Commission Rate */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Commission Rate (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="flex-1 accent-primary"
                />
                <span className="text-sm font-black text-primary w-12 text-right">{commissionRate}%</span>
              </div>
            </div>

            {/* Expiry */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Link Expiry</label>
              <div className="grid grid-cols-3 gap-2">
                {EXPIRY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExpiresInHours(opt.value)}
                    className={`px-2 py-2 rounded-xl border text-xs font-bold transition-all ${
                      expiresInHours === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full rounded-xl font-black h-11 shadow-lg shadow-primary/20" disabled={isPending}>
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : "Generate Link 🔗"}
            </Button>
          </form>
        ) : (
          <div className="p-5 space-y-4">
            {/* QR Code */}
            {qrDataUrl && (
              <div className="flex justify-center p-3 bg-white rounded-2xl border border-zinc-100 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="Invite QR Code" className="w-44 h-44" />
              </div>
            )}

            {/* Link */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Shareable Link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  <p className="text-[10px] font-mono text-zinc-500 truncate">{generatedLink}</p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="rounded-xl h-9 w-9 flex-shrink-0 border-zinc-200 dark:border-zinc-700"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-zinc-400">Share via WhatsApp or copy to clipboard</p>
            </div>

            {/* WhatsApp share */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Hi! You're invited to join Arpit Solar as a partner. Click here to apply: ${generatedLink}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-[#25D366] hover:bg-[#20b859] text-white text-xs font-black transition-all shadow-md shadow-[#25D366]/20"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Share on WhatsApp
            </a>

            <Button
              variant="ghost"
              size="sm"
              className="w-full rounded-xl text-xs font-bold"
              onClick={() => { setGeneratedLink(null); setQrDataUrl(null) }}
            >
              Generate Another Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
