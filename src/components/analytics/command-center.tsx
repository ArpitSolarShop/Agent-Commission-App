"use client"

import React, { useState, useMemo } from 'react';
import { 
  Zap, Target, Users, DollarSign, Package, TrendingUp, Activity, BarChart3, Award, ShieldCheck, UploadCloud
} from 'lucide-react';
import Papa from 'papaparse';
import { uploadAuditRecords } from '@/app/actions/audit-actions';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

const TARGET_REVENUE = 12000000; // 1.2 Crore
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const formatMoney = (num: number) => '₹' + num.toLocaleString('en-IN');
const toTitleCase = (str: string) => {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export function CommandCenter({ initialRecords }: { initialRecords: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRep, setSelectedRep] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const mappedData = results.data.map((row: any) => ({
                    customer: row.customer || row.Customer || row.Client || "",
                    mobile: row.mobile || row.Mobile || row.Phone || "",
                    date: row.date || row.Date || new Date().toISOString(),
                    capacity: parseFloat(row.capacity || row.Capacity || row.kW || "0"),
                    amount: parseFloat(row.amount || row.Amount || row.Invoice || "0"),
                    salesperson: row.salesperson || row.Salesperson || row.Executive || ""
                }));

                try {
                    const res = await uploadAuditRecords(mappedData);
                    if (res.success) {
                        alert(res.message);
                    } else {
                        alert("Failed: " + res.message);
                    }
                } catch (error) {
                    console.error(error);
                    alert("Upload failed.");
                } finally {
                    setIsUploading(false);
                }
            },
            error: (error) => {
                console.error(error);
                alert("Failed to parse CSV file.");
                setIsUploading(false);
            }
        });
    };

    const stats = useMemo(() => {
        const filteredData = initialRecords.filter(item => {
            const cleanRepName = toTitleCase(item.salesperson.trim());
            const matchesSearch = item.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  cleanRepName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRep = !selectedRep || cleanRepName === selectedRep;
            return matchesSearch && matchesRep;
        });

        if (!filteredData.length) return { filteredData, totalRevenue: 0, totalCapacity: 0, avgTicket: 0, revenuePerKw: 0, dealCount: 0, topSales: [], timeline: [], weekdayPerformance: [], capDist: [], topPerformer: null };

        let totalRevenue = 0;
        let totalCapacity = 0;
        const bySales: Record<string, { name: string, revenue: number, deals: number, capacity: number }> = {};
        const dailyData: Record<string, { date: string, revenue: number, deals: number }> = {};
        const weekdayMap: Record<string, number> = { "Sun":0, "Mon":0, "Tue":0, "Wed":0, "Thu":0, "Fri":0, "Sat":0 };
        const capSegments: Record<string, number> = {};

        filteredData.forEach(curr => {
            totalRevenue += curr.amount;
            totalCapacity += curr.capacity;

            const sp = toTitleCase(curr.salesperson || "Unknown");
            if (!bySales[sp]) bySales[sp] = { name: sp, revenue: 0, deals: 0, capacity: 0 };
            bySales[sp].revenue += curr.amount;
            bySales[sp].deals += 1;
            bySales[sp].capacity += curr.capacity;

            const d = new Date(curr.date).toISOString().split('T')[0];
            if (!dailyData[d]) dailyData[d] = { date: d, revenue: 0, deals: 0 };
            dailyData[d].revenue += curr.amount;
            dailyData[d].deals += 1;

            const dateObj = new Date(curr.date);
            if(!isNaN(dateObj.getTime())) {
                const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dateObj.getDay()];
                weekdayMap[dayName] += curr.amount;
            }

            let segment = "2-3 kW";
            if (curr.capacity > 4) segment = "5+ kW";
            else if (curr.capacity > 3) segment = "3.1-4 kW";
            else if (curr.capacity < 3) segment = "Sub 3 kW";
            capSegments[segment] = (capSegments[segment] || 0) + 1;
        });

        const sortedSales = Object.values(bySales).sort((a, b) => b.revenue - a.revenue);
        const timeline = Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const weekdayPerformance = Object.keys(weekdayMap).map(k => ({ name: k, revenue: weekdayMap[k] }));
        const capDist = Object.keys(capSegments).map(k => ({ name: k, value: capSegments[k] }));

        return {
            filteredData,
            totalRevenue,
            totalCapacity,
            avgTicket: totalRevenue / filteredData.length,
            revenuePerKw: totalRevenue / totalCapacity,
            dealCount: filteredData.length,
            topSales: sortedSales,
            timeline,
            weekdayPerformance,
            capDist,
            topPerformer: sortedSales[0] || null
        };
    }, [searchTerm, selectedRep]);

    const progress = Math.min((stats.totalRevenue / TARGET_REVENUE) * 100, 100);
    const avgKw = stats.dealCount ? (stats.totalCapacity / stats.dealCount).toFixed(2) : '0';
    const peakDateStr = stats.timeline.length ? [...stats.timeline].sort((a,b) => b.revenue - a.revenue)[0].date : 'N/A';

    return (
        <div className="space-y-6">
            {/* Target Milestone & High-Level Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="text-blue-500 w-4 h-4" />
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Revenue Milestone Tracking</span>
                            </div>
                            <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{formatMoney(stats.totalRevenue)}</h2>
                            <p className="text-zinc-500 mt-2 text-sm font-medium">Currently at <span className="text-blue-500 font-bold">{progress.toFixed(1)}%</span> of monthly goal (₹1.2 Cr)</p>
                            <div className="mt-6 w-full bg-zinc-100 dark:bg-zinc-800 h-4 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
                                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Month Deals</p>
                                    <p className="text-2xl font-black text-zinc-800 dark:text-zinc-200">{stats.dealCount}</p>
                                </div>
                                <Users className="text-blue-300 dark:text-blue-500 w-8 h-8" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Peak Date</p>
                                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 truncate">{peakDateStr}</p>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Avg kW</p>
                                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 truncate">{avgKw} kW</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="text-amber-500 w-4 h-4" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Top Performer</span>
                    </div>
                    <p className="text-2xl font-black tracking-tight text-zinc-800 dark:text-zinc-200">{stats.topPerformer?.name || "N/A"}</p>
                    <div className="mt-4 flex justify-between items-end border-t border-zinc-50 dark:border-zinc-800/50 pt-4">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Revenue</p>
                            <p className="text-sm font-black text-blue-500">{stats.topPerformer ? formatMoney(stats.topPerformer.revenue) : "₹0"}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Deals</p>
                            <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">{stats.topPerformer?.deals || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Revenue Pulse</p>
                        <h3 className="text-lg font-black tracking-tight dark:text-zinc-100">{formatMoney(stats.totalRevenue)}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm flex items-center gap-4">
                    <div className="bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Energy Load</p>
                        <h3 className="text-lg font-black tracking-tight dark:text-zinc-100">{stats.totalCapacity.toFixed(1)} kW</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm flex items-center gap-4">
                    <div className="bg-violet-100/50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Efficiency</p>
                        <h3 className="text-lg font-black tracking-tight dark:text-zinc-100">{formatMoney(Math.round(stats.revenuePerKw || 0))}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm flex items-center gap-4">
                    <div className="bg-orange-100/50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Avg Ticket</p>
                        <h3 className="text-lg font-black tracking-tight dark:text-zinc-100">{formatMoney(Math.round(stats.avgTicket || 0))}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Timeline */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm h-[300px] flex flex-col">
                        <h3 className="text-sm font-bold flex items-center gap-2 mb-2 uppercase tracking-wider text-zinc-400 dark:text-zinc-500 shrink-0">
                            <Activity className="text-blue-500 w-4 h-4" /> Revenue Flux
                        </h3>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.timeline}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
                                    <XAxis dataKey="date" tickFormatter={(val) => val.split('-').slice(1).join('/')} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(val) => `₹${(val/1000)}k`} />
                                    <RechartsTooltip formatter={(val: any) => formatMoney(Number(val))} contentStyle={{ borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm h-[200px] flex flex-col">
                            <h3 className="text-[10px] font-black mb-2 flex items-center gap-2 text-zinc-400 uppercase tracking-widest shrink-0">
                                <BarChart3 className="w-3 h-3" /> Weekday Flow
                            </h3>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.weekdayPerformance}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                        <RechartsTooltip formatter={(val: any) => formatMoney(Number(val))} cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm h-[200px] flex flex-col">
                            <h3 className="text-[10px] font-black mb-2 flex items-center gap-2 text-zinc-400 uppercase tracking-widest shrink-0">
                                <Package className="w-3 h-3" /> Capacity Segments
                            </h3>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={stats.capDist} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                                            {stats.capDist.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm h-[220px] flex flex-col">
                        <h3 className="text-[10px] font-black mb-2 flex items-center gap-2 text-zinc-400 uppercase tracking-widest shrink-0">
                            <Users className="w-3 h-3" /> Systems Sold by Executive
                        </h3>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[...stats.topSales].sort((a, b) => b.deals - a.deals)}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
                                    <XAxis dataKey="name" tickFormatter={(v) => v.split(' ')[0]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                    <Bar dataKey="deals" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <Award className="text-amber-500 w-4 h-4" /> Force Rankings
                    </h3>
                    <div className="space-y-2 flex-1 w-full overflow-y-auto pr-2 max-h-[800px]">
                        {stats.topSales.map((sp) => {
                            const maxRev = stats.topPerformer ? stats.topPerformer.revenue : 1;
                            const isSelected = selectedRep === sp.name;
                            return (
                                <div 
                                    key={sp.name}
                                    onClick={() => setSelectedRep(isSelected ? null : sp.name)}
                                    className={`group cursor-pointer p-3 rounded-xl transition-all border ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{sp.name}</span>
                                            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-sm">{sp.deals} deals</span>
                                        </div>
                                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">{formatMoney(sp.revenue)}</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(sp.revenue / maxRev) * 100}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center bg-white dark:bg-zinc-900 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-emerald-500 w-5 h-5" />
                        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Enterprise Audit Register</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-2 transition-colors">
                            {isUploading ? <span className="animate-pulse">Uploading...</span> : <><UploadCloud className="w-3 h-3" /> Upload CSV</>}
                            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                        </label>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-zinc-400">Records: <span className="text-zinc-900 dark:text-zinc-100">{stats.dealCount}</span></span>
                    </div>
                </div>
                <div className="overflow-x-auto w-full max-h-[400px]">
                    <table className="w-full text-left table-fixed">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] uppercase text-zinc-400 font-black sticky top-0 z-20">
                            <tr>
                                <th className="px-4 py-3 w-1/3">Client Profile</th>
                                <th className="px-4 py-3 w-1/4">Executive</th>
                                <th className="px-4 py-3 w-1/6 text-center">kW</th>
                                <th className="px-4 py-3 w-1/4 text-right">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-xs">
                            {stats.filteredData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-4 py-2 border-b border-zinc-50 dark:border-zinc-800/50">
                                        <div className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{item.customer}</div>
                                        <div className="text-[10px] text-zinc-400">{item.mobile} • {new Date(item.date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-4 py-2 border-b border-zinc-50 dark:border-zinc-800/50 font-semibold text-zinc-600 dark:text-zinc-400 truncate">{toTitleCase(item.salesperson)}</td>
                                    <td className="px-4 py-2 border-b border-zinc-50 dark:border-zinc-800/50 text-center font-black text-blue-600 dark:text-blue-400">{item.capacity}</td>
                                    <td className="px-4 py-2 border-b border-zinc-50 dark:border-zinc-800/50 text-right font-black text-zinc-900 dark:text-zinc-100">{formatMoney(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
