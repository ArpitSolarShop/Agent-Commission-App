"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
// Use basic lucide-react icons based on the roles
import { 
  Banknote, 
  LogOut
} from "lucide-react"

import { signOut } from "next-auth/react"
import { getNavItems } from "./nav-config"

export function SideNav({ role }: { role: string }) {
  const pathname = usePathname()
  const navItems = getNavItems(role)

  return (
    <aside className="fixed left-0 top-0 z-40 h-full w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hidden md:flex transition-all duration-300">
      <div className="flex h-14 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
          <div className="bg-primary p-1.5 rounded-lg">
            <Banknote className="h-5 w-5 text-white" />
          </div>
          <span className="tracking-tight">Karan Hub</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="grid gap-1.5 px-4 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}

