// Using standard div for avatar to avoid missing dependency
interface AgentData {
  id: string
  name: string
  totalEarned: number
  dealsClosed: number
}

interface AgentLeaderboardProps {
  data: AgentData[]
}

export function AgentLeaderboard({ data }: AgentLeaderboardProps) {
  if (!data || data.length === 0) {
    return (
      <div className="py-10 text-center text-zinc-400 text-xs font-bold">
        No agents found.
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
      {data.map((agent, index) => (
        <div key={agent.id} className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="w-8 flex justify-center">
              <span className={`text-sm font-black ${
                index === 0 ? "text-amber-500 text-lg" : 
                index === 1 ? "text-zinc-400 text-base" : 
                index === 2 ? "text-amber-700 text-sm" : "text-zinc-300 dark:text-zinc-600"
              }`}>
                #{index + 1}
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-zinc-100 dark:border-zinc-800">
              <span className="text-primary text-xs font-black uppercase">
                {agent.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{agent.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                {agent.dealsClosed} DEALS CLOSED
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              ₹{agent.totalEarned.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Earned</p>
          </div>
        </div>
      ))}
    </div>
  )
}
