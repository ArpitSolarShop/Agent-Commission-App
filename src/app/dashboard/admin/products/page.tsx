"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    ArrowLeft,
    Loader2,
    Zap,
    Box as BoxIcon,
    ChevronDown,
    IndianRupee,
    Info,
    ChevronRight,
    Search,
    Layers
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
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Product = {
    id: string;
    systemTypeId: string | null;
    name: string;
    brand: string | null;
    capacityKw: number | null;
    phase: number;
    basePrice: number;
    gstRate: number;
    isActive: boolean;
    createdAt: string;
    systemType?: { name: string };
};

const systemTypes = [
    { id: "on-grid", name: "On-grid" },
    { id: "off-grid", name: "Off-grid" },
    { id: "hybrid", name: "Hybrid" },
    { id: "vfd-drive", name: "VFD/Drive" },
];

export default function ProductsAdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        systemTypeId: "",
        name: "",
        brand: "",
        capacityKw: 3,
        phase: 1,
        basePrice: 180000,
        gstRate: 8.9,
    });

    // Fetch products
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/products?active=all");
            const data = await res.json();
            if (data.success) {
                setProducts(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle dialog open
    const handleOpenDialog = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                systemTypeId: product.systemTypeId || "",
                name: product.name,
                brand: product.brand || "",
                capacityKw: product.capacityKw || 3,
                phase: product.phase,
                basePrice: product.basePrice,
                gstRate: product.gstRate,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                systemTypeId: "",
                name: "",
                brand: "",
                capacityKw: 3,
                phase: 1,
                basePrice: 180000,
                gstRate: 8.9,
            });
        }
        setDialogOpen(true);
    };

    // Handle save
    const handleSave = async () => {
        if (!formData.name || !formData.systemTypeId) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setIsSaving(true);
            const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
            const method = editingProduct ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(`Product ${editingProduct ? "updated" : "created"} successfully!`);
                setDialogOpen(false);
                fetchProducts();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save product");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Product deleted successfully!");
                fetchProducts();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete product");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", { 
            style: "currency", 
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto pb-10">
            {/* ── App-style Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/admin">
                        <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </Link>
                    <div>
                        <p className="text-[10px] md:hidden font-black text-zinc-400 uppercase tracking-widest">Inventory</p>
                        <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                           <span className="md:hidden">{products.length} Products</span>
                           <span className="hidden md:inline">Product Management</span>
                        </h1>
                        <p className="text-sm text-zinc-500 hidden md:block">Configure solar system types and pricing</p>
                    </div>
                </div>
                
                <Button onClick={() => handleOpenDialog()} className="hidden md:flex bg-zinc-900 dark:bg-primary hover:bg-zinc-800 dark:hover:bg-primary/90 text-white font-black rounded-2xl h-11 px-6 gap-2 shadow-lg shadow-zinc-200 dark:shadow-none">
                    <Plus className="w-4 h-4" />
                    NEW PRODUCT
                </Button>
            </div>

            {/* ── Main List / Table ── */}
            <Card className="border-none md:border md:shadow-sm bg-transparent md:bg-white dark:md:bg-zinc-900 overflow-hidden">
                <CardContent className="p-0 md:p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Refreshing Inventory...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 mb-4">
                                <BoxIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">No products found</h3>
                            <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">
                                Get started by adding your first solar system product.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop View */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800">
                                        <TableRow>
                                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 h-12">Product Name</TableHead>
                                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Type</TableHead>
                                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Brand</TableHead>
                                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Specs</TableHead>
                                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 text-right">Price (Base)</TableHead>
                                            <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                            <Zap className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{product.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-none font-bold text-[10px] uppercase">
                                                        {product.systemType?.name || "N/A"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium text-zinc-500 uppercase text-xs">
                                                    {product.brand || "---"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">{product.capacityKw}KW</span>
                                                        <span className="text-[10px] text-zinc-400 font-bold">•</span>
                                                        <span className="text-xs font-bold text-zinc-500">{product.phase}PH</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right py-4">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-black text-zinc-900 dark:text-zinc-100">{formatCurrency(product.basePrice)}</span>
                                                        <span className="text-[10px] text-emerald-500 font-bold">+{product.gstRate}% GST</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-4 py-4">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-zinc-400 hover:text-primary"
                                                            onClick={() => handleOpenDialog(product)}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-zinc-400 hover:text-red-600"
                                                            onClick={() => handleDelete(product.id)}
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

                            {/* Mobile View (App-style) */}
                            <div className="md:hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {products.map((product) => (
                                    <div key={product.id} className="p-5 active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors" onClick={() => handleOpenDialog(product)}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                    <Layers className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-black text-zinc-900 dark:text-zinc-50 text-sm leading-tight tracking-tight truncate max-w-[160px]">{product.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-[8px] h-4 px-1 font-black uppercase border-zinc-200 dark:border-zinc-700">
                                                            {product.systemType?.name || "N/A"}
                                                        </Badge>
                                                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{product.brand}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-sm text-zinc-900 dark:text-zinc-100 leading-none">₹{product.basePrice.toLocaleString("en-IN")}</p>
                                                <p className="text-[8px] text-emerald-500 font-black uppercase mt-1">+{product.gstRate}% GST</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-zinc-400 tracking-widest uppercase">CAPACITY</span>
                                                    <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-300">{product.capacityKw} KW</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-zinc-400 tracking-widest uppercase">PHASE</span>
                                                    <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-300">{product.phase} PH</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 active:scale-90 transition-all"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-500/50" />
                                                </button>
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

            {/* Product Editor Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-zinc-900">
                    <DialogHeader className="p-6 bg-zinc-900 dark:bg-black text-white">
                        <DialogTitle className="text-xl font-black uppercase italic tracking-tight">{editingProduct ? "Edit Product" : "New System"}</DialogTitle>
                        <DialogDescription className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                            Technical specifications & pricing
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Display Name</Label>
                            <Input 
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. 5KW Hybrid System"
                                className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">System Type</Label>
                                <Select 
                                    value={formData.systemTypeId} 
                                    onValueChange={(val) => setFormData({ ...formData, systemTypeId: val })}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-xl">
                                        {systemTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id} className="rounded-xl">
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="brand" className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Brand</Label>
                                <Input 
                                    id="brand"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    placeholder="Waaree"
                                    className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold uppercase"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Cap (KW)</Label>
                                <Input 
                                    type="number"
                                    value={formData.capacityKw}
                                    onChange={(e) => setFormData({ ...formData, capacityKw: parseFloat(e.target.value) || 0 })}
                                    className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Phase</Label>
                                <Select 
                                    value={formData.phase.toString()} 
                                    onValueChange={(val) => setFormData({ ...formData, phase: parseInt(val) })}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-xl">
                                        <SelectItem value="1" className="rounded-xl">1 PH</SelectItem>
                                        <SelectItem value="3" className="rounded-xl">3 PH</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">GST (%)</Label>
                                <Input 
                                    type="number"
                                    value={formData.gstRate}
                                    onChange={(e) => setFormData({ ...formData, gstRate: parseFloat(e.target.value) || 0 })}
                                    className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center justify-between">
                                Base Price (Excl. GST)
                                <IndianRupee className="w-3 h-3 text-zinc-300" />
                            </Label>
                            <Input 
                                type="number"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                                className="h-14 text-xl font-black rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:border-primary transition-colors italic"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-zinc-50 dark:bg-zinc-800/50 flex gap-2">
                        <Button variant="ghost" onClick={() => setDialogOpen(false)} className="flex-1 rounded-2xl font-black text-zinc-400 uppercase tracking-widest text-[10px]">
                            Discard
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="flex-[2] bg-zinc-900 dark:bg-primary hover:bg-zinc-800 dark:hover:bg-primary/90 text-white font-black rounded-2xl h-12 shadow-lg shadow-zinc-200 dark:shadow-none active:scale-[0.98] transition-all uppercase tracking-widest text-[10px]"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                editingProduct ? "Update System" : "Create System"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* FAB for Mobile */}
            <button 
                onClick={() => handleOpenDialog()}
                className="md:hidden fixed bottom-20 right-5 z-40 h-14 w-14 rounded-full bg-zinc-900 dark:bg-primary text-white shadow-xl shadow-primary/20 flex items-center justify-center active:scale-90 transition-all"
            >
                <Plus className="h-6 w-6" />
            </button>
        </div>
    );
}
