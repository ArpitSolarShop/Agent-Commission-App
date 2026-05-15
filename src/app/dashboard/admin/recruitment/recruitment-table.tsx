"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { approveApplication, rejectApplication } from "@/app/actions/recruitment"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, X, UserPlus, Link2, Loader2, User, Phone, Mail, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const ROLE_COLORS: Record<string, string> = {
  SALESPERSON: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SALES_AGENT: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  SUB_SALES_AGENT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  REJECTED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
}

export function RecruitmentTable({ applications }: { applications: any[] }) {
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [defaultAgentCode, setDefaultAgentCode] = useState("")
  const [approveError, setApproveError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setDefaultAgentCode(`AGT-${Math.floor(1000 + Math.random() * 9000)}`)
      setApproveError(null)
    }
  }, [isOpen])

  async function handleApprove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsApproving(true)
    setApproveError(null)
    const formData = new FormData(e.currentTarget)
    formData.append("id", selectedApp.id)
    if (selectedApp.referrerId) formData.append("parentId", selectedApp.referrerId)

    const result = await approveApplication(formData)
    setIsApproving(false)
    if (result.error) {
      setApproveError(result.error as string)
    } else {
      setIsOpen(false)
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Reject this application?")) return
    setIsRejecting(id)
    await rejectApplication(id, "Rejected by admin")
    setIsRejecting(null)
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-16 text-center">
        <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <UserPlus className="h-7 w-7 text-zinc-400" />
        </div>
        <div>
          <h3 className="font-black text-zinc-900 dark:text-zinc-100">No Applications Yet</h3>
          <p className="text-zinc-500 text-sm mt-1">
            Generate an invite link and share it to start recruiting agents.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
          All Applications ({applications.length})
        </p>
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4 space-y-3"
          >
            {/* Name + status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                  {app.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-sm text-zinc-900 dark:text-zinc-100">{app.name}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">{app.location || "—"}</p>
                </div>
              </div>
              <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", STATUS_COLORS[app.status])}>
                {app.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Mail className="w-3 h-3 text-zinc-300" />{app.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Phone className="w-3 h-3 text-zinc-300" />{app.phone}
              </div>
            </div>

            {/* Role + Source */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", ROLE_COLORS[app.requestedRole])}>
                {app.requestedRole.replace(/_/g, " ")}
              </span>
              {app.inviteToken ? (
                <span className="flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <Link2 className="w-2.5 h-2.5" /> Via Invite Link
                </span>
              ) : (
                <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  Direct Apply
                </span>
              )}
            </div>

            {/* Referrer */}
            {app.referrer && (
              <p className="text-[10px] text-zinc-400">
                Under: <span className="font-bold text-zinc-600 dark:text-zinc-300">{app.referrer.name}</span> ({app.referrer.agentCode})
              </p>
            )}

            {/* Actions */}
            {app.status === "PENDING" && (
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="rounded-xl flex-1 font-black text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => { setSelectedApp(app); setIsOpen(true) }}
                >
                  <Check className="w-3 h-3 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl font-black text-xs h-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleReject(app.id)}
                  disabled={isRejecting === app.id}
                >
                  {isRejecting === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Candidate</th>
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Contact</th>
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Role</th>
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Source</th>
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Applied</th>
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{app.name}</p>
                      <p className="text-[10px] text-zinc-400">{app.location || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-500">
                  <p>{app.email}</p>
                  <p className="font-mono">{app.phone}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", ROLE_COLORS[app.requestedRole])}>
                    {app.requestedRole.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {app.inviteToken ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit">
                      <Link2 className="w-2.5 h-2.5" /> Invite Link
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      Direct
                    </span>
                  )}
                  {app.referrer && (
                    <p className="text-[10px] text-zinc-400 mt-1">Via {app.referrer.name}</p>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", STATUS_COLORS[app.status])}>
                    {app.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-500">
                  {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {app.status === "PENDING" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="rounded-xl font-black text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white px-3"
                        onClick={() => { setSelectedApp(app); setIsOpen(true) }}
                      >
                        <Check className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl font-black text-xs h-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2"
                        onClick={() => handleReject(app.id)}
                        disabled={isRejecting === app.id}
                      >
                        {isRejecting === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-400 italic">Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="text-base font-black">Confirm & Approve Agent</DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <form onSubmit={handleApprove} className="p-5 pt-3 space-y-4">
              {/* Applicant info */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 space-y-1">
                <p className="font-black text-sm text-zinc-900 dark:text-zinc-100">{selectedApp.name}</p>
                <p className="text-[10px] text-zinc-400">{selectedApp.email} · {selectedApp.phone}</p>
                {selectedApp.referrer && (
                  <p className="text-[10px] text-zinc-400">
                    Will report to: <span className="font-bold">{selectedApp.referrer.name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="agentCode" className="text-xs font-bold">Agent Code</Label>
                <Input id="agentCode" name="agentCode" defaultValue={defaultAgentCode} required className="rounded-xl font-mono" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="commissionType" className="text-xs font-bold">Type</Label>
                  <select
                    id="commissionType"
                    name="commissionType"
                    className="flex h-9 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-1 text-sm"
                    defaultValue={selectedApp?.inviteToken?.commissionRate ? "PERCENTAGE" : "PERCENTAGE"}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed (₹)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="commissionRate" className="text-xs font-bold">Rate</Label>
                  <Input
                    id="commissionRate"
                    name="commissionRate"
                    type="number"
                    step="0.01"
                    defaultValue={selectedApp?.inviteToken?.commissionRate ?? "5.0"}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              {approveError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs">
                  {approveError}
                </div>
              )}

              <p className="text-[10px] text-zinc-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-3">
                🔑 A login account will be created with the temporary password <strong>solar123</strong>.
                The agent should change it on first login.
              </p>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isApproving}>
                  {isApproving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Approving...</> : "Approve & Create"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
