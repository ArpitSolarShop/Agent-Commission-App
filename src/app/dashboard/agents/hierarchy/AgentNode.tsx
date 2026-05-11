import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AgentNodeData = {
  id: string;
  name: string;
  agentCode: string;
  type: string;
  parentId: string | null;
  commissionType: string;
  commissionRate: number;
  baseSalary?: number | null;
  isActive: boolean;
  _count: { ownedLeads: number; children: number };
  onView?: (id: string) => void;
};

export type AgentNodeType = Node<AgentNodeData, 'agentNode'>;

const TYPE_COLORS: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  SALESPERSON: { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  SALES_AGENT: { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
  SUB_SALES_AGENT: { border: 'border-zinc-500', bg: 'bg-zinc-50', text: 'text-zinc-700', badge: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-100' },
};

export function AgentNode({ data, selected }: NodeProps<AgentNodeType>) {
  const styles = TYPE_COLORS[data.type] || TYPE_COLORS['SUB_SALES_AGENT'];

  return (
    <>
      {data.parentId && <Handle type="target" position={Position.Top} className="opacity-0" />}
      
      <div 
        className={cn(
          'w-[240px] rounded-lg bg-white border-2 shadow-sm transition-all duration-200 cursor-pointer overflow-hidden',
          styles.border,
          selected ? 'ring-4 ring-offset-2 ring-primary shadow-lg scale-105' : 'hover:shadow-md hover:scale-105',
          !data.isActive && 'opacity-60 grayscale'
        )}
        onClick={() => data.onView?.(data.id)}
      >
        <div className={cn('h-1.5 w-full', styles.bg, 'brightness-90')} />
        
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg', styles.bg, styles.text)}>
                {data.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-900 truncate max-w-[120px]" title={data.name}>
                  {data.name}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {data.agentCode}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <Badge variant="secondary" className={cn('text-[10px] uppercase font-semibold px-2 py-0.5', styles.badge)}>
              {data.type.replace(/_/g, ' ')}
            </Badge>
            
            {data._count.ownedLeads > 0 && (
              <div className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
                <Users className="w-3 h-3" />
                <span>{data._count.ownedLeads} Leads</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </>
  );
}
