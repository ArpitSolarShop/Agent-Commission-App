import { validateInviteToken } from "@/app/actions/recruitment"
import { TokenJoinForm } from "./token-form"
import { notFound } from "next/navigation"
import { Zap, AlertTriangle, Clock } from "lucide-react"

export default async function TokenJoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const result = await validateInviteToken(token)

  if (!result.valid && result.reason === "not_found") {
    notFound()
  }

  const roleLabels: Record<string, string> = {
    SALESPERSON: "Direct Salesperson",
    SALES_AGENT: "Sales Agent",
    SUB_SALES_AGENT: "Sub Sales Agent",
  }

  // Invalid (expired / used)
  if (!result.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
            {result.reason === "expired"
              ? <Clock className="w-8 h-8 text-amber-500" />
              : <AlertTriangle className="w-8 h-8 text-amber-500" />
            }
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {result.reason === "expired" ? "Link Expired" : "Link Already Used"}
          </h1>
          <p className="text-zinc-500 text-sm">
            {result.reason === "expired"
              ? "This invite link has expired. Please ask the person who sent it to generate a new one."
              : "This invite link has already been used to submit an application."
            }
          </p>
        </div>
      </div>
    )
  }

  const { data } = result

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Arpit Solar · Partner Network
            </p>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
              You&apos;re Invited! 🎉
            </h1>
          </div>
          {data?.creatorName && (
            <p className="text-sm text-zinc-500">
              <span className="font-bold text-zinc-700 dark:text-zinc-300">{data.creatorName}</span> has invited you to join as a{" "}
              <span className="font-bold text-primary">{roleLabels[data.roleForInvitee] ?? data.roleForInvitee}</span>.
            </p>
          )}
          {!data?.creatorName && (
            <p className="text-sm text-zinc-500">
              You have been invited to join as a{" "}
              <span className="font-bold text-primary">{roleLabels[data!.roleForInvitee] ?? data!.roleForInvitee}</span>.
            </p>
          )}
          <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-1.5 text-xs shadow-sm">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-500">Expires {new Date(data!.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>

        {/* Form */}
        <TokenJoinForm
          token={token}
          presetRole={data!.roleForInvitee}
          presetCommissionRate={data!.commissionRate}
        />
      </div>
    </div>
  )
}
