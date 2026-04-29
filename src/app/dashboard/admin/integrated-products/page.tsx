"use client";

import React, { useEffect, useState } from 'react';
import { 
    ArrowLeft, 
    Loader2, 
    Package, 
    Calendar, 
    Layers, 
    Zap,
    IndianRupee,
    Search
} from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
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
import IntegratedProductForm from '@/components/IntegratedProductForm';

export default function AdminIntegratedProductsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/integrated-products');
            const json = await res.json();
            if (json?.success) {
                setItems(json.data ?? []);
            } else {
                setError(json?.message ?? 'Failed to load products');
                toast.error(json?.message ?? 'Failed to load products');
            }
        } catch (e: any) {
            setError(String(e));
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchItems(); 
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", { 
            style: "currency", 
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/admin">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Integrated Solutions</h1>
                            <p className="text-sm text-slate-500 font-medium italic">Pre-configured solar packages and pricing</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="max-w-4xl">
                    <IntegratedProductForm onSaved={() => fetchItems()} />
                </div>

                {/* List Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-600" />
                            Active Catalog
                        </h2>
                        <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 font-bold">
                            {items.length} Products Found
                        </Badge>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            {loading && items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    <p className="text-sm font-bold uppercase tracking-widest leading-none">Refreshing Catalog...</p>
                                </div>
                            ) : error ? (
                                <div className="p-20 text-center text-red-500 font-bold bg-white">
                                    {error}
                                </div>
                            ) : items.length === 0 ? (
                                <div className="text-center py-20 bg-white">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No products configured</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto mt-1">
                                        Start by adding a new configuration using the form above.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="hover:bg-transparent border-slate-100">
                                                <TableHead className="font-bold text-slate-900 h-12">Product Solution</TableHead>
                                                <TableHead className="font-bold text-slate-900">Specs</TableHead>
                                                <TableHead className="font-bold text-slate-900 text-right">Package Price</TableHead>
                                                <TableHead className="font-bold text-slate-900 text-right pr-6">Created</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((it) => (
                                                <TableRow key={it.id} className="hover:bg-slate-50/50 transition-colors group border-slate-50">
                                                    <TableCell className="py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                                                <Layers className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-slate-900 uppercase tracking-tight">{it.brand}</span>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{it.id.split('-')[0]}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">
                                                                    {it.systemKw}kW System
                                                                </Badge>
                                                                <span className="text-[10px] text-slate-300">•</span>
                                                                <span className="text-xs font-bold text-slate-500 italic">{it.phase} Phase</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                                                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                                {it.noOfModules} × {it.moduleWatt}W {it.moduleType}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right py-5">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-black text-slate-900 text-lg leading-none">{formatCurrency(it.price)}</span>
                                                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">All Inclusive</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6 py-5">
                                                        <div className="flex items-center justify-end gap-2 text-slate-400 font-medium text-xs">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(it.createdAt)}
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
                </div>
            </div>
        </div>
    );
}
