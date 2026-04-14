import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, User, Database } from "lucide-react"

export default async function SettingsPage() {
  const session = await auth()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage your account and platform configurations.
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <User className="h-5 w-5 text-zinc-400" />
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input defaultValue={session?.user?.name || ""} readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue={session?.user?.email || ""} readOnly />
              </div>
            </div>
            <p className="text-xs text-zinc-500">Contact admin to change these details.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Shield className="h-5 w-5 text-zinc-400" />
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your authentication and password.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-zinc-500">Change your password frequently for better security.</p>
                </div>
                <Button variant="outline" size="sm">Update Password</Button>
              </div>
              <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-zinc-500">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" size="sm" disabled>Enable 2FA</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {session?.user?.role === "ADMIN" && (
          <Card className="border-red-100 dark:border-red-950/20">
            <CardHeader className="flex flex-row items-center gap-4">
              <Database className="h-5 w-5 text-red-500" />
              <div>
                <CardTitle className="text-red-600 dark:text-red-400">Platform Management</CardTitle>
                <CardDescription>Advanced administrative controls.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 border-red-50 dark:border-red-950/10">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Bulk Commission Approval</p>
                    <p className="text-xs text-zinc-500">Approve etc all pending commissions in one click.</p>
                  </div>
                  <Button variant="destructive" size="sm">Approve All</Button>
                </div>
                <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 border-red-50 dark:border-red-950/10">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Export Data</p>
                    <p className="text-xs text-zinc-500">Download system data in CSV format.</p>
                  </div>
                  <Button variant="outline" size="sm">Export CSV</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
