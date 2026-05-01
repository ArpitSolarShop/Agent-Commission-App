import { auth } from "@/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, User, Database, ChevronRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function SettingsPage() {
  const session = await auth()

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      
      {/* ── App-style Header ── */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <p className="text-[10px] md:hidden font-black text-zinc-400 uppercase tracking-widest">Configuration</p>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 italic">
            Settings
          </h1>
        </div>
      </div>

      <div className="space-y-4">
        
        {/* Profile Card */}
        <div className="px-1">
            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <User className="w-3 h-3" />
                Account Details
            </h2>
        </div>
        <Card className="border-none bg-white dark:bg-zinc-900 rounded-3xl shadow-sm overflow-hidden border border-zinc-100 dark:border-zinc-800/50">
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Full Name</label>
                <Input 
                    defaultValue={session?.user?.name || ""} 
                    readOnly 
                    className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Email Address</label>
                <Input 
                    defaultValue={session?.user?.email || ""} 
                    readOnly 
                    className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 font-bold"
                />
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                <p className="text-[9px] text-zinc-500 font-bold uppercase text-center leading-relaxed">
                    Personal details are managed by the administrator. Contact support for modifications.
                </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <div className="px-1 pt-2">
            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Security & Privacy
            </h2>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm divide-y divide-zinc-50 dark:divide-zinc-800/50 overflow-hidden">
            <div className="p-5 flex items-center justify-between active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase italic">Update Password</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5">Change your access credentials</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300" />
            </div>

            <div className="p-5 flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase italic">2FA Authentication</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5">Extra layer of protection (Coming Soon)</p>
                    </div>
                </div>
                <Badge variant="outline" className="text-[8px] font-black uppercase">DISABLED</Badge>
            </div>
        </div>

        {/* Admin Section */}
        {session?.user?.role === "ADMIN" && (
          <>
            <div className="px-1 pt-2">
                <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Database className="w-3 h-3 text-red-500" />
                    Management Console
                </h2>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-red-100 dark:border-red-950/20 shadow-sm divide-y divide-zinc-50 dark:divide-zinc-800/50 overflow-hidden">
                <div className="p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500">
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase italic">Bulk Commission Tool</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5">Approve all pending records</p>
                        </div>
                    </div>
                    <Button variant="destructive" size="sm" className="font-black text-[9px] uppercase tracking-widest rounded-xl h-8">EXECUTE</Button>
                </div>

                <div className="p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase italic">Export Master Data</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5">Download entire database as CSV</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="font-black text-[9px] uppercase tracking-widest rounded-xl h-8 border-zinc-200 dark:border-zinc-800">EXPORT</Button>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
