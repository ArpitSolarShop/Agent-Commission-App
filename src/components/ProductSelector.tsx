"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
    LayoutGrid, 
    ArrowRight, 
    Zap, 
    Battery, 
    Box as BoxIcon,
    Layers
} from "lucide-react";
import Link from 'next/link';
import type { Product } from '../types/quote';

interface ProductSelectorProps {
  onSelect?: (product: Product) => void;
  selectedProduct?: Product | null;
}

export const SupplierTabs = [
  {
    id: 'tata',
    label: 'Tata On-Grid',
    description: '560wp Modules',
    color: 'border-orange-500 text-orange-600 bg-orange-50',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: 'waaree-topcon',
    label: 'Waaree TOPCON',
    description: '580/600wp TOPCON',
    color: 'border-blue-500 text-blue-600 bg-blue-50',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'adani-topcon',
    label: 'Adani TOPCON',
    description: '580/600wp TOPCON',
    color: 'border-sky-500 text-sky-600 bg-sky-50',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'premier-topcon',
    label: 'Premier TOPCON',
    description: '580/600wp TOPCON',
    color: 'border-emerald-500 text-emerald-600 bg-emerald-50',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'waaree-dcr',
    label: 'Hybrid DCR',
    description: 'With Battery',
    color: 'border-purple-500 text-purple-600 bg-purple-50',
    icon: <Battery className="w-4 h-4" />,
  },
  {
    id: 'waaree-dcr-nobattery',
    label: 'Hybrid DCR',
    description: 'No Battery',
    color: 'border-indigo-500 text-indigo-600 bg-indigo-50',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: 'waaree-ndcr',
    label: 'Hybrid N-DCR',
    description: 'With Battery',
    color: 'border-pink-500 text-pink-600 bg-pink-50',
    icon: <Battery className="w-4 h-4" />,
  },
  {
    id: 'waaree-ndcr-nobattery',
    label: 'Hybrid N-DCR',
    description: 'No Battery',
    color: 'border-rose-500 text-rose-600 bg-rose-50',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: 'integrated',
    label: 'Integrated',
    description: 'System packages',
    color: 'border-teal-500 text-teal-600 bg-teal-50',
    icon: <BoxIcon className="w-4 h-4" />,
  },
];

export default function ProductSelector({ onSelect, selectedProduct }: ProductSelectorProps) {
  const [activeSupplier, setActiveSupplier] = useState<string>('tata');

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-600" />
            Product Ecosystem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {SupplierTabs.map((supplier) => (
            <div
              key={supplier.id}
              onClick={() => setActiveSupplier(supplier.id)}
              className={cn(
                "relative p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300 group hover:shadow-lg",
                activeSupplier === supplier.id 
                  ? cn("border-slate-900 bg-slate-50 ring-4 ring-slate-900/5 shadow-md", supplier.color.split(' ')[0].replace('border-', 'border-'))
                  : "border-slate-100 bg-white hover:border-slate-200"
              )}
            >
              {activeSupplier === supplier.id && (
                <div className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-full shadow-lg">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                    activeSupplier === supplier.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-600"
                )}>
                    {supplier.icon}
                </div>
                
                <div>
                    <h4 className={cn(
                        "text-sm font-black tracking-tight transition-colors",
                        activeSupplier === supplier.id ? "text-slate-900" : "text-slate-600"
                    )}>
                        {supplier.label}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {supplier.description}
                    </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-100">
            <Link href="/catalog" className="block w-full">
                <Button 
                    variant="outline" 
                    className="w-full h-12 rounded-xl border-slate-200 text-slate-600 font-black gap-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-[0.99]"
                >
                    <ArrowRight className="w-4 h-4" />
                    EXPLORE COMPLETE PRODUCT CATALOG
                </Button>
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}
