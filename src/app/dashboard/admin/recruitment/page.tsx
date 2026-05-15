import { getAllApplications } from "@/app/actions/recruitment"
import { RecruitmentTable } from "./recruitment-table"
import { InviteDialog } from "@/components/invite-dialog"
import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Recruitment Pipeline | Admin",
  description: "Review and approve new agent applications.",
}

export default async function RecruitmentPage() {
  const applications = await getAllApplications()
  const pending = applications.filter((a: any) => a.status === "PENDING")
  const approved = applications.filter((a: any) => a.status === "APPROVED")
  const rejected = applications.filter((a: any) => a.status === "REJECTED")

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Admin</p>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5">
            Recruitment Pipeline
          </h1>
          <p className="text-sm text-zinc-500">
            Review pending applications and generate invite links for new agents.
          </p>
        </div>
        <InviteDialog />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Pending</p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{pending.length}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Approved</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{approved.length}</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Rejected</p>
          <p className="text-2xl font-black text-zinc-500 mt-1">{rejected.length}</p>
        </div>
      </div>

      <RecruitmentTable applications={applications} />
    </div>
  )
}
