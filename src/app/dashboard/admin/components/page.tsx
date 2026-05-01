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
    Layers,
    ChevronRight,
    Search
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
        <div className="space-y-4 md:space-y-8 max-w-7xl mx-auto pb-10">
            {/* ── App-style Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/admin">
                        <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </Link>
                    <div>
                        <p className="text-[10px] md:hidden font-black text-zinc-400 uppercase tracking-widest">Specifications</p>
                        <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 italic">
                            Bill of Materials
                        </h1>
                        <p className="text-sm text-zinc-500 hidden md:block italic font-medium">Configure default components for quotations</p>
                    </div>
                </div>
                
                <Button onClick={() => handleOpenDialog()} className="hidden md:flex bg-zinc-900 dark:bg-primary hover:bg-zinc-800 dark:hover:bg-primary/90 text-white font-black rounded-2xl h-11 px-6 gap-2 shadow-lg shadow-zinc-200 dark:shadow-none">
                    <Plus className="w-4 h-4" />
                    ADD COMPONENT
                </Button>
            </div>

            {/* ── System Type Selector ── */}
            <div className="flex flex-wrap gap-2 px-1">
                {systemTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedSystemType(type.id)}
                        className={`px-5 h-10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                            selectedSystemType === type.id 
                            ? "bg-zinc-900 dark:bg-primary text-white shadow-lg shadow-zinc-200 dark:shadow-none italic" 
                            : "bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300"
                        }`}
                    >
                        {type.name}
                    </button>
                ))}
            </div>

            {/* ── Components Catalog ── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2 uppercase tracking-widest italic">
                        <Layers className="w-4 h-4 text-primary" />
                        {selectedSystemType} Template
                    </h2>
                    <Badge variant="outline" className="text-[10px] font-black uppercase border-zinc-200 dark:border-zinc-800">
                        {components.length} Items
                    </Badge>
                </div>

                <Card className="border-none md:border md:shadow-sm bg-transparent md:bg-white dark:md:bg-zinc-900 overflow-hidden">
                    <CardContent className="p-0 md:p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Loading BOM...</p>
                            </div>
                        ) : components.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 mb-4">
                                    <Settings2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">No components defined</h3>
                                <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">
                                    Define the standard items that make up an {selectedSystemType} system.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-zinc-50/50 dark:bg-zinc-800/30">
                                            <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 w-16 text-center">#</TableHead>
                                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Component Details</TableHead>
                                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Default Qty</TableHead>
                                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Standard Make</TableHead>
                                                <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 text-right pr-6">Management</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {components.map((component, index) => (
                                                <TableRow key={index} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group border-zinc-50 dark:border-zinc-800">
                                                    <TableCell className="text-center font-black text-zinc-300 dark:text-zinc-700 py-4">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                                {component.name}
                                                                {component.isDefault && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                                            </span>
                                                            <span className="text-[10px] text-zinc-500 font-medium leading-tight max-w-md italic">
                                                                {component.description}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-black text-zinc-700 dark:text-zinc-300 text-sm italic">
                                                        {component.defaultQuantity}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800">
                                                            {component.defaultMake}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-4 py-4">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="flex mr-2 border-r border-zinc-100 dark:border-zinc-800 pr-2">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-7 w-7 text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                                                                    disabled={index === 0}
                                                                    onClick={() => handleMove(index, "up")}
                                                                >
                                                                    <MoveUp className="w-3 h-3" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-7 w-7 text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                                                                    disabled={index === components.length - 1}
                                                                    onClick={() => handleMove(index, "down")}
                                                                >
                                                                    <MoveDown className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-zinc-400 hover:text-primary"
                                                                onClick={() => handleOpenDialog(component, index)}
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-zinc-400 hover:text-red-600"
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

                                {/* Mobile View (App-style) */}
                                <div className="md:hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {components.map((component, index) => (
                                        <div key={index} className="p-5 active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors" onClick={() => handleOpenDialog(component, index)}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-400 italic">
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-black text-zinc-900 dark:text-zinc-50 text-sm leading-tight tracking-tight uppercase flex items-center gap-2">
                                                            {component.name}
                                                            {component.isDefault && <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                                                        </h3>
                                                        <p className="text-[10px] text-zinc-500 font-medium italic line-clamp-1 mt-1">{component.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-[10px] text-zinc-900 dark:text-zinc-100 leading-none italic uppercase">{component.defaultQuantity}</p>
                                                    <Badge variant="outline" className="text-[8px] h-4 px-1 font-black uppercase border-zinc-200 dark:border-zinc-700 mt-1">
                                                        {component.defaultMake}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800/50">
                                                <div className="flex items-center gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-zinc-300"
                                                        disabled={index === 0}
                                                        onClick={(e) => { e.stopPropagation(); handleMove(index, "up"); }}
                                                    >
                                                        <MoveUp className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-zinc-300"
                                                        disabled={index === components.length - 1}
                                                        onClick={(e) => { e.stopPropagation(); handleMove(index, "down"); }}
                                                    >
                                                        <MoveDown className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 active:scale-90 transition-all"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
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
            </div>

            {/* Component Editor Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-zinc-900">
                    <DialogHeader className="p-6 bg-zinc-900 dark:bg-black text-white">
                        <DialogTitle className="text-xl font-black uppercase italic tracking-tight">{editingComponent ? "Edit Item" : "Add BOM Item"}</DialogTitle>
                        <DialogDescription className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                            Bill of Materials configuration
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Component Name</Label>
                            <Input 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Solar Photovoltaic Modules"
                                className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Description / Specs</Label>
                            <Input 
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. 580Wp Mono Perc Half Cut"
                                className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold italic"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Default Qty</Label>
                                <Input 
                                    value={formData.defaultQuantity}
                                    onChange={(e) => setFormData({ ...formData, defaultQuantity: e.target.value })}
                                    placeholder="e.g. 10 Nos"
                                    className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Default Make</Label>
                                <Input 
                                    value={formData.defaultMake}
                                    onChange={(e) => setFormData({ ...formData, defaultMake: e.target.value })}
                                    placeholder="e.g. Standard"
                                    className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase italic">Include by default</Label>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">Auto-add to new quotations</p>
                            </div>
                            <Switch 
                                checked={formData.isDefault}
                                onCheckedChange={(val) => setFormData({ ...formData, isDefault: val })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-zinc-50 dark:bg-zinc-800/50 flex gap-2">
                        <Button variant="ghost" onClick={() => setDialogOpen(false)} className="flex-1 rounded-2xl font-black text-zinc-400 uppercase tracking-widest text-[10px]">
                            Discard
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            className="flex-[2] bg-zinc-900 dark:bg-primary hover:bg-zinc-800 dark:hover:bg-primary/90 text-white font-black rounded-2xl h-12 shadow-lg shadow-zinc-200 dark:shadow-none active:scale-[0.98] transition-all uppercase tracking-widest text-[10px]"
                        >
                            {editingComponent ? "Save Item" : "Add to BOM"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* FAB for Mobile */}
            <button 
                onClick={() => handleOpenDialog()}
                className="md:hidden fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-zinc-900 dark:bg-primary text-white shadow-xl shadow-primary/20 flex items-center justify-center active:scale-90 transition-all no-print"
            >
                <Plus className="h-6 w-6" />
            </button>
        </div>
    );
}
