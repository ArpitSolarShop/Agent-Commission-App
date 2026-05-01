import { SideNav } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UserCircle } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <SideNav role={session.user.role} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Mobile Header — compact app-bar style */}
        <header className="h-12 md:h-14 border-b border-zinc-100 dark:border-zinc-800/50 bg-white/95 backdrop-blur-xl dark:bg-zinc-900/95 flex items-center px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="bg-primary p-1 rounded-lg">
              <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-black">K</span>
              </div>
            </div>
            <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              Karan Agent Hub
            </h2>
          </div>

          <h2 className="hidden md:block text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Dashboard</h2>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{session.user.name}</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{session.user.role}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              <UserCircle className="h-5 w-5 text-zinc-500" />
            </div>
          </div>
        </header>

        {/* Main content — extra bottom padding for bottom nav on mobile */}
        <main className="flex-1 p-4 md:p-6 pb-28 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <BottomNav role={session.user.role} />
      </div>
    </div>
  )
}

