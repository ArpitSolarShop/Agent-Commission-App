"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { approveApplication, rejectApplication } from "@/app/actions/recruitment"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LucideCheck, LucideX, LucideUserPlus } from "lucide-react"

export function RecruitmentTable({ applications }: { applications: any[] }) {
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [defaultAgentCode, setDefaultAgentCode] = useState("")


  useEffect(() => {
    if (isOpen) {
      setDefaultAgentCode(`AGT-${Math.floor(1000 + Math.random() * 9000)}`)
    }
  }, [isOpen])

  async function handleApprove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsApproving(true)
    const formData = new FormData(e.currentTarget)
    formData.append("id", selectedApp.id)
    if (selectedApp.referrerId) {
      formData.append("parentId", selectedApp.referrerId)
    }
    
    await approveApplication(formData)
    setIsApproving(false)
    setIsOpen(false)
  }

  async function handleReject(id: string) {
    if (!confirm("Are you sure you want to reject this application?")) return
    setIsRejecting(true)
    await rejectApplication(id, "Rejected by admin")
    setIsRejecting(false)
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <LucideUserPlus className="h-12 w-12 text-zinc-400" />
        <h3 className="text-xl font-semibold">No Pending Applications</h3>
        <p className="text-zinc-500">When candidates apply, they will appear here for review.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
            <tr>
              <th className="p-4 font-medium">Candidate</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Role Requested</th>
              <th className="p-4 font-medium">Referred By</th>
              <th className="p-4 font-medium">Applied On</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{app.name}</div>
                  <div className="text-xs text-zinc-500">{app.location || "No location provided"}</div>
                </td>
                <td className="p-4">
                  <div>{app.email}</div>
                  <div className="text-zinc-500">{app.phone}</div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {app.requestedRole}
                  </span>
                </td>
                <td className="p-4">
                  {app.referrer ? (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{app.referrer.name}</span>
                      <span className="text-xs text-zinc-500">({app.referrer.agentCode})</span>
                    </div>
                  ) : (
                    <span className="text-zinc-400 italic">Direct</span>
                  )}
                </td>
                <td className="p-4 text-zinc-500">
                  {new Date(app.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      onClick={() => {
                        setSelectedApp(app)
                        setIsOpen(true)
                      }}
                    >
                      <LucideCheck className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleReject(app.id)}
                      disabled={isRejecting}
                    >
                      <LucideX className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Approve Agent Application</DialogTitle>
            <DialogDescription>
              Assign an agent code and starting commission rate to finalize onboarding for {selectedApp?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <form onSubmit={handleApprove} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="agentCode">Agent Code (Unique ID)</Label>
                <Input 
                  id="agentCode" 
                  name="agentCode" 
                  defaultValue={defaultAgentCode} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="commissionType">Commission Type</Label>
                <select 
                  id="commissionType" 
                  name="commissionType"
                  className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commissionRate">Initial Rate / Amount</Label>
                <Input id="commissionRate" name="commissionRate" type="number" step="0.01" defaultValue="5.0" required />
              </div>

              {selectedApp.referrerId && (
                <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  This agent will be placed under <strong>{selectedApp.referrer.name}</strong> in the hierarchy.
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isApproving}>
                  {isApproving ? "Approving..." : "Confirm & Create"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
