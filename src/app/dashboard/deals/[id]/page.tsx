import { getDealById } from "@/app/actions/deals"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft } from "lucide-react"
import { DealStatusChanger } from "./status-changer"

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deal = await getDealById(id)

  if (!deal) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/deals">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Deal Details</h1>
          <p className="text-sm text-zinc-500">
            For Lead: <Link href={`/dashboard/leads/${deal.lead.id}`} className="text-primary hover:underline">{deal.lead.name}</Link>
          </p>
        </div>
        <Badge variant={deal.status === "CLOSED_WON" ? "success" : deal.status === "CLOSED_LOST" ? "destructive" : "outline"} className="text-sm px-3 py-1">
          {deal.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Deal Value</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{deal.dealValue.toLocaleString("en-IN")}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Update Status</CardTitle></CardHeader>
          <CardContent>
            <DealStatusChanger dealId={deal.id} currentStatus={deal.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Category</CardTitle></CardHeader>
          <CardContent><div className="text-lg font-medium">{deal.category ?? "General"}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Commission Breakdown</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deal.commissions.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{c.agent.name}</span>
                      <span className="text-[10px] text-zinc-500">{c.agent.agentCode}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{c.role}</Badge></TableCell>
                  <TableCell>{c.rate}%</TableCell>
                  <TableCell className="font-bold">₹{c.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "PAID" ? "success" : c.status === "APPROVED" ? "success" : c.status === "DISPUTED" ? "destructive" : "warning"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {deal.commissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-zinc-400">
                    Commissions will be calculated when the deal is &quot;CLOSED WON&quot;.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {deal.notes && (
        <Card>
          <CardHeader><CardTitle>Internal Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-zinc-600 dark:text-zinc-400">{deal.notes}</p></CardContent>
        </Card>
      )}
    </div>
  )
}
