import { getLeadById } from "@/app/actions/leads"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react"
import { LeadStatusChanger } from "./status-changer"
import { AddContactForm } from "./add-contact"

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  NEW: "outline",
  CONTACTED: "secondary",
  QUALIFIED: "warning",
  PROPOSAL: "default",
  NEGOTIATION: "default",
  CLOSED_WON: "success",
  CLOSED_LOST: "destructive",
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = await getLeadById(id)

  if (!lead) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leads">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
          <p className="text-sm text-zinc-500">
            Owned by <Link href={`/dashboard/agents/${lead.owner.id}`} className="text-primary hover:underline">{lead.owner.name}</Link>
            {" "}· Source: {lead.sourceType}
          </p>
        </div>
        <Badge variant={statusVariant[lead.status] ?? "outline"} className="text-sm px-3 py-1">
          {lead.status.replace("_", " ")}
        </Badge>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lead.contacts.map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-zinc-400" />
                <span className="font-mono">{c.phoneNumber}</span>
                {c.isPrimary && <Badge variant="secondary" className="text-[10px]">Primary</Badge>}
                {c.label && <span className="text-zinc-400 text-xs">({c.label})</span>}
              </div>
            ))}
            {lead.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />{lead.email}
              </div>
            )}
            {lead.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" />{lead.location}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Pipeline Status</CardTitle></CardHeader>
          <CardContent>
            <LeadStatusChanger leadId={lead.id} currentStatus={lead.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Add Contact</CardTitle></CardHeader>
          <CardContent>
            <AddContactForm leadId={lead.id} />
          </CardContent>
        </Card>
      </div>

      {lead.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{lead.notes}</p></CardContent>
        </Card>
      )}

      {/* Deals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Deals ({lead.deals.length})</CardTitle>
          <Link href={`/dashboard/deals/new?leadId=${lead.id}`}>
            <Button size="sm" variant="outline">Create Deal</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Commissions</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lead.deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">₹{deal.dealValue.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge variant={deal.status === "CLOSED_WON" ? "success" : deal.status === "CLOSED_LOST" ? "destructive" : "outline"}>
                      {deal.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {deal.commissions.length > 0
                      ? deal.commissions.map((c) => `${c.agent.name}: ₹${c.amount}`).join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/deals/${deal.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {lead.deals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-zinc-400">No deals yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lead.activities.map((a) => (
              <div key={a.id} className="flex gap-3 text-sm border-l-2 border-zinc-200 dark:border-zinc-700 pl-4 py-1">
                <div className="flex-1">
                  <span className="font-medium">{a.type}</span>
                  {a.oldValue && <span className="text-zinc-500"> from {a.oldValue}</span>}
                  {a.newValue && <span className="text-zinc-500"> → {a.newValue}</span>}
                  {a.note && <p className="text-zinc-400 text-xs mt-0.5">{a.note}</p>}
                </div>
                <time className="text-xs text-zinc-400 whitespace-nowrap">
                  {new Date(a.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                </time>
              </div>
            ))}
            {lead.activities.length === 0 && (
              <p className="text-zinc-400 text-sm text-center py-4">No activity recorded yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
