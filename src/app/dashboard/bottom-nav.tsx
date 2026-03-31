"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getNavItems } from "./nav-config"

export function BottomNav({ role }: { role: string }) {
  const pathname = usePathname()
  const items = getNavItems(role)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 md:hidden pb-safe">
      <nav className="flex h-full items-center justify-around px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors pb-1",
                isActive 
                  ? "text-primary" 
                  : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
              <span className="text-[10px] font-medium leading-none tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
