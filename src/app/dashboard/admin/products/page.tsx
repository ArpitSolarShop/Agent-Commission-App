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
    Info
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
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Products</h1>
                            <p className="text-sm text-slate-500 font-medium">Configure solar system types and pricing</p>
                        </div>
                    </div>
                    
                    <Button onClick={() => handleOpenDialog()} className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl gap-2 shadow-lg shadow-slate-200">
                        <Plus className="w-4 h-4" />
                        New Product
                    </Button>
                </div>

                {/* Main Table Card */}
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <p className="text-sm font-bold uppercase tracking-widest">Refreshing Inventory...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 bg-white">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
                                    <BoxIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-1">
                                    Get started by adding your first solar system product.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-900 h-12">Product Name</TableHead>
                                            <TableHead className="font-bold text-slate-900">Type</TableHead>
                                            <TableHead className="font-bold text-slate-900">Brand</TableHead>
                                            <TableHead className="font-bold text-slate-900">Specs</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-right">Price (Base)</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                            <Zap className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-slate-900">{product.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase">
                                                        {product.systemType?.name || "N/A"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-500 uppercase text-xs">
                                                    {product.brand || "---"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-slate-900">{product.capacityKw}KW</span>
                                                        <span className="text-[10px] text-slate-400 font-bold">•</span>
                                                        <span className="text-xs font-bold text-slate-500">{product.phase}PH</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right py-4">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-black text-slate-900">{formatCurrency(product.basePrice)}</span>
                                                        <span className="text-[10px] text-emerald-500 font-bold">+{product.gstRate}% GST</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-4 py-4">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                            onClick={() => handleOpenDialog(product)}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
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
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Product Editor Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 bg-slate-900 text-white">
                        <DialogTitle className="text-xl font-black">{editingProduct ? "Edit Product" : "New System Product"}</DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs">
                            Define technical specifications and base pricing for this solar package.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-6 space-y-4 bg-white">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Display Name</Label>
                            <Input 
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. 5KW Hybrid Waaree System"
                                className="h-11 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">System Type</Label>
                                <Select 
                                    value={formData.systemTypeId} 
                                    onValueChange={(val) => setFormData({ ...formData, systemTypeId: val })}
                                >
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        {systemTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id} className="rounded-lg">
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Brand</Label>
                                <Input 
                                    id="brand"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    placeholder="Waaree / Adani"
                                    className="h-11 rounded-xl border-slate-200 uppercase"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Capacity (KW)</Label>
                                <Input 
                                    type="number"
                                    value={formData.capacityKw}
                                    onChange={(e) => setFormData({ ...formData, capacityKw: parseFloat(e.target.value) || 0 })}
                                    className="h-11 rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phase</Label>
                                <Select 
                                    value={formData.phase.toString()} 
                                    onValueChange={(val) => setFormData({ ...formData, phase: parseInt(val) })}
                                >
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        <SelectItem value="1" className="rounded-lg">1 Phase</SelectItem>
                                        <SelectItem value="3" className="rounded-lg">3 Phase</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">GST (%)</Label>
                                <Input 
                                    type="number"
                                    value={formData.gstRate}
                                    onChange={(e) => setFormData({ ...formData, gstRate: parseFloat(e.target.value) || 0 })}
                                    className="h-11 rounded-xl border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-between">
                                Base Price (Excl. GST)
                                <IndianRupee className="w-3 h-3 text-slate-300" />
                            </Label>
                            <Input 
                                type="number"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                                className="h-12 text-lg font-black rounded-xl border-slate-300 focus:border-slate-900 transition-colors"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 flex gap-2">
                        <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl font-bold text-slate-400">
                            Discard
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-slate-200 min-w-[120px]"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                editingProduct ? "Update Product" : "Create Product"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
