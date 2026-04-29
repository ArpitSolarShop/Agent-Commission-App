"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft, 
    Zap, 
    BarChart3, 
    Info, 
    Package, 
    ChevronRight,
    Search,
    Layers
} from "lucide-react";
import Link from 'next/link';
import { productCatalog, productStats } from '@/data/productCatalog';
import type { ProductCategory, ProductVariant } from '@/data/productCatalog';
import type { Product } from '@/types/quote';
import { formatCurrency } from '@/lib/utils';

export default function ProductCatalogView() {
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">System Catalog</h1>
                    <p className="text-slate-400 font-medium text-lg max-w-xl">
                        Comprehensive inventory of solar solutions across {productStats.categories} specialized categories.
                    </p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white font-bold rounded-2xl h-12 px-6 gap-2 backdrop-blur-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Pricing Calculator
                    </Button>
                </Link>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Products</p>
                            <p className="text-3xl font-black text-slate-900 leading-tight">{productStats.totalProducts}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Price Spectrum</p>
                            <p className="text-xl font-black text-slate-900 leading-tight">
                                {formatCurrency(productStats.priceRange.min)} - {formatCurrency(productStats.priceRange.max)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Module Technologies</p>
                            <div className="flex flex-wrap gap-1.5">
                                <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200">560W</Badge>
                                <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200">580W</Badge>
                                <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200">600W</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Accordion Catalog */}
        <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 px-2">
                <Search className="w-6 h-6 text-blue-600" />
                Browse Specifications
            </h2>
            
            <Accordion type="multiple" className="space-y-4">
                {productCatalog.map((category: ProductCategory, idx: number) => (
                    <AccordionItem 
                        key={idx} 
                        value={`item-${idx}`}
                        className="border-none bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden"
                    >
                        <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                            <div className="flex flex-1 items-center justify-between text-left">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-data-[state=open]:bg-blue-600 group-data-[state=open]:text-white transition-colors">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {category.category}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{category.supplier}</p>
                                    </div>
                                </div>
                                <Badge className="mr-4 bg-slate-100 text-slate-500 hover:bg-slate-100 border-none font-bold text-[10px]">
                                    {category.variants.reduce((sum: number, v: ProductVariant) => sum + v.products.length, 0)} SOLUTIONS
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-0">
                            <div className="space-y-8 mt-4">
                                {category.variants.map((variant: ProductVariant, vIdx: number) => (
                                    <div key={vIdx} className="space-y-4">
                                        <div className="flex flex-col gap-1 border-l-4 border-blue-600 pl-4">
                                            <h4 className="text-lg font-black text-slate-900">{variant.name}</h4>
                                            <p className="text-sm text-slate-500 font-medium italic">{variant.description}</p>
                                        </div>

                                        <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                                            <Table>
                                                <TableHeader className="bg-slate-50">
                                                    <TableRow className="hover:bg-transparent border-slate-100">
                                                        <TableHead className="font-bold text-slate-900 h-10">Capacity</TableHead>
                                                        <TableHead className="font-bold text-slate-900">Phase</TableHead>
                                                        <TableHead className="font-bold text-slate-900">Module Specs</TableHead>
                                                        <TableHead className="font-bold text-slate-900 text-right pr-6">Package Price</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {variant.products.map((product: Product, pIdx: number) => (
                                                        <TableRow key={pIdx} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                                            <TableCell className="font-black text-slate-900">{product.kWp} kWp</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className={`font-black text-[9px] uppercase ${
                                                                    product.phase === 1 ? 'border-emerald-200 text-emerald-600' : 'border-blue-200 text-blue-600'
                                                                }`}>
                                                                    {product.phase} Phase
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold text-slate-700">{product.qty} × {product.module}W Panels</span>
                                                                    <span className="text-[10px] text-slate-400 font-medium italic">{product.wire}m System Wiring Included</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right pr-6">
                                                                <span className="font-black text-blue-600 text-base">{formatCurrency(product.price)}</span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>

        {/* Legend / Info Footer */}
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/50 border-dashed border-2 border-slate-200">
            <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Info className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-black text-slate-900">Technical Glossary</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Capacity (kWp)</p>
                        <p className="text-sm font-medium text-slate-600">Kilowatt peak — the maximum potential power output under standard test conditions.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phase Type</p>
                        <p className="text-sm font-medium text-slate-600">1 Phase (Residential) vs 3 Phase (Commercial/Heavy Loads) electrical architecture.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Module Technology</p>
                        <p className="text-sm font-medium text-slate-600">High-efficiency TopCon or Mono Perc solar panels with varied wattage ratings.</p>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200/50">
                    <p className="text-xs font-bold text-slate-400 italic">
                        * Note: All prices reflected are base package prices. Statutory GST, delivery logistics, and customized structural modifications are calculated during final checkout.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
