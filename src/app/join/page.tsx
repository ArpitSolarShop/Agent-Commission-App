import { JoinForm } from "./join-form"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Join Karan Agent Hub",
  description: "Apply to become a sales partner and start earning commissions.",
}

export default function JoinPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Join Karan Agent Hub
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            Partner with us to distribute premium solar solutions. 
            Apply below and we&apos;ll get you set up.
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-12">Loading application form...</div>}>
          <JoinForm />
        </Suspense>
      </div>
    </div>
  )
}
