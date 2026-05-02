"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"

interface FunnelData {
  stage: string
  count: number
}

interface ConversionFunnelProps {
  data: FunnelData[]
}

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-lg">
        <p className="text-[10px] font-black tracking-widest uppercase text-zinc-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
          <span className="text-zinc-400 mr-2">COUNT:</span>
          {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm font-bold text-zinc-400">
        No funnel data available.
      </div>
    )
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{
            top: 0,
            right: 20,
            left: 20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" strokeOpacity={0.5} />
          <XAxis 
            type="number" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }}
          />
          <YAxis 
            dataKey="stage" 
            type="category" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
