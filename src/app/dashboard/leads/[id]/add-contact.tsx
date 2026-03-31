"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { addLeadContact } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AddContactForm({ leadId }: { leadId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await addLeadContact(leadId, formData)
      if (result.error) {
        setError(typeof result.error === "string" ? result.error : "Failed")
      } else {
        router.refresh()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-2">
      <Input name="phoneNumber" placeholder="Phone number" required className="text-sm" />
      <Input name="label" placeholder="Label (e.g. Work)" className="text-sm" />
      <Button type="submit" size="sm" variant="outline" disabled={isPending} className="w-full">
        {isPending ? "Adding..." : "Add Contact"}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  )
}
