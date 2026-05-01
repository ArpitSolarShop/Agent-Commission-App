import { getAgentHierarchy } from "@/app/actions/agents"
import { HierarchyTree } from "./hierarchy-tree"
import { GraphView } from "./graph-view"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Network, TreeDeciduous } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function HierarchyPage() {
  const agents = await getAgentHierarchy()

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* ── App-style Header ── */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/agents">
          <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <p className="text-[10px] md:hidden font-black text-zinc-400 uppercase tracking-widest">Reporting</p>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 italic">
            Network View
          </h1>
          <p className="text-sm text-zinc-500 hidden md:block font-medium">Visual view of your agent hierarchy and reporting structure.</p>
        </div>
      </div>
      
      <Tabs defaultValue="graph" className="w-full">
        <div className="flex justify-center md:justify-start mb-6">
            <TabsList className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl h-12 p-1 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                <TabsTrigger 
                    value="graph" 
                    className="rounded-xl px-6 h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                    <Network className="w-3.5 h-3.5" />
                    Interactive Graph
                </TabsTrigger>
                <TabsTrigger 
                    value="tree" 
                    className="rounded-xl px-6 h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                    <TreeDeciduous className="w-3.5 h-3.5" />
                    Tree View
                </TabsTrigger>
            </TabsList>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm overflow-hidden min-h-[500px]">
            <TabsContent value="graph" className="m-0 h-[600px]">
                <GraphView agents={agents as any} />
            </TabsContent>
            <TabsContent value="tree" className="m-0 p-6">
                <HierarchyTree agents={agents as any} />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
