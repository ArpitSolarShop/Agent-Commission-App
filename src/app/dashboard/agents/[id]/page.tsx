import { prisma } from "@/lib/prisma"
import { getAgentById } from "@/app/actions/agents"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, ArrowLeft } from "lucide-react"

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agent = await getAgentById(id)

  if (!agent) notFound()

  const totalCommission = agent.commissions.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
          <p className="text-sm text-zinc-500">{agent.agentCode} · {agent.type.replace("_", " ")}</p>
        </div>
        <div className="ml-auto">
          <Link href={`/dashboard/agents/${id}/edit`}>
            <Button variant="outline" size="sm"><Pencil className="mr-2 h-4 w-4" />Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Commission Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{agent.commissionType === "PERCENTAGE" ? `${agent.commissionRate}%` : `₹${agent.commissionRate}`}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Total Earned</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{totalCommission.toLocaleString("en-IN")}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Leads Owned</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{agent.ownedLeads.length}</div></CardContent>
        </Card>
      </div>

      {agent.parent && (
        <Card>
          <CardHeader><CardTitle>Reports To</CardTitle></CardHeader>
          <CardContent>
            <Link href={`/dashboard/agents/${agent.parent.id}`} className="text-primary hover:underline">
              {agent.parent.name} ({agent.parent.agentCode})
            </Link>
          </CardContent>
        </Card>
      )}

      {agent.children.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Sub‑Agents ({agent.children.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agent.children.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell>
                      <Link href={`/dashboard/agents/${child.id}`} className="font-medium hover:underline">
                        {child.name}
                      </Link>
                    </TableCell>
                    <TableCell>{child._count.ownedLeads}</TableCell>
                    <TableCell>
                      <Badge variant={child.isActive ? "success" : "destructive"}>
                        {child.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Commission Ledger</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Value</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agent.commissions.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>₹{c.deal.dealValue.toLocaleString("en-IN")}</TableCell>
                  <TableCell><Badge variant="outline">{c.role}</Badge></TableCell>
                  <TableCell>{c.commissionType === "PERCENTAGE" ? `${c.rate}%` : `₹${c.rate}`}</TableCell>
                  <TableCell className="font-medium">₹{c.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "APPROVED" ? "success" : c.status === "DISPUTED" ? "destructive" : "warning"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {agent.commissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-zinc-400">No commissions yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
