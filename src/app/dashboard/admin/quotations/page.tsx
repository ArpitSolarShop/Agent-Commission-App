"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Eye, 
  Trash2, 
  Search, 
  MessageCircle, 
  Printer,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Quotation = {
    id: string;
    quoteNumber: string | null;
    customerName: string;
    customerPhone: string | null;
    capacityKw: number | null;
    totalAmount: number | null;
    status: string;
    createdAt: string;
};

export default function QuotationsAdminPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/quotations?limit=100");
            const data = await res.json();
            if (data.success) {
                setQuotations(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch quotations:", error);
            toast.error("Failed to load quotations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quotation?")) return;

        try {
            const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Quotation deleted successfully");
                fetchQuotations();
            } else {
                toast.error(data.message || "Failed to delete quotation");
            }
        } catch (error) {
            console.error("Failed to delete quotation:", error);
            toast.error("An error occurred while deleting");
        }
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return "-";
        return new Intl.NumberFormat("en-IN", { 
            style: "currency", 
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status.toLowerCase()) {
            case "draft":
                return "secondary";
            case "sent":
                return "default";
            case "accepted":
                return "default"; // or "success" if we had one, Shadcn badge is limited
            case "rejected":
                return "destructive";
            default:
                return "outline";
        }
    };

    const filteredQuotations = quotations.filter(
        (q) =>
            q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.quoteNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.customerPhone?.includes(searchQuery)
    );

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen space-y-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/admin">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quotations</h1>
                            <p className="text-sm text-slate-500 font-medium">Manage and track customer solar proposals</p>
                        </div>
                    </div>
                    
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            className="pl-10 h-10 bg-white border-slate-200 shadow-sm rounded-xl"
                            placeholder="Search name, phone, or #..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Main Table Card */}
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <p className="text-sm font-bold uppercase tracking-widest">Loading Records...</p>
                            </div>
                        ) : filteredQuotations.length === 0 ? (
                            <div className="text-center py-20 bg-white">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No quotations found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-1">
                                    {searchQuery ? "Try adjusting your search filters." : "Start by creating a new quotation in the builder."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-900 h-12">Quote #</TableHead>
                                            <TableHead className="font-bold text-slate-900">Customer</TableHead>
                                            <TableHead className="font-bold text-slate-900">Capacity</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-right">Amount</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-center">Status</TableHead>
                                            <TableHead className="font-bold text-slate-900">Date</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredQuotations.map((quotation) => (
                                            <TableRow key={quotation.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <TableCell className="font-mono text-xs font-bold text-slate-400">
                                                    {quotation.quoteNumber || "---"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900">{quotation.customerName}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium">{quotation.customerPhone || "No Phone"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-100 font-bold">
                                                        {quotation.capacityKw ? `${quotation.capacityKw} KW` : "N/A"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-black text-slate-900">
                                                    {formatCurrency(quotation.totalAmount)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge 
                                                        variant={getStatusVariant(quotation.status)} 
                                                        className="uppercase text-[9px] tracking-tighter h-5 px-2"
                                                    >
                                                        {quotation.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-xs font-medium">
                                                    {formatDate(quotation.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right pr-4">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-green-600">
                                                            <MessageCircle className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                            onClick={() => handleDelete(quotation.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer Pagination Stats */}
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Showing {filteredQuotations.length} of {quotations.length} results
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-slate-200" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-slate-200" disabled>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
