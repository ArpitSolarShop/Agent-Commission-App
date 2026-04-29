"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Printer, 
  Save, 
  RotateCcw, 
  Sun, 
  BatteryCharging, 
  Cpu, 
  Waves, 
  ShieldCheck, 
  ChevronDown, 
  User, 
  Settings, 
  IndianRupee, 
  List, 
  MessageCircle, 
  Mail, 
  PlusCircle,
  Package
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import Link from "next/link";
import {
  companyDetails,
  defaultTerms,
  defaultComponents,
  gstConfig,
  defaultSubsidy,
  getSubsidyForCapacity,
  calculateSavings,
  generateQuoteNumber,
} from "@/lib/companyDetails";
import type { QuotationComponent } from "@/types/quotation";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

// System type configuration
const systemTypes = [
  { id: "On-grid", name: "On-grid", icon: <Sun className="w-4 h-4" />, color: "bg-green-500" },
  { id: "Off-grid", name: "Off-grid", icon: <BatteryCharging className="w-4 h-4" />, color: "bg-orange-500" },
  { id: "Hybrid", name: "Hybrid", icon: <Cpu className="w-4 h-4" />, color: "bg-blue-500" },
  { id: "VFD/Drive", name: "VFD/Drive", icon: <Waves className="w-4 h-4" />, color: "bg-purple-500" },
];

// Panel types
const panelTypes = [
  { value: "Monoperc", label: "Monoperc" },
  { value: "Bifacial", label: "Bifacial" },
  { value: "Topcon", label: "Topcon" },
  { value: "Topcon Bifacial", label: "Topcon Bifacial" },
  { value: "HJT", label: "HJT" },
  { value: "DCR", label: "DCR" },
  { value: "NDCR", label: "NDCR" },
];

// Solar panel brands
const panelBrands = ["Adani", "Tata", "Waaree", "Reliance", "Premier", "Emvee", "Vikram Solar", "Goldi Solar", "RenewSys", "Jakson", "Longi", "Jinko", "Canadian Solar", "Other"];

// Inverter brands
const inverterBrands = ["Polycab", "Shakti", "Growatt", "Sungrow", "Huawei", "Deye", "Servotech", "Luminous", "GoodWe", "Solis", "Solax", "Sofar Solar", "Other"];

