import { getPendingApplications } from "@/app/actions/recruitment"
import { RecruitmentTable } from "./recruitment-table"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recruitment Pipeline | Admin",
  description: "Review and approve new agent applications.",
}

export default async function RecruitmentPage() {
  const applications = await getPendingApplications()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Recruitment Pipeline
        </h1>
        <p className="text-sm text-zinc-500">
          Review and approve new agents and channel partners applying to join the network.
        </p>
      </div>

      <RecruitmentTable applications={applications} />
    </div>
  )
}
