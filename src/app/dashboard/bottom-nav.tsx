"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getNavItems } from "./nav-config"

export function BottomNav({ role }: { role: string }) {
  const pathname = usePathname()
  const items = getNavItems(role)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-100 bg-white/95 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/95 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <nav className="flex h-16 items-center justify-around px-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-full h-full rounded-2xl transition-all duration-200 active:scale-90",
                isActive
                  ? "text-primary"
                  : "text-zinc-400 dark:text-zinc-500"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-7 rounded-2xl transition-all duration-300",
                isActive && "bg-primary/10 dark:bg-primary/20"
              )}>
                <item.icon className={cn(
                  "h-[22px] w-[22px] transition-all duration-200",
                  isActive && "scale-110"
                )} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={cn(
                "text-[10px] leading-none tracking-tight transition-all",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
