"use client"

import { useActionState } from "react"
import { authenticate } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LucideAlertCircle } from "lucide-react"

export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  )

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="admin@company.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          type="password"
          name="password"
          required
          placeholder="••••••••"
        />
      </div>

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Signing In..." : "Sign In"}
      </Button>

      {errorMessage && (
        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          <LucideAlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-500">{errorMessage}</p>
        </div>
      )}
    </form>
  )
}
