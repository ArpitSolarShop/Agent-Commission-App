"use client";

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
    Layers,
    IndianRupee,
    Settings2
} from "lucide-react";
import Link from 'next/link';
import { productCatalog, productStats } from '@/data/productCatalog';
import type { ProductCategory, ProductVariant } from '@/data/productCatalog';
import type { Product } from '@/types/quote';
import { formatCurrency } from '@/lib/utils';

export default function ProductCatalogView() {
  return (
    <div className="space-y-4 md:space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* ── App-style Header ── */}
      <div className="flex items-center gap-3 md:hidden px-1">
        <Link href="/dashboard">
          <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
            System Catalog
          </h1>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            {productStats.categories} Categories
          </p>
        </div>
      </div>

      {/* ── Premium Hero Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-950 p-6 md:p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">Solutions Inventory</h1>
                  <p className="text-zinc-400 font-medium text-sm md:text-lg max-w-xl">
                      Explore our complete range of certified solar components and package specifications.
                  </p>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/quotation">
                    <Button className="bg-white text-zinc-900 hover:bg-zinc-100 font-black rounded-2xl h-11 md:h-12 px-5 md:px-8 gap-2 active:scale-95 transition-transform shadow-xl shadow-white/5">
                        <Zap className="w-4 h-4 fill-current" />
                        BUILD QUOTE
                    </Button>
                </Link>
                <Link href="/dashboard/admin/products" className="hidden md:block">
                    <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl h-12 px-6 gap-2 backdrop-blur-sm">
                        <Settings2 className="w-4 h-4" />
                        MANAGE
                    </Button>
                </Link>
              </div>
          </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Package className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Inventory</span>
              </div>
              <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{productStats.totalProducts}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Pricing</span>
              </div>
              <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 truncate">
                  {formatCurrency(productStats.priceRange.min)} - {formatCurrency(productStats.priceRange.max)}
              </p>
          </div>

          <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-4 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Tech Stack</span>
              </div>
              <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[8px] font-black uppercase">TOPCON</Badge>
                  <Badge variant="outline" className="text-[8px] font-black uppercase">BIFACIAL</Badge>
                  <Badge variant="outline" className="text-[8px] font-black uppercase">HJT</Badge>
              </div>
          </div>
      </div>

      {/* ── Catalog Section ── */}
      <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2 uppercase tracking-widest italic">
                  <Search className="w-4 h-4 text-primary" />
                  Specifications
              </h2>
          </div>
          
          <Accordion type="multiple" className="space-y-3">
              {productCatalog.map((category: ProductCategory, idx: number) => (
                  <AccordionItem 
                      key={idx} 
                      value={`item-${idx}`}
                      className="border-none bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm"
                  >
                      <AccordionTrigger className="px-5 py-4 hover:no-underline group">
                          <div className="flex flex-1 items-center justify-between text-left">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-colors">
                                      <Layers className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors uppercase italic">
                                          {category.category}
                                      </h3>
                                      <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">{category.supplier}</p>
                                  </div>
                              </div>
                              <Badge className="mr-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-none font-black text-[9px] h-5">
                                  {category.variants.reduce((sum: number, v: ProductVariant) => sum + v.products.length, 0)} UNITS
                              </Badge>
                          </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-5 pt-0">
                          <div className="space-y-6 mt-4">
                              {category.variants.map((variant: ProductVariant, vIdx: number) => (
                                  <div key={vIdx} className="space-y-3">
                                      <div className="flex flex-col gap-0.5 border-l-2 border-primary pl-3">
                                          <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{variant.name}</h4>
                                          <p className="text-[10px] text-zinc-500 font-medium">{variant.description}</p>
                                      </div>

                                      {/* Mobile-friendly List instead of Table */}
                                      <div className="space-y-2">
                                          {variant.products.map((product: Product, pIdx: number) => (
                                              <div key={pIdx} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-700/50 flex items-center justify-between gap-3">
                                                  <div className="min-w-0">
                                                      <div className="flex items-center gap-2">
                                                          <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{product.kWp} kWp</span>
                                                          <Badge variant="outline" className={`font-black text-[8px] uppercase h-4 px-1 ${
                                                              product.phase === 1 ? 'border-emerald-200 text-emerald-600' : 'border-primary/20 text-primary'
                                                          }`}>
                                                              {product.phase} Phase
                                                          </Badge>
                                                      </div>
                                                      <p className="text-[9px] text-zinc-500 mt-0.5 font-medium italic">
                                                          {product.qty} × {product.module}W Panels · {product.wire}m Wiring
                                                      </p>
                                                  </div>
                                                  <div className="text-right flex-shrink-0">
                                                      <span className="text-sm font-black text-primary italic">₹{product.price.toLocaleString("en-IN")}</span>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </AccordionContent>
                  </AccordionItem>
              ))}
          </Accordion>
      </div>

      {/* ── Technical Info Footer ── */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 uppercase italic tracking-wider">Technical Glossary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Capacity (kWp)</p>
                  <p className="text-xs font-medium text-zinc-500">Kilowatt peak — the maximum potential power output under standard test conditions.</p>
              </div>
              <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Phase Type</p>
                  <p className="text-xs font-medium text-zinc-500">1 Phase (Residential) vs 3 Phase (Commercial/Heavy Loads) electrical architecture.</p>
              </div>
              <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Module Technology</p>
                  <p className="text-xs font-medium text-zinc-500">High-efficiency TopCon or Mono Perc solar panels with varied wattage ratings.</p>
              </div>
          </div>
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/50">
              <p className="text-[10px] font-bold text-zinc-400 italic leading-relaxed">
                  * Note: All prices reflected are base package prices. Statutory GST, delivery logistics, and customized structural modifications are calculated during final checkout.
              </p>
          </div>
      </div>
    </div>
  );
}
