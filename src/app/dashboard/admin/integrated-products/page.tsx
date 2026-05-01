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
    Search,
    ChevronRight,
    Plus
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
        <div className="space-y-4 md:space-y-8 max-w-7xl mx-auto pb-10">
            {/* ── App-style Header ── */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/admin">
                    <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </Link>
                <div>
                    <p className="text-[10px] md:hidden font-black text-zinc-400 uppercase tracking-widest">Solutions</p>
                    <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        Integrated Products
                    </h1>
                    <p className="text-sm text-zinc-500 hidden md:block italic font-medium">Pre-configured solar packages and pricing</p>
                </div>
            </div>

            {/* ── Form Section ── */}
            <div className="max-w-4xl mx-auto md:mx-0">
                <IntegratedProductForm onSaved={() => fetchItems()} />
            </div>

            {/* ── Catalog Section ── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2 uppercase tracking-widest italic">
                        <Package className="w-4 h-4 text-primary" />
                        Active Catalog
                    </h2>
                    <Badge variant="outline" className="text-[10px] font-black uppercase border-zinc-200 dark:border-zinc-800">
                        {items.length} Units
                    </Badge>
                </div>

                <Card className="border-none md:border md:shadow-sm bg-transparent md:bg-white dark:md:bg-zinc-900 overflow-hidden">
                    <CardContent className="p-0 md:p-6">
                        {loading && items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Refreshing Catalog...</p>
                            </div>
                        ) : error ? (
                            <div className="p-10 text-center text-red-500 font-bold bg-white dark:bg-zinc-900 rounded-2xl border border-red-100">
                                {error}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 mb-4">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">No products configured</h3>
                                <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">
                                    Start by adding a new configuration using the form above.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-zinc-50/50 dark:bg-zinc-800/30">
                                            <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 h-12">Product Solution</TableHead>
                                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Specs</TableHead>
                                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 text-right">Package Price</TableHead>
                                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 text-right pr-6">Created</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((it) => (
                                                <TableRow key={it.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group border-zinc-50 dark:border-zinc-800">
                                                    <TableCell className="py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                                <Layers className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight italic">{it.brand}</span>
                                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{it.id.split('-')[0]}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-none font-bold text-[10px] uppercase">
                                                                    {it.systemKw}kW System
                                                                </Badge>
                                                                <span className="text-[10px] text-zinc-300 dark:text-zinc-700 font-bold">•</span>
                                                                <span className="text-xs font-bold text-zinc-500 italic">{it.phase} Phase</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400">
                                                                <Zap className="w-3 h-3 text-primary fill-primary" />
                                                                {it.noOfModules} × {it.moduleWatt}W {it.moduleType}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right py-5">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-black text-zinc-900 dark:text-zinc-100 text-lg leading-none italic">₹{it.price.toLocaleString("en-IN")}</span>
                                                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">All Inclusive</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6 py-5">
                                                        <div className="flex items-center justify-end gap-2 text-zinc-400 font-black uppercase tracking-widest text-[10px]">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(it.createdAt)}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile View (App-style) */}
                                <div className="md:hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {items.map((it) => (
                                        <div key={it.id} className="p-5 active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                        <Layers className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-black text-zinc-900 dark:text-zinc-50 text-sm leading-tight tracking-tight italic uppercase">{it.brand}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[8px] h-4 px-1 font-black uppercase border-zinc-200 dark:border-zinc-700">
                                                                {it.systemKw}KW
                                                            </Badge>
                                                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{it.phase} PH</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-sm text-zinc-900 dark:text-zinc-100 leading-none italic">₹{it.price.toLocaleString("en-IN")}</p>
                                                    <p className="text-[8px] text-emerald-500 font-black uppercase mt-1">All Inclusive</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800/50">
                                                <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500">
                                                    <Zap className="w-3 h-3 text-primary fill-primary" />
                                                    <span className="font-black italic">{it.noOfModules} × {it.moduleWatt}W</span>
                                                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                                    <span className="font-bold uppercase tracking-tighter">{it.moduleType}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">{formatDate(it.createdAt)}</span>
                                                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
