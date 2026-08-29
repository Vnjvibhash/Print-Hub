"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FileUploader from "@/components/upload/FileUploader";
import { dbService } from "@/lib/firebase";
import { calculatePricing, loadPricingFromFirestore, loadOffersFromFirestore, getBestOfferForService } from "@/lib/pricing";
import { ServiceItem, ServiceCategory, SpecificationOptions, PriceBreakdown } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Printer, 
  Layers, 
  Sparkles, 
  FileText, 
  Check, 
  ChevronRight, 
  Info, 
  Settings, 
  X, 
  CreditCard,
  Palette
} from "lucide-react";

interface CategoryThemeConfig {
  name: string;
  tagline: string;
  color: string;
  pillActive: string;
  badgeBg: string;
  buttonBg: string;
  cardBorderHover: string;
  cardHoverShadow: string;
  priceColor: string;
  iconColor: string;
  iconBg: string;
  ambientGradient: string;
}

const THEME_PRESETS: Record<string, CategoryThemeConfig> = {
  indigo: {
    name: "Neon Indigo",
    tagline: "High-precision digital laser printing and ultra-clear reproduction.",
    color: "indigo",
    pillActive: "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25",
    badgeBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    buttonBg: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20",
    cardBorderHover: "hover:border-indigo-500/40",
    cardHoverShadow: "hover:shadow-indigo-500/10",
    priceColor: "text-indigo-600 dark:text-indigo-400",
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    ambientGradient: "from-indigo-600/10 via-purple-600/5 to-transparent",
  },
  emerald: {
    name: "Cyber Emerald",
    tagline: "Corporate executive business stationery and luxury embossed finishes.",
    color: "emerald",
    pillActive: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
    cardBorderHover: "hover:border-emerald-500/40",
    cardHoverShadow: "hover:shadow-emerald-500/10",
    priceColor: "text-emerald-600 dark:text-emerald-400",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    ambientGradient: "from-emerald-600/10 via-teal-600/5 to-transparent",
  },
  purple: {
    name: "Royal Purple",
    tagline: "Creative studio custom apparel, vibrant merchandise and photo gifts.",
    color: "purple",
    pillActive: "bg-purple-600 text-white shadow-lg shadow-purple-500/25",
    badgeBg: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
    buttonBg: "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20",
    cardBorderHover: "hover:border-purple-500/40",
    cardHoverShadow: "hover:shadow-purple-500/10",
    priceColor: "text-purple-600 dark:text-purple-400",
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    ambientGradient: "from-purple-600/10 via-pink-600/5 to-transparent",
  },
  amber: {
    name: "Sunset Amber",
    tagline: "High-visibility certificates, event badges, and golden metallic finishes.",
    color: "amber",
    pillActive: "bg-amber-600 text-white shadow-lg shadow-amber-500/25",
    badgeBg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    buttonBg: "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-500/20",
    cardBorderHover: "hover:border-amber-500/40",
    cardHoverShadow: "hover:shadow-amber-500/10",
    priceColor: "text-amber-600 dark:text-amber-400",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    ambientGradient: "from-amber-600/10 via-orange-600/5 to-transparent",
  },
  rose: {
    name: "Crimson Rose",
    tagline: "Passionate premium bespoke printing, novel editions & thesis binding.",
    color: "rose",
    pillActive: "bg-rose-600 text-white shadow-lg shadow-rose-500/25",
    badgeBg: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
    buttonBg: "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20",
    cardBorderHover: "hover:border-rose-500/40",
    cardHoverShadow: "hover:shadow-rose-500/10",
    priceColor: "text-rose-600 dark:text-rose-400",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    ambientGradient: "from-rose-600/10 via-red-600/5 to-transparent",
  },
  sky: {
    name: "Ocean Sky",
    tagline: "High-resolution OCR digital scanning, legal typing, and clear protective laminations.",
    color: "sky",
    pillActive: "bg-sky-600 text-white shadow-lg shadow-sky-500/25",
    badgeBg: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400",
    buttonBg: "bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-500/20",
    cardBorderHover: "hover:border-sky-500/40",
    cardHoverShadow: "hover:shadow-sky-500/10",
    priceColor: "text-sky-600 dark:text-sky-400",
    iconColor: "text-sky-500",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    ambientGradient: "from-sky-600/10 via-blue-600/5 to-transparent",
  },
};