export default function QuotationBuilder() {
  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // System Configuration
  const [selectedSystemType, setSelectedSystemType] = useState("On-grid");
  const [capacityKw, setCapacityKw] = useState<number>(3);
  const [phase, setPhase] = useState<number>(1);

  // Panel Configuration
  const [panelWattage, setPanelWattage] = useState<number>(620);
  const [panelBrand, setPanelBrand] = useState("Adani");
  const [customPanelBrand, setCustomPanelBrand] = useState("");
  const [panelType, setPanelType] = useState("Monoperc");
  const [panelWarranty, setPanelWarranty] = useState("25 Years"); // New Warranty State
  const effectivePanelBrand = panelBrand === "Other" ? customPanelBrand : panelBrand;

  // Inverter Configuration
  const [inverterBrand, setInverterBrand] = useState("Polycab");
  const [customInverterBrand, setCustomInverterBrand] = useState("");
  const [inverterModel, setInverterModel] = useState("3 KW On-Grid String");
  const [inverterWarranty, setInverterWarranty] = useState("5 Years"); // New Warranty State
  const [batteryWarranty, setBatteryWarranty] = useState("5 Years"); // Battery Warranty State
  const [customBatteryWarranty, setCustomBatteryWarranty] = useState(""); // Custom Battery Warranty
  const effectiveBatteryWarranty = batteryWarranty === "Other" ? customBatteryWarranty : batteryWarranty;
  const [inverterModelEdited, setInverterModelEdited] = useState(false); // Track if user manually edited inverter model
  const effectiveInverterBrand = inverterBrand === "Other" ? customInverterBrand : inverterBrand;

  // Pricing
  const [priceInput, setPriceInput] = useState<number>(180000); // Now represents Price Included GST
  const [gstRate, setGstRate] = useState<number>(gstConfig.compositeRate);
  const [centralSubsidy, setCentralSubsidy] = useState<number>(defaultSubsidy.central);
  const [stateSubsidy, setStateSubsidy] = useState<number>(defaultSubsidy.state);

  // Extra Costs (Optional)
  const [extraStructureEnabled, setExtraStructureEnabled] = useState(false);
  const [extraStructureRate, setExtraStructureRate] = useState<number>(5); // Rate per watt

  const [extraPanelsEnabled, setExtraPanelsEnabled] = useState(false);
  const [extraPanelCount, setExtraPanelCount] = useState<number>(1);
  const [extraPanelPrice, setExtraPanelPrice] = useState<number>(15000); // Per panel price

  const [extraWireEnabled, setExtraWireEnabled] = useState(false);
  const [extraWireLength, setExtraWireLength] = useState<number>(10); // in meters
  const [extraWireRate, setExtraWireRate] = useState<number>(50); // Per meter rate

  // Components (Bill of Materials)
  const [components, setComponents] = useState<QuotationComponent[]>([]);
  const [terms, setTerms] = useState<string[]>([]);

  // Integrated Products
  const [integratedProducts, setIntegratedProducts] = useState<any[]>([]);
  const [loadingIntegrated, setLoadingIntegrated] = useState(false);

  useEffect(() => {
    const fetchIntegrated = async () => {
      try {
        setLoadingIntegrated(true);
        const res = await fetch("/api/integrated-products");
        const json = await res.json();
        if (json.success) setIntegratedProducts(json.data || []);
      } catch (err) {
        console.error("Failed to fetch integrated products", err);
      } finally {
        setLoadingIntegrated(false);
      }
    };
    fetchIntegrated();
  }, []);

  // UI State
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);
  const [editComponentDialog, setEditComponentDialog] = useState(false);
  const [editingComponent, setEditingComponent] = useState<QuotationComponent | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [addComponentDialog, setAddComponentDialog] = useState(false);
  const [newComponent, setNewComponent] = useState<QuotationComponent>({ name: "", description: "", quantity: "1 Nos", make: "Standard", sort_order: 0 });

  const printRef = useRef<HTMLDivElement>(null);

  // Calculate number of panels needed
  const numberOfPanels = useMemo(() => Math.ceil((capacityKw * 1000) / (panelWattage || 1)), [capacityKw, panelWattage]);
  const actualSystemSize = useMemo(() => +((numberOfPanels * (panelWattage || 0)) / 1000).toFixed(2), [numberOfPanels, panelWattage]);

  // Load default components when system type changes
  useEffect(() => {
    const defaults = defaultComponents[selectedSystemType as keyof typeof defaultComponents];
    if (defaults) {
      const updatedDefaults = defaults.map((c, i) => {
        if (i === 0) return { ...c, description: `${panelWattage}Wp (${panelType}) Modules`, quantity: `${numberOfPanels.toString().padStart(2, '0')} Nos`, make: effectivePanelBrand, sort_order: i };
        if (i === 1) return { ...c, description: inverterModel, make: effectiveInverterBrand, sort_order: i };
        return { ...c, sort_order: i };
      });
      setComponents(updatedDefaults);
    }
    const defaultTermsList = defaultTerms[selectedSystemType as keyof typeof defaultTerms];
    if (defaultTermsList) setTerms(defaultTermsList.slice(0, 8));
  }, [selectedSystemType, panelWattage, effectivePanelBrand, panelType, numberOfPanels, effectiveInverterBrand, inverterModel]);

  // Update inverter model when capacity changes (only if not manually edited)
  useEffect(() => {
    if (!inverterModelEdited) {
      const inverterCapacity = Math.max(1, Math.floor(capacityKw));
      setInverterModel(`${inverterCapacity} KW ${selectedSystemType} String`);
    }
  }, [capacityKw, selectedSystemType, inverterModelEdited]);

  // Handle Subsidy Logic: No subsidy for NDCR/Off-grid, capacity-based for others
  useEffect(() => {
    if (panelType === "NDCR" || selectedSystemType === "Off-grid") {
      setCentralSubsidy(0);
      setStateSubsidy(0);
    } else {
      // Use capacity-based subsidy: ≤2 KW = ₹60,000 central, ≥3 KW = ₹78,000 central
      const subsidy = getSubsidyForCapacity(capacityKw);
      setCentralSubsidy(subsidy.central);
      setStateSubsidy(subsidy.state);
    }
  }, [panelType, selectedSystemType, capacityKw]);

  // Calculate extra costs
  const extraCosts = useMemo(() => {
    const structureCost = extraStructureEnabled ? (actualSystemSize * 1000 * extraStructureRate) : 0;
    const panelsCost = extraPanelsEnabled ? (extraPanelCount * extraPanelPrice) : 0;
    const wireCost = extraWireEnabled ? (extraWireLength * extraWireRate) : 0;
    return { structureCost, panelsCost, wireCost, total: structureCost + panelsCost + wireCost };
  }, [extraStructureEnabled, extraStructureRate, actualSystemSize, extraPanelsEnabled, extraPanelCount, extraPanelPrice, extraWireEnabled, extraWireLength, extraWireRate]);

  // Calculate GST and totals (Reverse calculation from Inclusive Price)
  const calculations = useMemo(() => {
    // Reverse calculate base price from the input (which is GST inclusive)
    // Formula: Inclusive = Base * (1 + Rate)  =>  Base = Inclusive / (1 + Rate)
    const derivedBasePrice = priceInput / (1 + gstRate / 100);

    // Add extra costs (assuming they act as taxable base additions) to the derived base
    const totalTaxableValue = derivedBasePrice + extraCosts.total;

    const gstAmount = +(totalTaxableValue * (gstRate / 100)).toFixed(2);
    const totalAmount = +(totalTaxableValue + gstAmount).toFixed(2);

    const savings = calculateSavings(actualSystemSize, totalAmount, centralSubsidy, stateSubsidy);
    const effectiveCost = Math.max(0, totalAmount - centralSubsidy - stateSubsidy);

    return {
      basePrice: totalTaxableValue, // This is the total taxable base used for calculation
      originalBasePrice: derivedBasePrice, // This is the base price of the system only
      extraCostsTotal: extraCosts.total,
      gstRate,
      gstAmount,
      totalAmount,
      ...savings,
      effectiveCost,
      systemPriceIncGst: priceInput // Keep track of the input
    };
  }, [priceInput, extraCosts.total, gstRate, actualSystemSize, centralSubsidy, stateSubsidy]);

  const quoteNumber = useMemo(() => {
    if (!customerName) return "";
    const initials = customerName.split(" ").map((n) => n.charAt(0).toUpperCase()).join("");
    return generateQuoteNumber(initials);
  }, [customerName]);

  const currentDate = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }), []);

  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: `Quotation_${customerName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}` });

  const handleEditComponent = (index: number) => { setEditingComponent({ ...components[index] }); setEditingIndex(index); setEditComponentDialog(true); };
  const handleSaveComponentEdit = () => { if (editingComponent && editingIndex >= 0) { const updated = [...components]; updated[editingIndex] = editingComponent; setComponents(updated); } setEditComponentDialog(false); setEditingComponent(null); setEditingIndex(-1); };
  const handleDeleteComponent = (index: number) => setComponents(components.filter((_, i) => i !== index));
  const handleAddComponent = () => { if (newComponent.name) { setComponents([...components, { ...newComponent, sort_order: components.length }]); setNewComponent({ name: "", description: "", quantity: "1 Nos", make: "Standard", sort_order: 0 }); setAddComponentDialog(false); } };

  const handleReset = () => { setCustomerName(""); setCustomerPhone(""); setCustomerAddress(""); setCapacityKw(3); setPhase(1); setPanelWattage(620); setPanelBrand("Adani"); setPriceInput(180000); setInverterModel("3 KW On-Grid String"); setInverterModelEdited(false); };

  const saveToDatabase = async () => {
    if (!customerName) return;
    try {
      await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          system_type_name: selectedSystemType,
          capacity_kw: actualSystemSize,
          phase,
          brand: effectivePanelBrand,
          base_price: calculations.basePrice,
          gst_rate: gstRate,
          central_subsidy: centralSubsidy,
          state_subsidy: stateSubsidy,
          terms,
          components,
          salesperson: companyDetails.authorizedSignatory
        })
      });
      console.log("Quotation auto-saved to database");
    } catch (error) {
      console.error("Auto-save failed", error);
    }
  };

  const handleApplyIntegrated = (id: string) => {
    const prod = integratedProducts.find(p => p.id === id);
    if (!prod) return;
    
    setCapacityKw(prod.systemKw);
    setPanelWattage(prod.moduleWatt);
    
    // Handle brand selection (select "Other" if not in list)
    if (panelBrands.includes(prod.brand)) {
      setPanelBrand(prod.brand);
      setCustomPanelBrand("");
    } else {
      setPanelBrand("Other");
      setCustomPanelBrand(prod.brand);
    }
    
    setPanelType(prod.moduleType || "Monoperc");
    setPriceInput(prod.price);
    setPhase(prod.phase === "Three" ? 3 : 1);
    
    // Force inverter model update based on the product's capacity
    setInverterModel(`${prod.inverterCapacityKw || prod.systemKw} KW ${selectedSystemType} String`);
    setInverterModelEdited(true); // Prevent auto-reverting
    
    toast.success(`Applied ${prod.brand} ${prod.systemKw}kW configuration`);
  };

  // Get quotation data for sharing
  const getQuotationData = () => ({
    customerName,
    systemSize: actualSystemSize,
    panelBrand: effectivePanelBrand,
    panelWattage,
    panelType,
    inverterModel,
    totalAmount: calculations.totalAmount,
    effectiveCost: calculations.effectiveCost,
    centralSubsidy,
    stateSubsidy
  });

  // WhatsApp handler - generates PDF, uploads to Supabase, sends via DoubleTick
  const handleSendWhatsApp = async () => {
    if (!customerName) { toast.error("Customer name is required"); return; }
    if (!customerPhone) { toast.error("Customer phone is required for WhatsApp"); return; }

    setLoading(true);
    const toastId = toast.loading("Generating PDF and sending to WhatsApp...");

    try {
      // Prepare quote data for PDF generation
      const quoteData = {
        customerInfo: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress || ""
        },
        selectedProduct: {
          systemType: selectedSystemType,
          capacity: actualSystemSize,
          phase: phase,
          panelBrand: effectivePanelBrand,
          panelWattage: panelWattage,
          panelType: panelType,
          panelWarranty: panelWarranty,
          inverterBrand: inverterModel,
          inverterWarranty: inverterWarranty,
          batteryWarranty: effectiveBatteryWarranty,
        },
        calculations: {
          basePrice: calculations.originalBasePrice,
          extraCosts: extraCosts.total,
          subtotal: calculations.basePrice,
          gstAmount: calculations.gstAmount,
          total: calculations.totalAmount,
          discount: 0,
          grandTotal: calculations.totalAmount,
          centralSubsidy,
          stateSubsidy,
          effectiveCost: calculations.effectiveCost
        },
        savings: calculations,
        taxRate: gstRate / 100,
        components,
        terms
      };

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteData)
      });

      const result = await response.json();

      if (response.ok) {
        saveToDatabase(); // Auto-save
        toast.success("Quotation PDF sent to WhatsApp successfully!", { id: toastId });
      } else {
        throw new Error(result.message || "Failed to send WhatsApp");
      }
    } catch (error: any) {
      console.error("WhatsApp error:", error);
      toast.error(error.message, { id: toastId });
    }
    finally { setLoading(false); }
  };

  // Email handler
  const [customerEmail, setCustomerEmail] = useState("");
  const handleSendEmail = async () => {
    const emailToUse = customerEmail || prompt("Enter customer email address:");
    if (!emailToUse) { toast.error("Email address is required"); return; }
    if (customerEmail !== emailToUse) setCustomerEmail(emailToUse);

    setLoading(true);
    const toastId = toast.loading("Sending email...");
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse, quotationData: getQuotationData() })
      });
      const result = await response.json();
      if (result.success) {
        if (result.useMailto) {
          window.open(result.mailtoLink, "_blank");
          toast.success("Email client opened with quotation details", { id: toastId });
        } else {
          toast.success("Email sent successfully!", { id: toastId });
        }
      } else throw new Error(result.message || "Failed to send email");
    } catch (error: any) { 
      toast.error(error.message, { id: toastId }); 
    }
    finally { setLoading(false); }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-wrapper { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            visibility: visible !important;
            background: white !important;
            overflow: visible !important;
          }
          .print-page { 
            visibility: visible !important;
            width: 210mm !important;
            max-width: 100% !important;
            padding: 15mm !important; 
            margin: 0 auto !important;
            border: none !important; 
            box-shadow: none !important;
            height: auto !important;
            min-height: 297mm !important;
          }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
          body, html { 
            visibility: hidden; 
            height: auto !important; 
            overflow: visible !important; 
          }
          .print-wrapper * { visibility: visible; }
        }
      `}</style>

      {/* LEFT EDIT PANEL */}
      <aside className="no-print w-full md:w-[380px] bg-white border-r border-slate-200 flex flex-col overflow-hidden h-full">
        {/* Header */}
        <header className="p-4 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-400" />
            <h1 className="font-bold text-lg tracking-tight">Quotation Builder</h1>
          </div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <ShieldCheck className="w-5 h-5" />
            </Button>
          </Link>
        </header>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
          <Accordion type="multiple" defaultValue={["integrated-catalog", "system-type", "customer-details"]} className="w-full">
            
            {/* Integrated Catalog */}
            <AccordionItem value="integrated-catalog" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-emerald-50 border-b border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                  <Package className="w-4 h-4 text-emerald-600" />
                  Quick Select (Catalog)
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-4 space-y-3">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-500">Choose from Integrated Solutions</Label>
                  <Select onValueChange={handleApplyIntegrated}>
                    <SelectTrigger className="h-9 border-emerald-200 focus:ring-emerald-500">
                      <SelectValue placeholder={loadingIntegrated ? "Loading catalog..." : "Select a solution"} />
                    </SelectTrigger>
                    <SelectContent>
                      {integratedProducts.length === 0 ? (
                        <div className="p-2 text-xs text-slate-500 text-center italic">No integrated products found.</div>
                      ) : (
                        integratedProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="font-bold text-slate-900">{p.brand} {p.systemKw}kW</span>
                              <span className="text-[10px] text-slate-500">{p.moduleType} • ₹{new Intl.NumberFormat('en-IN').format(p.price)}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* System Type */}
            <AccordionItem value="system-type" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <Sun className="w-4 h-4 text-slate-600" />
                  System Type
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-4">
                <div className="flex flex-wrap gap-2">
                  {systemTypes.map((type) => (
                    <Badge
                      key={type.id}
                      variant={selectedSystemType === type.id ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-1.5 flex items-center gap-2 transition-all ${
                        selectedSystemType === type.id 
                          ? type.color + " text-white border-transparent" 
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                      onClick={() => setSelectedSystemType(type.id)}
                    >
                      {type.icon}
                      {type.name}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Customer Details */}
            <AccordionItem value="customer-details" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <User className="w-4 h-4 text-slate-600" />
                  Customer Details
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cust-name">Customer Name</Label>
                  <Input 
                    id="cust-name"
                    placeholder="Enter customer name" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-phone">Mobile Number</Label>
                  <Input 
                    id="cust-phone"
                    placeholder="Enter phone number" 
                    value={customerPhone} 
                    onChange={(e) => setCustomerPhone(e.target.value)} 
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-address">Address</Label>
                  <Textarea 
                    id="cust-address"
                    placeholder="Enter full address" 
                    value={customerAddress} 
                    onChange={(e) => setCustomerAddress(e.target.value)} 
                    className="resize-none"
                    rows={2}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* System Configuration */}
            <AccordionItem value="system-config" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <Settings className="w-4 h-4 text-slate-600" />
                  System Configuration
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Capacity (KW)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={capacityKw} 
                      onChange={(e) => setCapacityKw(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Wattage (Wp)</Label>
                    <Input 
                      type="number" 
                      step="5"
                      value={panelWattage} 
                      onChange={(e) => setPanelWattage(e.target.value === "" ? 0 : parseInt(e.target.value))} 
                      className="h-9"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Panels</Label>
                    <Input value={numberOfPanels} readOnly className="h-9 bg-slate-50 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Actual (KW)</Label>
                    <Input value={actualSystemSize} readOnly className="h-9 bg-slate-50 font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Panel Brand</Label>
                    <Select value={panelBrand} onValueChange={setPanelBrand}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {panelBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Panel Type</Label>
                    <Select value={panelType} onValueChange={setPanelType}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {panelTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {panelBrand === "Other" && (
                  <div className="space-y-2">
                    <Label>Custom Brand</Label>
                    <Input 
                      value={customPanelBrand} 
                      onChange={(e) => setCustomPanelBrand(e.target.value)} 
                      className="h-9"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Inverter</Label>
                    <Select value={inverterBrand} onValueChange={setInverterBrand}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Inverter" />
                      </SelectTrigger>
                      <SelectContent>
                        {inverterBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phase</Label>
                    <Select value={phase.toString()} onValueChange={(v) => setPhase(parseInt(v))}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Phase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1Φ (Single)</SelectItem>
                        <SelectItem value="3">3Φ (Three)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {inverterBrand === "Other" && (
                  <div className="space-y-2">
                    <Label>Custom Inverter Brand</Label>
                    <Input 
                      value={customInverterBrand} 
                      onChange={(e) => setCustomInverterBrand(e.target.value)} 
                      className="h-9"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Inverter Model</Label>
                  <Input 
                    value={inverterModel} 
                    onChange={(e) => {
                      setInverterModel(e.target.value);
                      setInverterModelEdited(true);
                    }}
                    className="h-9"
                    placeholder="e.g., 5 KW On-Grid String"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Panel Warranty</Label>
                    <Select value={panelWarranty} onValueChange={setPanelWarranty}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["25 Years", "30 Years", "10 Years", "12 Years", "Other"].map(w => (
                          <SelectItem key={w} value={w}>{w}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Inverter Warranty</Label>
                    <Select value={inverterWarranty} onValueChange={setInverterWarranty}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["5 Years", "7 Years", "8 Years", "10 Years", "Other"].map(w => (
                          <SelectItem key={w} value={w}>{w}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(selectedSystemType === "Hybrid" || selectedSystemType === "Off-grid") && (
                  <div className="space-y-2">
                    <Label>Battery Warranty</Label>
                    <div className="flex gap-2">
                      <Select value={batteryWarranty} onValueChange={setBatteryWarranty}>
                        <SelectTrigger className="h-9 flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["1 Year", "2 Years", "3 Years", "5 Years", "8 Years", "10 Years", "Other"].map(w => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {batteryWarranty === "Other" && (
                        <Input 
                          placeholder="e.g. 15 Years" 
                          value={customBatteryWarranty} 
                          onChange={(e) => setCustomBatteryWarranty(e.target.value)}
                          className="h-9 flex-1"
                        />
                      )}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Pricing */}
            <AccordionItem value="pricing" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <IndianRupee className="w-4 h-4 text-slate-600" />
                  Pricing
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>System Price (Incl. GST)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      type="number" 
                      value={priceInput} 
                      onChange={(e) => setPriceInput(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                      className="pl-8 h-10 text-lg font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>GST Rate (%)</Label>
                    <Input 
                      type="number" 
                      value={gstRate} 
                      onChange={(e) => setGstRate(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Amount</Label>
                    <Input value={`₹ ${formatCurrency(calculations.gstAmount)}`} readOnly className="h-9 bg-slate-50 font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Central Subsidy</Label>
                    <Input 
                      type="number" 
                      value={centralSubsidy} 
                      onChange={(e) => setCentralSubsidy(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State Subsidy</Label>
                    <Input 
                      type="number" 
                      value={stateSubsidy} 
                      onChange={(e) => setStateSubsidy(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center space-y-1">
                  <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Effective Cost</p>
                  <h3 className="text-2xl font-black text-green-600">₹ {formatCurrency(calculations.effectiveCost)}</h3>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Extra Costs */}
            <AccordionItem value="extra-costs" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-amber-50 border-b border-amber-100">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                  <PlusCircle className="w-4 h-4 text-amber-600" />
                  Extra Costs
                  {extraCosts.total > 0 && <Badge className="ml-1 h-5 bg-amber-500 hover:bg-amber-600 border-none">₹{formatCurrency(extraCosts.total)}</Badge>}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-4 space-y-4">
                {/* Structure */}
                <div className={`p-3 rounded-lg border transition-colors ${extraStructureEnabled ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox id="extra-struct" checked={extraStructureEnabled} onCheckedChange={(v) => setExtraStructureEnabled(!!v)} />
                    <Label htmlFor="extra-struct" className="font-bold">Extra Structure Cost</Label>
                  </div>
                  {extraStructureEnabled && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input 
                        type="number" 
                        value={extraStructureRate} 
                        onChange={(e) => setExtraStructureRate(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                        className="w-20 h-8 text-sm"
                      />
                      <span className="text-xs text-slate-500">/W × {actualSystemSize * 1000}W =</span>
                      <span className="font-bold text-amber-700">₹{formatCurrency(extraCosts.structureCost)}</span>
                    </div>
                  )}
                </div>

                {/* Panels */}
                <div className={`p-3 rounded-lg border transition-colors ${extraPanelsEnabled ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox id="extra-panels" checked={extraPanelsEnabled} onCheckedChange={(v) => setExtraPanelsEnabled(!!v)} />
                    <Label htmlFor="extra-panels" className="font-bold">Extra Panels</Label>
                  </div>
                  {extraPanelsEnabled && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="space-y-1">
                        <Label className="text-[10px]">Qty</Label>
                        <Input type="number" value={extraPanelCount} onChange={(e) => setExtraPanelCount(e.target.value === "" ? 0 : parseInt(e.target.value))} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Price/Panel</Label>
                        <Input type="number" value={extraPanelPrice} onChange={(e) => setExtraPanelPrice(e.target.value === "" ? 0 : parseFloat(e.target.value))} className="h-8" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Wire */}
                <div className={`p-3 rounded-lg border transition-colors ${extraWireEnabled ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox id="extra-wire" checked={extraWireEnabled} onCheckedChange={(v) => setExtraWireEnabled(!!v)} />
                    <Label htmlFor="extra-wire" className="font-bold">Extra Wire</Label>
                  </div>
                  {extraWireEnabled && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="space-y-1">
                        <Label className="text-[10px]">Length (m)</Label>
                        <Input type="number" value={extraWireLength} onChange={(e) => setExtraWireLength(e.target.value === "" ? 0 : parseFloat(e.target.value))} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Rate/m</Label>
                        <Input type="number" value={extraWireRate} onChange={(e) => setExtraWireRate(e.target.value === "" ? 0 : parseFloat(e.target.value))} className="h-8" />
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Components */}
            <AccordionItem value="components-list" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <List className="w-4 h-4 text-slate-600" />
                  Components ({components.length})
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-2 space-y-1">
                {components.map((comp, index) => (
                  <div key={index} className={`flex items-center gap-2 p-2 rounded-md ${index % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{comp.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{comp.quantity}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditComponent(index)}>
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteComponent(index)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2 border-dashed" onClick={() => setAddComponentDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Component
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Action Buttons */}
        <footer className="p-4 border-t border-slate-200 bg-white space-y-2 shrink-0">
          <Button 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold h-10 shadow-sm"
            onClick={() => { saveToDatabase(); handlePrint(); }}
          >
            <Printer className="w-4 h-4 mr-2" /> Print Quotation
          </Button>
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-green-500 hover:bg-green-600 text-white h-10"
              onClick={handleSendWhatsApp}
              disabled={loading}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </Button>
            <Button 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white h-10"
              onClick={handleSendEmail}
              disabled={loading}
            >
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 text-slate-400 hover:text-red-500" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset Form</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </footer>
      </aside>

      {/* CENTER PREVIEW */}
      <main className="print-wrapper flex-1 w-full overflow-auto p-4 md:p-6 flex justify-center bg-slate-200">
        <div ref={printRef} className="print-page w-[210mm] min-h-[297mm] p-[15mm] bg-white shadow-2xl font-sans text-[11px] text-slate-800 box-border">
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-yellow-500 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <img 
                src={origin ? `${origin}/logo.png` : "/logo.png"} 
                alt="Logo" 
                className="max-h-20" 
                onError={(e: any) => { e.currentTarget.style.display = 'none'; }} 
              />
              <div>
                <h1 className="text-[26px] font-black text-[#1e3a5f] tracking-tighter leading-none">ARPIT SOLAR SHOP</h1>
                <p className="text-[10px] font-semibold text-slate-500 mt-1 tracking-wider uppercase">{companyDetails.tagline}</p>
                <div className="text-[10px] text-slate-500 mt-2">
                  <p className="text-blue-700 font-bold mb-1">GSTIN: {companyDetails.gstin}</p>
                  <p><strong>HO:</strong> {companyDetails.headOffice}</p>
                  <p><strong>Contact:</strong> {companyDetails.phone} | <strong>Email:</strong> {companyDetails.email}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-yellow-500 text-white px-4 py-1.5 text-base font-black rounded mb-2 uppercase tracking-widest">Quotation</div>
              <p className="text-sm text-slate-500 font-bold">Date: {currentDate}</p>
              {quoteNumber && <p className="text-[10px] text-slate-400">Quote No: {quoteNumber}</p>}
            </div>
          </div>

          {/* Customer & System Overview */}
          <div className="avoid-break grid grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-hidden">
              <p className="font-bold text-[#1e3a5f] mb-2 uppercase text-[10px] tracking-widest border-b border-slate-200 pb-1">Customer Details</p>
              <h2 className="font-black text-blue-900 text-lg break-words">{customerName || "________________"}</h2>
              {customerAddress && <p className="text-slate-600 font-medium text-[11px] italic break-words mt-1">{customerAddress}</p>}
              {customerPhone && <p className="text-slate-600 font-medium text-[11px] mt-1">Mo No: {customerPhone}</p>}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-hidden">
              <p className="font-bold text-[#1e3a5f] mb-2 uppercase text-[10px] tracking-widest border-b border-slate-200 pb-1">System Overview</p>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between"><span>System Size:</span> <strong>{actualSystemSize} KW ({phase === 1 ? "Single Phase" : "Three Phase"})</strong></div>
                <div className="flex justify-between gap-2"><span>Modules:</span> <strong className="text-right max-w-[60%]">{effectivePanelBrand} {panelWattage}Wp ({panelType})</strong></div>
                <div className="flex justify-between text-slate-600"><span>Module Warranty:</span> <strong>{panelWarranty}</strong></div>
                <div className="flex justify-between gap-2"><span>Inverter:</span> <strong className="text-right max-w-[60%]">{effectiveInverterBrand} {inverterModel}</strong></div>
                <div className="flex justify-between text-slate-600"><span>Inverter Warranty:</span> <strong>{inverterWarranty}</strong></div>
                {(selectedSystemType === "Hybrid" || selectedSystemType === "Off-grid") && (
                  <div className="flex justify-between text-slate-600"><span>Battery Warranty:</span> <strong>{effectiveBatteryWarranty}</strong></div>
                )}
                <div className="flex justify-between"><span>Type:</span> <strong>{selectedSystemType}</strong></div>
              </div>
            </div>
          </div>

          {/* Components Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 mb-6">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[#1e3a5f] border-b border-slate-200">
                  <th className="p-2.5 text-center w-8">S.N</th>
                  <th className="p-2.5 text-left w-1/4">Components</th>
                  <th className="p-2.5 text-left">Description</th>
                  <th className="p-2.5 text-center w-14">Qty</th>
                  <th className="p-2.5 text-center w-20">Make</th>
                </tr>
              </thead>
              <tbody>
                {components.map((comp, index) => (
                  <tr key={index} className={`border-b border-slate-200 ${index % 2 === 1 ? "bg-slate-50/50" : "bg-white"}`}>
                    <td className="p-2 text-center font-bold">{index + 1}</td>
                    <td className="p-2 font-bold text-slate-800">{comp.name}</td>
                    <td className={`p-2 ${index < 2 ? "text-slate-800 font-medium" : "text-slate-600"}`}>{comp.description}</td>
                    <td className="p-2 text-center font-bold">{comp.quantity}</td>
                    <td className="p-2 text-center font-bold text-blue-800">{comp.make}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing & Subsidy */}
          <div className="avoid-break grid grid-cols-2 gap-6 mb-6">
            <div>
              {calculations.totalSubsidy > 0 && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-4">
                  <p className="font-black text-green-800 text-[10px] uppercase mb-2 tracking-widest">PM Surya Ghar Subsidy</p>
                  <div className="flex justify-between text-sm py-1 border-b border-green-200"><span>Central Subsidy:</span><strong>₹ {formatCurrency(centralSubsidy)}/-</strong></div>
                  <div className="flex justify-between text-sm py-1 border-b border-green-200"><span>State Subsidy:</span><strong>₹ {formatCurrency(stateSubsidy)}/-</strong></div>
                  <div className="flex justify-between text-base pt-3 font-black text-green-800 uppercase"><span>Total Benefit:</span><span className="text-xl">₹ {formatCurrency(calculations.totalSubsidy)}/-</span></div>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-[10px]">
                <p className="font-black text-[#1e3a5f] uppercase mb-2 border-b border-blue-200 pb-1">Bank Details</p>
                <p className="my-1"><strong>A/c Name:</strong> {companyDetails.bank.accountName}</p>
                <p className="my-1"><strong>A/c No:</strong> {companyDetails.bank.accountNumber} | <strong>IFSC:</strong> {companyDetails.bank.ifsc}</p>
                <p className="my-1"><strong>Bank:</strong> {companyDetails.bank.name}, {companyDetails.bank.branch}</p>
                <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-center">
                  <p className="font-bold text-[#1e3a5f] text-[10px] mb-1">Scan to Pay</p>
                  <a href={`upi://pay?pa=${companyDetails.bank.upiId}&pn=${encodeURIComponent(companyDetails.name)}&am=${calculations.totalAmount}&cu=INR`} className="inline-block">
                    <img 
                      src={origin ? `${origin}/payment.png` : "/payment.png"} 
                      alt="Payment QR" 
                      className="w-24 h-24 object-contain mix-blend-multiply mx-auto cursor-pointer" 
                      onError={(e: any) => e.currentTarget.style.display = 'none'} 
                    />
                  </a>
                  <p className="text-[8px] text-slate-500 mt-1">Click or Scan with UPI App</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-blue-200">
              <p className="font-bold text-[#1e3a5f] text-[10px] uppercase mb-4 tracking-widest border-b border-blue-200 pb-1">Investment Summary</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500"><span>Base Price:</span><span>₹ {formatCurrency(calculations.originalBasePrice)}</span></div>
                {extraCosts.structureCost > 0 && <div className="flex justify-between text-[11px] text-amber-600 font-medium"><span>+ Extra Structure:</span><span>₹ {formatCurrency(extraCosts.structureCost)}</span></div>}
                {extraCosts.panelsCost > 0 && <div className="flex justify-between text-[11px] text-amber-600 font-medium"><span>+ Extra Panels ({extraPanelCount}):</span><span>₹ {formatCurrency(extraCosts.panelsCost)}</span></div>}
                {extraCosts.wireCost > 0 && <div className="flex justify-between text-[11px] text-amber-600 font-medium"><span>+ Extra Wire ({extraWireLength}m):</span><span>₹ {formatCurrency(extraCosts.wireCost)}</span></div>}
                <div className="flex justify-between text-[11px] text-slate-500 border-b border-slate-200 pb-2 mb-1"><span>GST (@ {gstRate}%):</span><span>₹ {formatCurrency(calculations.gstAmount)}</span></div>
                <div className="flex justify-between text-lg font-black text-[#1e3a5f] pt-2"><span className="text-[11px] uppercase self-center">Total Amount:</span><span className="text-blue-700">₹ {formatCurrency(calculations.totalAmount)}</span></div>
              </div>
              <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-xl text-center">
                <p className="text-[9px] text-blue-700 uppercase font-black tracking-widest mb-1">{calculations.totalSubsidy > 0 ? "Effective Cost After Subsidy" : "Effective Cost"}</p>
                <p className="text-3xl font-black text-green-600 tracking-tighter">₹ {formatCurrency(calculations.effectiveCost)}*</p>
              </div>
            </div>
          </div>

          {/* Savings Table */}
          <div className="overflow-hidden mb-6">
            <p className="font-bold text-[#1e3a5f] text-[10px] uppercase mb-2 tracking-widest border-b border-slate-200 pb-1">Breakdown of Savings & Financials</p>
            <table className="w-full text-[11px] border-collapse border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="p-2 text-center border-b border-slate-200 w-10">S.No</th>
                  <th className="p-2 text-left border-b border-slate-200">Content</th>
                  <th className="p-2 text-right border-b border-slate-200">Amount / Details</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200"><td className="p-2 text-center font-medium">1</td><td className="p-2">Proposed Solar Plant Size</td><td className="p-2 text-right font-bold">{actualSystemSize} KW</td></tr>
                <tr className="border-b border-slate-200"><td className="p-2 text-center font-medium">2</td><td className="p-2">Annual Units Generation (approx.)</td><td className="p-2 text-right font-bold">{calculations.annualUnits} Units</td></tr>
                <tr className="border-b border-slate-200"><td className="p-2 text-center font-medium">3</td><td className="p-2">Average Grid Electricity Rate</td><td className="p-2 text-right font-bold">Rs. 6.5 / Unit</td></tr>
                <tr className="border-b border-slate-200 font-bold"><td className="p-2 text-center">4</td><td className="p-2 text-slate-800">Annual Savings</td><td className="p-2 text-right text-green-600">Rs. {formatCurrency(calculations.annualSavings)}</td></tr>
                <tr className="border-b border-slate-200 bg-green-50/50 font-bold text-green-900"><td className="p-2 text-center">5</td><td className="p-2">Subsidy Applicable (Central + State)</td><td className="p-2 text-right">Total: ₹ {formatCurrency(calculations.totalSubsidy)}</td></tr>
                <tr className="font-bold"><td className="p-2 text-center">6</td><td className="p-2 text-slate-800">Return on Investment (ROI)</td><td className="p-2 text-right text-orange-600">{calculations.roiYears} Years</td></tr>
              </tbody>
            </table>
          </div>

          {/* Terms */}
          <div className="avoid-break text-[10px] border-t border-slate-200 pt-4">
            <p className="font-black text-slate-800 uppercase mb-2 tracking-widest">Terms and Conditions</p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1 list-disc pl-4 text-slate-500 m-0">
              {terms.map((term, i) => <li key={i} className="leading-tight" dangerouslySetInnerHTML={{ __html: term.replace(/^([^:]+):/, '<strong>$1:</strong>') }} />)}
            </ul>
          </div>

          {/* Signature */}
          <div className="mt-12 flex justify-between items-end px-2">
            <div className="text-center">
              <div className="w-40 h-px bg-slate-300 mb-2 mx-auto" />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Customer Signature</p>
            </div>

            {/* Savings Analysis */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h2 className="font-bold text-blue-800 mb-2 uppercase text-[10px] tracking-widest border-b border-blue-200 pb-1">Savings Analysis (Annual)</h2>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white p-2 rounded-lg border border-blue-100 text-center">
                  <p className="text-[9px] text-blue-500 font-bold uppercase">Gen (Units)</p>
                  <p className="text-sm font-black text-blue-900">{calculations.annualUnits} kWh</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-100 text-center">
                  <p className="text-[9px] text-blue-500 font-bold uppercase">Gen (Value)</p>
                  <p className="text-sm font-black text-green-600">₹ {formatCurrency(calculations.annualSavings)}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-100/50 rounded-lg border border-blue-200">
                <p className="text-[10px] font-bold text-blue-800 mb-1">Environmental Impact:</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-600 text-lg">🌳</div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-700 leading-tight">Equivalent to planting</p>
                    <p className="text-sm font-black text-green-700 leading-tight">{(actualSystemSize * 25).toFixed(0)} Trees / Year</p>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-blue-500 italic mt-3 text-center">* Estimated at average 4 units/day per KW and ₹7.5/unit rate.</p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="avoid-break mt-4">
            <h2 className="font-bold text-slate-900 mb-2 uppercase text-[10px] tracking-widest">Terms & Conditions</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {terms.map((term, i) => (
                <div key={i} className="flex gap-2 text-[10px] text-slate-600 leading-tight">
                  <span className="text-yellow-600 font-bold">{i + 1}.</span>
                  <p>{term}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer / Signature */}
          <div className="avoid-break mt-12 flex justify-between items-end border-t border-slate-100 pt-6">
            <div>
              <p className="text-[10px] text-slate-500 mb-1">For <strong>Arpit Solar Shop</strong></p>
              <img 
                src={origin ? `${origin}/sign.png` : "/sign.png"} 
                alt="Signature" 
                className="h-10 mb-1 mix-blend-multiply" 
                onError={(e: any) => { e.currentTarget.style.display = 'none'; }} 
              />
              <p className="text-[11px] font-black text-slate-800">Authorized Signatory</p>
            </div>
            <div className="text-right text-[9px] text-slate-400">
              <p>Scan to verify</p>
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded ml-auto mt-1 flex items-center justify-center text-slate-200">
                QR Code
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* DIALOGS */}
      
      {/* Edit Component Dialog */}
      <Dialog open={editComponentDialog} onOpenChange={setEditComponentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
            <DialogDescription>Modify the component details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingComponent && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={editingComponent.name} onChange={(e) => setEditingComponent({ ...editingComponent, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={editingComponent.description} onChange={(e) => setEditingComponent({ ...editingComponent, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" value={editingComponent.quantity} onChange={(e) => setEditingComponent({ ...editingComponent, quantity: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="make">Make</Label>
                    <Input id="make" value={editingComponent.make} onChange={(e) => setEditingComponent({ ...editingComponent, make: e.target.value })} />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditComponentDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveComponentEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Component Dialog */}
      <Dialog open={addComponentDialog} onOpenChange={setAddComponentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Component</DialogTitle>
            <DialogDescription>Enter the details for the new component.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-name">Name</Label>
              <Input id="new-name" value={newComponent.name} onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })} placeholder="e.g. Earthing Kit" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-description">Description</Label>
              <Input id="new-description" value={newComponent.description} onChange={(e) => setNewComponent({ ...newComponent, description: e.target.value })} placeholder="e.g. 1.2m Copper Rod" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-quantity">Quantity</Label>
                <Input id="new-quantity" value={newComponent.quantity} onChange={(e) => setNewComponent({ ...newComponent, quantity: e.target.value })} placeholder="e.g. 2 Nos" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-make">Make</Label>
                <Input id="new-make" value={newComponent.make} onChange={(e) => setNewComponent({ ...newComponent, make: e.target.value })} placeholder="e.g. Standard" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddComponentDialog(false)}>Cancel</Button>
            <Button onClick={handleAddComponent}>Add Component</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
