"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    ArrowLeft,
    Loader2,
    MoveUp,
    MoveDown,
    Settings2,
    Info,
    CheckCircle2,
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { defaultComponents } from "@/lib/companyDetails";

type Component = {
    id?: string;
    systemTypeId?: string | null;
    name: string;
    description: string;
    defaultQuantity: string;
    defaultMake: string;
    sortOrder: number;
    isDefault: boolean;
};

const systemTypes = [
    { id: "On-grid", name: "On-grid" },
    { id: "Off-grid", name: "Off-grid" },
    { id: "Hybrid", name: "Hybrid" },
    { id: "VFD/Drive", name: "VFD/Drive" },
];

export default function ComponentsAdminPage() {
    const [selectedSystemType, setSelectedSystemType] = useState("On-grid");
    const [components, setComponents] = useState<Component[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState<Component | null>(null);
    const [editingIndex, setEditingIndex] = useState<number>(-1);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        defaultQuantity: "1 Nos",
        defaultMake: "Standard",
        isDefault: true,
    });

    // Load components for selected system type
    useEffect(() => {
        setLoading(true);
        const defaults = defaultComponents[selectedSystemType as keyof typeof defaultComponents];
        if (defaults) {
            setComponents(
                defaults.map((c: any, i: number) => ({
                    name: c.name,
                    description: c.description,
                    defaultQuantity: c.quantity,
                    defaultMake: c.make,
                    sortOrder: i,
                    isDefault: true,
                }))
            );
        } else {
            setComponents([]);
        }
        setLoading(false);
    }, [selectedSystemType]);

    // Handle dialog open
    const handleOpenDialog = (component?: Component, index?: number) => {
        if (component && typeof index === "number") {
            setEditingComponent(component);
            setEditingIndex(index);
            setFormData({
                name: component.name,
                description: component.description,
                defaultQuantity: component.defaultQuantity,
                defaultMake: component.defaultMake,
                isDefault: component.isDefault,
            });
        } else {
            setEditingComponent(null);
            setEditingIndex(-1);
            setFormData({
                name: "",
                description: "",
                defaultQuantity: "1 Nos",
                defaultMake: "Standard",
                isDefault: true,
            });
        }
        setDialogOpen(true);
    };

    // Handle save
    const handleSave = () => {
        if (!formData.name) {
            toast.error("Component name is required");
            return;
        }

        if (editingIndex >= 0) {
            const updated = [...components];
            updated[editingIndex] = {
                ...components[editingIndex],
                ...formData,
            };
            setComponents(updated);
            toast.success("Component updated!");
        } else {
            setComponents([
                ...components,
                {
                    ...formData,
                    sortOrder: components.length,
                },
            ]);
            toast.success("Component added!");
        }
        setDialogOpen(false);
    };

    // Handle delete
    const handleDelete = (index: number) => {
        if (!confirm("Are you sure you want to delete this component?")) return;
        const updated = components.filter((_, i) => i !== index);
        setComponents(updated);
        toast.success("Component deleted!");
    };

    // Move component up/down
    const handleMove = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === components.length - 1) return;

        const updated = [...components];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
        setComponents(updated);
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
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bill of Materials</h1>
                            <p className="text-sm text-slate-500 font-medium">Configure default components for quotations</p>
                        </div>
                    </div>
                    
                    <Button onClick={() => handleOpenDialog()} className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl gap-2 shadow-lg shadow-slate-200">
                        <Plus className="w-4 h-4" />
                        Add Component
                    </Button>
                </div>

                {/* System Type Selection */}
                <div className="flex flex-wrap gap-2">
                    {systemTypes.map((type) => (
                        <Button
                            key={type.id}
                            variant={selectedSystemType === type.id ? "default" : "outline"}
                            onClick={() => setSelectedSystemType(type.id)}
                            className={`rounded-xl font-bold h-10 px-6 transition-all ${
                                selectedSystemType === type.id 
                                ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            {type.name}
                        </Button>
                    ))}
                </div>

                {/* Main Table Card */}
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-50 px-6 py-4">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            {selectedSystemType} Components
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <p className="text-sm font-bold uppercase tracking-widest">Loading BOM...</p>
                            </div>
                        ) : components.length === 0 ? (
                            <div className="text-center py-20 bg-white">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
                                    <Settings2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No components defined</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-1">
                                    Define the standard items that make up an {selectedSystemType} system.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-900 w-16 text-center">#</TableHead>
                                            <TableHead className="font-bold text-slate-900">Component Details</TableHead>
                                            <TableHead className="font-bold text-slate-900">Default Qty</TableHead>
                                            <TableHead className="font-bold text-slate-900">Standard Make</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-right pr-6">Management</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {components.map((component, index) => (
                                            <TableRow key={index} className="hover:bg-slate-50/50 transition-colors group">
                                                <TableCell className="text-center font-black text-slate-300 py-4">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 flex items-center gap-2">
                                                            {component.name}
                                                            {component.isDefault && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium leading-tight max-w-md italic">
                                                            {component.description}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-slate-700 text-sm">
                                                    {component.defaultQuantity}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase text-slate-400 border-slate-200">
                                                        {component.defaultMake}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-4 py-4">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="flex mr-2 border-r border-slate-100 pr-2">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7 text-slate-300 hover:text-slate-900"
                                                                disabled={index === 0}
                                                                onClick={() => handleMove(index, "up")}
                                                            >
                                                                <MoveUp className="w-3 h-3" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7 text-slate-300 hover:text-slate-900"
                                                                disabled={index === components.length - 1}
                                                                onClick={() => handleMove(index, "down")}
                                                            >
                                                                <MoveDown className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                            onClick={() => handleOpenDialog(component, index)}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDelete(index)}
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

                <div className="flex items-center justify-center gap-2 text-slate-400 bg-white/50 p-4 rounded-2xl border border-dashed border-slate-200">
                    <Info className="w-4 h-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-none">
                        Note: Edits here update the global template. Individual quotes can still be customized.
                    </p>
                </div>
            </div>

            {/* Component Editor Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 bg-slate-900 text-white">
                        <DialogTitle className="text-xl font-black">{editingComponent ? "Edit Component" : "Add BOM Item"}</DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs">
                            Define the specifications for this bill of materials component.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-6 space-y-4 bg-white">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Component Name</Label>
                            <Input 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Solar Photovoltaic Modules"
                                className="h-11 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description / Specs</Label>
                            <Input 
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. 580Wp Mono Perc Half Cut Modules"
                                className="h-11 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Default Quantity</Label>
                                <Input 
                                    value={formData.defaultQuantity}
                                    onChange={(e) => setFormData({ ...formData, defaultQuantity: e.target.value })}
                                    placeholder="e.g. 10 Nos"
                                    className="h-11 rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Default Make</Label>
                                <Input 
                                    value={formData.defaultMake}
                                    onChange={(e) => setFormData({ ...formData, defaultMake: e.target.value })}
                                    placeholder="e.g. Standard"
                                    className="h-11 rounded-xl border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-slate-900">Include by default</Label>
                                <p className="text-[10px] text-slate-500 font-medium italic">Auto-add to new quotations</p>
                            </div>
                            <Switch 
                                checked={formData.isDefault}
                                onCheckedChange={(val) => setFormData({ ...formData, isDefault: val })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 flex gap-2">
                        <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl font-bold text-slate-400">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-slate-200 min-w-[120px]"
                        >
                            {editingComponent ? "Save Changes" : "Add to BOM"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
