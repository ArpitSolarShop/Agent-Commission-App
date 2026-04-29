"use client";

import React, { useState } from 'react';
import { integratedProductSchema, type IntegratedProductInput } from '../lib/schemas/integratedProduct';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, RotateCcw } from "lucide-react";

export default function IntegratedProductForm({ onSaved }: { onSaved?: (item?: any) => void }) {
  const [form, setForm] = useState<Partial<IntegratedProductInput>>({
    brand: '',
    system_kw: undefined,
    phase: 'Single',
    price: undefined,
    inverter_capacity_kw: undefined,
    module_watt: undefined,
    module_type: 'TopCon',
    no_of_modules: undefined,
  });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof IntegratedProductInput>(key: K, value: any) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  const resetForm = () => {
    setForm({ 
      brand: '', 
      system_kw: undefined, 
      phase: 'Single', 
      price: undefined, 
      inverter_capacity_kw: undefined, 
      module_watt: undefined, 
      module_type: 'TopCon', 
      no_of_modules: undefined 
    });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Validate with Zod
      const parsed = integratedProductSchema.parse({
        brand: form.brand,
        system_kw: typeof form.system_kw === 'string' ? parseFloat(form.system_kw as any) : form.system_kw,
        phase: form.phase,
        price: typeof form.price === 'string' ? parseFloat(form.price as any) : form.price,
        inverter_capacity_kw: typeof form.inverter_capacity_kw === 'string' ? parseFloat(form.inverter_capacity_kw as any) : form.inverter_capacity_kw,
        module_watt: typeof form.module_watt === 'string' ? parseInt(form.module_watt as any, 10) : form.module_watt,
        module_type: form.module_type,
        no_of_modules: typeof form.no_of_modules === 'string' ? parseInt(form.no_of_modules as any, 10) : form.no_of_modules,
      });

      setLoading(true);
      const res = await fetch('/api/integrated-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to save product');
      } else {
        toast.success('Product saved successfully');
        resetForm();
        onSaved?.(json.data ?? null);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
      <CardHeader className="bg-slate-900 text-white p-6">
        <CardTitle className="text-xl font-black">Configure Integrated Product</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Brand Name</Label>
              <Input 
                required 
                placeholder="e.g. Waaree" 
                value={form.brand ?? ''} 
                onChange={(e) => update('brand', e.target.value)} 
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">System Capacity (kW)</Label>
              <Input 
                required 
                type="number" 
                step="0.01" 
                placeholder="3.0"
                value={form.system_kw ?? ''} 
                onChange={(e) => update('system_kw', e.target.value)} 
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phase Type</Label>
              <Select 
                value={form.phase ?? 'Single'} 
                onValueChange={(val) => update('phase', val)}
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue placeholder="Select Phase" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="Single" className="rounded-lg">Single Phase</SelectItem>
                  <SelectItem value="Three" className="rounded-lg">Three Phase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Package Price (INR)</Label>
              <Input 
                required 
                type="number" 
                step="0.01" 
                placeholder="150000"
                value={form.price ?? ''} 
                onChange={(e) => update('price', e.target.value)} 
                className="h-11 rounded-xl border-slate-200 font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inverter (kW)</Label>
              <Input 
                required 
                type="number" 
                step="0.01" 
                placeholder="3.3"
                value={form.inverter_capacity_kw ?? ''} 
                onChange={(e) => update('inverter_capacity_kw', e.target.value)} 
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Module Wattage (W)</Label>
              <Input 
                required 
                type="number" 
                placeholder="550"
                value={form.module_watt ?? ''} 
                onChange={(e) => update('module_watt', e.target.value)} 
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Module Technology</Label>
              <Input 
                placeholder="TopCon / Mono Perc"
                value={form.module_type ?? 'TopCon'} 
                onChange={(e) => update('module_type', e.target.value)} 
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Modules</Label>
              <Input 
                required 
                type="number" 
                placeholder="6"
                value={form.no_of_modules ?? ''} 
                onChange={(e) => update('no_of_modules', e.target.value)} 
                className="h-11 rounded-xl border-slate-200 font-black"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl gap-2 shadow-lg shadow-slate-200"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Product Configuration
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={resetForm}
              className="px-6 h-12 rounded-xl border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 font-bold gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