const CATEGORIES: { id: ServiceCategory; label: string; icon: any; defaultThemeKey: string }[] = [
  { id: "printing", label: "Printing Services", icon: Printer, defaultThemeKey: "indigo" },
  { id: "business", label: "Business Services", icon: Layers, defaultThemeKey: "emerald" },
  { id: "merchandise", label: "Custom Merchandise", icon: Sparkles, defaultThemeKey: "purple" },
  { id: "documents", label: "Document Services", icon: FileText, defaultThemeKey: "sky" },
];

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("category") as ServiceCategory;
  const initialCategory = CATEGORIES.some(c => c.id === catParam) ? catParam : "printing";

  const [activeCategory, setActiveCategory] = useState<ServiceCategory>(initialCategory);
  const [themeMode, setThemeMode] = useState<"auto" | "indigo" | "emerald" | "purple" | "amber" | "rose" | "sky">("auto");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsVersion, setSettingsVersion] = useState(0);

  // Selected Service Configuration State (For Modal)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [pages, setPages] = useState<number>(1);
  const [copies, setCopies] = useState<number>(1);
  const [paperSize, setPaperSize] = useState<"A4" | "A3">("A4");
  const [colorMode, setColorMode] = useState<"bw" | "color">("bw");
  const [sides, setSides] = useState<"single" | "double">("single");
  const [binding, setBinding] = useState<"none" | "spiral" | "lamination">("none");
  const [quantity, setQuantity] = useState<number>(1); // General copies for standard items

  // File Upload State
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [uploadedFileMeta, setUploadedFileMeta] = useState<any>(null);

  // Live Pricing
  const [livePrice, setLivePrice] = useState<PriceBreakdown | null>(null);

  const activeCategoryObj = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  const effectiveThemeKey = themeMode === "auto" ? activeCategoryObj.defaultThemeKey : themeMode;
  const activeTheme = THEME_PRESETS[effectiveThemeKey] || THEME_PRESETS.indigo;

  // Fetch Services + pricing/offers from Firestore
  useEffect(() => {
    async function loadAll() {
      try {
        // Pull latest admin pricing + offers from Firestore into localStorage
        await Promise.all([loadPricingFromFirestore(), loadOffersFromFirestore()]);
        // Now load services (they may have updated pricingTiers)
        const svcs = await dbService.getCollection<ServiceItem>("services");
        setServices(svcs);
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();

    // Re-read offers when admin changes pricing/offers in another tab
    const onSettingsUpdate = () => setSettingsVersion((v) => v + 1);
    window.addEventListener("printhub_settings_updated", onSettingsUpdate);
    window.addEventListener("storage", onSettingsUpdate);
    return () => {
      window.removeEventListener("printhub_settings_updated", onSettingsUpdate);
      window.removeEventListener("storage", onSettingsUpdate);
    };
  }, [settingsVersion]);

  // Update live pricing calculation
  useEffect(() => {
    if (!selectedService) return;

    const specs: SpecificationOptions = {
      paperSize,
      colorMode: selectedService.id.includes("color") ? "color" : colorMode,
      sides,
      binding,
      pages,
      copies,
    };

    const price = calculatePricing(selectedService.id, quantity, specs);
    setLivePrice(price);
  }, [selectedService, pages, copies, paperSize, colorMode, sides, binding, quantity]);

  const handleOpenConfigModal = (service: ServiceItem) => {
    // Check if custom merchandise, redirect to designer canvas directly
    if (service.category === "merchandise") {
      const type = service.id.replace("-print", "");
      router.push(`/customizer?type=${type}`);
      return;
    }

    setSelectedService(service);
    // Set some smart defaults based on service choice
    setPages(1);
    setCopies(1);
    setQuantity(1);
    setBinding("none");
    setUploadedFileUrl("");
    setUploadedFileMeta(null);

    if (service.id.includes("a3")) {
      setPaperSize("A3");
    } else {
      setPaperSize("A4");
    }

    if (service.id.includes("color")) {
      setColorMode("color");
    } else {
      setColorMode("bw");
    }
  };

  const handleUploadSuccess = (fileUrl: string, fileMetadata: { name: string; size: number; type: string }) => {
    setUploadedFileUrl(fileUrl);
    setUploadedFileMeta(fileMetadata);
  };

  const handleProceedToCheckout = () => {
    if (!selectedService || !livePrice) return;

    // Build specs payload
    const specs: SpecificationOptions = {
      paperSize,
      colorMode: selectedService.id.includes("color") ? "color" : colorMode,
      sides,
      binding,
      pages,
      copies,
      customImageUrl: uploadedFileUrl || undefined
    };

    const query = new URLSearchParams({
      serviceId: selectedService.id,
      qty: quantity.toString(),
      specs: JSON.stringify(specs),
      fileUrl: uploadedFileUrl,
      fileName: uploadedFileMeta?.name || "",
      fileSize: uploadedFileMeta?.size?.toString() || "0",
      fileType: uploadedFileMeta?.type || "",
    });

    setSelectedService(null);
    router.push(`/checkout?${query.toString()}`);
  };

  const filteredServices = services.filter(s => s.category === activeCategory);

  return (
    <main className="flex-grow w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12 page-fade-in relative transition-colors duration-500">
      {/* Dynamic Ambient Background Glow */}
      <div 
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b ${activeTheme.ambientGradient} blur-3xl pointer-events-none -z-10 transition-all duration-700`} 
      />

      {/* Dynamic Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${activeTheme.badgeBg} border mb-3 transition-all duration-300`}>
          {React.createElement(CATEGORIES.find(c => c.id === activeCategory)?.icon || Printer, { className: "w-3.5 h-3.5" })}
          <span>{activeTheme.name} Catalog</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white transition-colors">
          SUVIR Printing Service Center
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed transition-colors">
          {activeTheme.tagline}
        </p>
      </div>

      {/* Dynamic Categories Tabs Selector */}
      <div className="flex bg-zinc-100/90 dark:bg-zinc-950/90 p-1.5 rounded-2xl max-w-2xl mx-auto border border-zinc-200/80 dark:border-white/10 mb-6 overflow-x-auto whitespace-nowrap shadow-inner backdrop-blur-md">
        {CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          const isActive = activeCategory === cat.id;
          const theme = THEME_PRESETS[cat.defaultThemeKey];
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                isActive
                  ? `${theme.pillActive}`
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <CatIcon className="w-4 h-4 flex-shrink-0" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Theme Atmosphere Switcher Bar */}
      <div className="flex items-center justify-center gap-2 mb-12 flex-wrap text-xs">
        <span className="text-zinc-400 font-semibold flex items-center gap-1 mr-1 text-[11px] uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5" />
          <span>Accent Theme:</span>
        </span>
        {[
          { key: "auto", label: "Auto (Category Match)", dot: "bg-gradient-to-r from-indigo-500 via-emerald-500 to-purple-500" },
          { key: "indigo", label: "Neon Indigo", dot: "bg-indigo-500" },
          { key: "emerald", label: "Cyber Emerald", dot: "bg-emerald-500" },
          { key: "purple", label: "Royal Purple", dot: "bg-purple-500" },
          { key: "amber", label: "Sunset Amber", dot: "bg-amber-500" },
          { key: "rose", label: "Crimson Rose", dot: "bg-rose-500" },
          { key: "sky", label: "Ocean Sky", dot: "bg-sky-500" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setThemeMode(t.key as any)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              themeMode === t.key
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm scale-105"
                : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Services Grid layout with Dynamic Theme Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((svc) => (
            <div 
              key={svc.id} 
              className={`glass-panel border-white/5 rounded-3xl p-7 flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300 group shadow-md ${activeTheme.cardBorderHover} ${activeTheme.cardHoverShadow}`}
            >
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-inherit transition-colors flex items-center justify-between gap-2">
                  <span className="group-hover:translate-x-0.5 transition-transform">{svc.name}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {svc.pricingTiers && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${activeTheme.badgeBg} uppercase tracking-wider`}>
                        Volume Discount
                      </span>
                    )}
                    {/* Offer badge — shown when an active offer applies to this service */}
                    {(() => {
                      const best = getBestOfferForService(svc.id);
                      if (!best) return null;
                      return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
                          {best.discountType === "percentage"
                            ? `${best.discountValue}% OFF`
                            : `₹${best.discountValue} OFF`}
                        </span>
                      );
                    })()}
                  </div>
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[50px]">
                  {svc.description}
                </p>
                <div className="mt-4 border-t border-zinc-100 dark:border-zinc-900/60 pt-4 space-y-2">
                  {svc.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-zinc-600 dark:text-zinc-300">
                      <Check className={`w-3.5 h-3.5 ${activeTheme.iconColor} flex-shrink-0`} />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-zinc-100 dark:border-zinc-900/50 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                    {svc.pricingTiers ? "Price Range" : "Base Rate"}
                  </span>
                  {svc.pricingTiers ? (
                    <p className={`text-sm sm:text-base font-extrabold ${activeTheme.priceColor}`}>
                      ₹{Math.min(...svc.pricingTiers.map(t => t.singleSidePrice)).toFixed(2)} - ₹{Math.max(...svc.pricingTiers.map(t => t.singleSidePrice)).toFixed(2)}
                      <span className="text-xs text-zinc-400 font-normal"> /sheet</span>
                    </p>
                  ) : (
                    <p className="text-base font-extrabold text-zinc-800 dark:text-zinc-100">
                      ₹{svc.basePrice.toFixed(2)}
                      {["printing", "documents"].includes(svc.category) && svc.id !== "resume-creation" && svc.id !== "passport-photo" ? <span className="text-xs text-zinc-400 font-normal">/pg</span> : ""}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => handleOpenConfigModal(svc)}
                  className={`flex items-center space-x-1 px-4 py-2.5 rounded-xl ${activeTheme.buttonBg} text-xs font-bold transition active:scale-95 cursor-pointer`}
                >
                  <span>{svc.category === "merchandise" ? "Design Studio" : "Order Print"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configure Printing & Document specifications modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden my-8 page-fade-in max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <Settings className="w-5 h-5 text-indigo-500 animate-spin-slow" />
                <div>
                  <h3 className="font-extrabold text-zinc-950 dark:text-white text-sm sm:text-base">Configure specifications</h3>
                  <p className="text-[10px] text-zinc-400">{selectedService.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedService(null)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              
              {/* File Upload Box */}
              {["printing", "documents"].includes(selectedService.category) && selectedService.id !== "resume-creation" && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Step 1: Upload Document File
                  </label>
                  <FileUploader 
                    onUploadSuccess={handleUploadSuccess}
                  />
                  {uploadedFileUrl ? (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Ready for checkout calculation.</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-400 flex items-center space-x-1">
                      <Info className="w-3.5 h-3.5" />
                      <span>File must be uploaded before completing checkout.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Specifications Controls Grid */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {selectedService.category === "printing" ? "Step 2: Selection Options" : "Step 1: Configurations"}
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedService.pricingTiers ? (
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Quantity of Sheets Needed</label>
                      <input
                        type="number"
                        min="1"
                        value={pages}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value));
                          setPages(val);
                          setCopies(1); // Force copies to 1 so pages represents total sheet count
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none focus:border-indigo-500/30 font-bold"
                      />
                    </div>
                  ) : (
                    <>
                      {/* Total Pages (If printing/scans/photocopy) */}
                      {["printing", "documents"].includes(selectedService.category) && selectedService.id !== "resume-creation" && selectedService.id !== "passport-photo" && (
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Number of Pages in File</label>
                          <input
                            type="number"
                            min="1"
                            value={pages}
                            onChange={(e) => setPages(Math.max(1, Number(e.target.value)))}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Copies count (If printing/scans/photocopy) */}
                      {["printing", "documents"].includes(selectedService.category) && selectedService.id !== "resume-creation" && selectedService.id !== "passport-photo" && (
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Number of Copies Needed</label>
                          <input
                            type="number"
                            min="1"
                            value={copies}
                            onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* General quantity selector for other flat rate services */}
                  {(selectedService.id === "resume-creation" || selectedService.id === "passport-photo" || selectedService.category === "business") && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                      />
                    </div>
                  )}                  {/* Dimensions selection (Only standard prints) */}
                  {selectedService.category === "printing" && !selectedService.id.includes("photo") && !selectedService.pricingTiers && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Paper Dimensions</label>
                      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40">
                        <button
                          onClick={() => setPaperSize("A4")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            paperSize === "A4" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          A4 Standard
                        </button>
                        <button
                          onClick={() => setPaperSize("A3")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            paperSize === "A3" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          A3 Large Form
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ink Mode selection (Only standard prints) */}
                  {selectedService.category === "printing" && !selectedService.id.includes("photo") && !selectedService.id.includes("color") && !selectedService.id.includes("bw") && !selectedService.pricingTiers && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Color Format</label>
                      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40">
                        <button
                          onClick={() => setColorMode("bw")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            colorMode === "bw" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          Black & White
                        </button>
                        <button
                          onClick={() => setColorMode("color")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            colorMode === "color" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          Full Color
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Single vs Double Sided (Only standard prints, or specialty prints that support sides) */}
                  {((selectedService.supportsSides) || (selectedService.category === "printing" && !selectedService.id.includes("photo") && !selectedService.pricingTiers)) && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Sides Configuration</label>
                      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40">
                        <button
                          onClick={() => setSides("single")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            sides === "single" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          Single-Sided
                        </button>
                        <button
                          onClick={() => setSides("double")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            sides === "double" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          Double-Sided
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Binding & Finishing selectors */}
                  {selectedService.category === "printing" && !selectedService.id.includes("photo") && !selectedService.pricingTiers && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Binding & Finishing</label>
                      <select
                        value={binding}
                        onChange={(e) => setBinding(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none"
                      >
                        <option value="none">No Binding (Loose pages)</option>
                        <option value="spiral">Spiral Binding (+₹40)</option>
                        <option value="lamination">Thermal Lamination (+₹20)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Volume Pricing Tiers Table */}
              {selectedService.pricingTiers && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Volume Pricing Tiers
                  </label>
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                          <th className="p-3 font-bold text-zinc-500 dark:text-zinc-400">Sheet Count</th>
                          <th className="p-3 font-bold text-zinc-500 dark:text-zinc-400 text-right">Single Side Price</th>
                          {selectedService.supportsSides && (
                            <th className="p-3 font-bold text-zinc-500 dark:text-zinc-400 text-right">Double Side Price</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {selectedService.pricingTiers.map((tier: any, idx: number) => {
                          const totalSheets = pages * copies;
                          const isActive = totalSheets >= tier.minQty && (tier.maxQty === null || totalSheets <= tier.maxQty);
                          return (
                            <tr 
                              key={idx} 
                              className={`transition-colors ${
                                isActive 
                                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold" 
                                  : "text-zinc-600 dark:text-zinc-400"
                              }`}
                            >
                              <td className="p-3">
                                {tier.maxQty === null 
                                  ? `${tier.minQty}+ sheets` 
                                  : tier.minQty === tier.maxQty 
                                    ? `${tier.minQty} sheet` 
                                    : `${tier.minQty} - ${tier.maxQty} sheets`}
                              </td>
                              <td className="p-3 text-right">₹{tier.singleSidePrice.toFixed(2)}</td>
                              {selectedService.supportsSides && (
                                <td className="p-3 text-right">
                                  {tier.doubleSidePrice !== undefined ? `₹${tier.doubleSidePrice.toFixed(2)}` : "-"}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Dynamic Live Price Summary */}
              {livePrice && (
                <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl p-4 border border-zinc-200/40 dark:border-zinc-800/60 flex flex-col space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Base Unit Rate</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">₹{livePrice.base.toFixed(2)}</span>
                  </div>
                  {livePrice.optionsPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Additions (Binding / Finishing)</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200">+₹{livePrice.optionsPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-400">
                      Calculated Sub-total 
                      {selectedService.id !== "resume-creation" && selectedService.id !== "passport-photo" && selectedService.category !== "business"
                        ? ` (${pages} ${pages === 1 ? 'pg' : 'pgs'} x ${copies} ${copies === 1 ? 'copy' : 'copies'})`
                        : ` (Qty: ${quantity})`}
                    </span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">₹{livePrice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-250/20 dark:border-zinc-800/80 pt-2 text-sm">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Total Amount (incl. 18% GST)</span>
                    <span className={`font-black ${activeTheme.priceColor}`}>₹{livePrice.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 flex-shrink-0">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-150 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToCheckout}
                disabled={["printing", "documents"].includes(selectedService.category) && selectedService.id !== "resume-creation" && !uploadedFileUrl}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl ${activeTheme.buttonBg} disabled:opacity-40 text-xs font-bold shadow-md transition active:scale-95 cursor-pointer`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm & Checkout</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ServicesContent />
      </Suspense>
      <Footer />
    </>
  );
}
