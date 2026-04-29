"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Settings2,
  FileText,
  Home,
  Loader2,
  Phone,
  Mail,
  MapPin,
  FileBadge,
  Layers
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companyDetails } from "@/lib/companyDetails";

type DashboardStats = {
  totalQuotations: number;
  draftQuotations: number;
  sentQuotations: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotations: 0,
    draftQuotations: 0,
    sentQuotations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/quotations?limit=100");
        const data = await res.json();
        if (data.success) {
          const quotations = data.data || [];
          setStats({
            totalQuotations: quotations.length,
            draftQuotations: quotations.filter((q: any) => q.status === "draft").length,
            sentQuotations: quotations.filter((q: any) => q.status === "sent").length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const menuItems = [
    {
      title: "Create Quotation",
      description: "Build a new solar proposal",
      icon: <PlusCircle className="w-8 h-8" />,
      color: "text-emerald-600 bg-emerald-50",
      href: "/dashboard/quotation",
    },
    {
      title: "Manage Products",
      description: "Update solar catalog",
      icon: <Package className="w-8 h-8" />,
      color: "text-blue-600 bg-blue-50",
      href: "/dashboard/admin/products",
    },
    {
      title: "Manage Components",
      description: "Customize BOM items",
      icon: <Settings2 className="w-8 h-8" />,
      color: "text-amber-600 bg-amber-50",
      href: "/dashboard/admin/components",
    },
    {
      title: "Quotations",
      description: "View all generated quotes",
      icon: <FileText className="w-8 h-8" />,
      color: "text-purple-600 bg-purple-50",
      href: "/dashboard/admin/quotations",
    },
    {
      title: "Integrated Solutions",
      description: "Pre-configured solar packages",
      icon: <Layers className="w-8 h-8" />,
      color: "text-teal-600 bg-teal-50",
      href: "/dashboard/admin/integrated-products",
    },
  ];

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Console</h1>
            <p className="text-slate-500 font-medium">Monitoring and configuring {companyDetails.name}</p>
          </div>
          <Link href="/dashboard/quotation">
            <Button variant="outline" className="rounded-xl font-bold gap-2 shadow-sm border-slate-200">
              <Home className="w-4 h-4" />
              Main App
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="rounded-2xl border-none shadow-lg shadow-slate-200/50">
              <CardContent className="p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Proposals</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-4xl font-black text-slate-900">{stats.totalQuotations}</h2>
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-lg shadow-slate-200/50">
              <CardContent className="p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Draft Quotes</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-4xl font-black text-amber-600">{stats.draftQuotations}</h2>
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-400">
                    <FileBadge className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-lg shadow-slate-200/50">
              <CardContent className="p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Sent to Clients</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-4xl font-black text-emerald-600">{stats.sentQuotations}</h2>
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-400">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {menuItems.map((item) => (
              <Link key={item.title} href={item.href}>
                <Card className="group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border-none rounded-2xl cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className={`p-4 rounded-2xl ${item.color} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-tight">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Company Settings Summary */}
        <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Global Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Business Identifier</p>
                    <p className="font-bold text-sm">GSTIN: {companyDetails.gstin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Headquarters</p>
                    <p className="font-bold text-sm leading-tight max-w-xs">{companyDetails.headOffice}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Contact Line</p>
                    <p className="font-bold text-sm">{companyDetails.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Email Support</p>
                    <p className="font-bold text-sm">{companyDetails.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
