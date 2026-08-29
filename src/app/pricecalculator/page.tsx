"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  PRINTSTER_PAPER_GSM, 
  PRINTSTER_BINDINGS, 
  PRINTSTER_COVERS, 
  calculateDetailedPrintingQuote,
  loadPricingFromFirestore,
  loadOffersFromFirestore
} from "@/lib/pricing";
import { 
  Calculator, 
  Layers, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  UploadCloud, 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Tag, 
  RefreshCw,
  FileCheck
} from "lucide-react";

type PresetCategory = "document" | "book" | "thesis" | "booklet" | "certificates";

export default function PriceCalculatorPage() {
  const router = useRouter();

  // Document & Preset Category
  const [activePreset, setActivePreset] = useState<PresetCategory>("document");

  // Specs state
  const [paperSize, setPaperSize] = useState<"A4" | "A3" | "A5" | "B5">("A4");
  const [paperGsm, setPaperGsm] = useState<number>(75);
  const [colorMode, setColorMode] = useState<"bw" | "color" | "partial">("bw");
  const [sides, setSides] = useState<"single" | "double">("double");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [bindingType, setBindingType] = useState<string>("spiral_plastic");
  const [coverType, setCoverType] = useState<string>("pvc_transparent");
  const [pages, setPages] = useState<number>(50);
  const [copies, setCopies] = useState<number>(1);

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFileSize, setUploadedFileSize] = useState<number>(0);
  const [uploadedFileType, setUploadedFileType] = useState<string>("");
  const [isAnalyzingFile, setIsAnalyzingFile] = useState<boolean>(false);

  // Load Firestore pricing on mount
  useEffect(() => {
    loadPricingFromFirestore();
    loadOffersFromFirestore();
  }, []);

  // Presets Quick Switcher
  const handlePresetSelect = (preset: PresetCategory) => {
    setActivePreset(preset);
    if (preset === "document") {
      setPaperSize("A4");
      setPaperGsm(75);
      setColorMode("bw");
      setSides("double");
      setBindingType("none");
      setCoverType("none");
      setPages(20);
    } else if (preset === "book") {
      setPaperSize("A5");
      setPaperGsm(85);
      setColorMode("bw");
      setSides("double");
      setBindingType("softcover_perfect");
      setCoverType("gloss_laminated");
      setPages(180);
      setCopies(10);
    } else if (preset === "thesis") {
      setPaperSize("A4");
      setPaperGsm(85);
      setColorMode("bw");
      setSides("single");
      setBindingType("hardcover_gold");
      setCoverType("hardcover_embossed");
      setPages(120);
      setCopies(3);
    } else if (preset === "booklet") {
      setPaperSize("A4");
      setPaperGsm(130);
      setColorMode("color");
      setSides("double");
      setBindingType("staple_booklet");
      setCoverType("300gsm_card");
      setPages(16);
      setCopies(50);
    } else if (preset === "certificates") {
      setPaperSize("A4");
      setPaperGsm(300);
      setColorMode("color");
      setSides("single");
      setBindingType("none");
      setCoverType("none");
      setPages(1);
      setCopies(100);
    }
  };

  // Live calculation
  const quote = useMemo(() => {
    return calculateDetailedPrintingQuote({
      pages,
      copies,
      paperSize,
      paperGsm,
      colorMode,
      sides,
      bindingType,
      coverType,
    });
  }, [pages, copies, paperSize, paperGsm, colorMode, sides, bindingType, coverType]);

  // Handle local file drop / page detection simulation
  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadedFileSize(file.size);
    setUploadedFileType(file.type);
    setIsAnalyzingFile(true);

    // If PDF, simulate fast page count detection or estimate
    setTimeout(() => {
      setIsAnalyzingFile(false);
      if (file.type.includes("pdf")) {
        const estimatedPages = Math.max(1, Math.min(600, Math.round(file.size / 45000)));
        if (estimatedPages > 1) {
          setPages(estimatedPages);
        }
      }
    }, 600);
  };

  // Proceed to checkout with prefilled specs
  const handleProceedToCheckout = () => {
    const specs = {
      paperSize,
      paperGsm,
      colorMode,
      sides,
      orientation,
      binding: bindingType,
      bindingType,
      coverType,
      spineWidthMm: quote.spineWidthMm,
      pages,
      copies,
      documentType: activePreset,
    };

    const serviceId = `${paperSize.toLowerCase()}-${colorMode === "color" ? "color" : "bw"}`;

    const query = new URLSearchParams({
      serviceId,
      qty: copies.toString(),
      specs: JSON.stringify(specs),
      customPrice: quote.totalAmount.toString(),
      fileName: uploadedFileName || "Calculated_Document.pdf",
      fileSize: (uploadedFileSize || 102400).toString(),
      fileType: uploadedFileType || "application/pdf",
    });

    router.push(`/checkout?${query.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#07070a] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />

      {/* Top Banner / Header */}
      <section className="border-b border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-[#090912] pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
                <Calculator className="h-3.5 w-3.5" />
                <span>Instant Printing Cost Estimator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                Online Document & Book Price Calculator
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                Configure your paper GSM, binding types, full color or B&W modes, and calculate exact per-copy and bulk rates with automated spine thickness estimation.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap md:flex-col gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>Transparent Rates + GST Invoice</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                <span>Same-Day & Express Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <span>Up to 35% Bulk Tier Discount</span>
              </div>
            </div>
          </div>

          {/* Preset Chips */}
          <div className="mt-8 pt-6 border-t border-zinc-200/70 dark:border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mr-2 flex-shrink-0">
              Quick Presets:
            </span>
            {[
              { id: "document", label: "Document Printing", icon: FileText },
              { id: "book", label: "Book & Novel (Perfect Bound)", icon: BookOpen },
              { id: "thesis", label: "Thesis & Dissertation (Hardbound)", icon: GraduationCap },
              { id: "booklet", label: "Brochure & Booklet (Stapled)", icon: Layers },
              { id: "certificates", label: "Certificates (300 GSM)", icon: Sparkles },
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id as PresetCategory)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Calculator Lab Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Configurator Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step 1: Document Specs */}
            <div className="rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#0c0c14] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">1</span>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Document Specifications</h2>
                </div>
                <span className="text-xs text-zinc-400">Size, Color & Sides</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Paper Size */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
                    Paper Size
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: "A4", name: "A4 Standard", desc: "210 × 297 mm" },
                      { id: "A3", name: "A3 Large", desc: "297 × 420 mm" },
                      { id: "A5", name: "A5 Book Form", desc: "148 × 210 mm" },
                      { id: "B5", name: "B5 Executive", desc: "176 × 250 mm" },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setPaperSize(sz.id as any)}
                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                          paperSize === sz.id
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                            : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/15 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{sz.name}</p>
                          <p className="text-[10px] text-zinc-400">{sz.desc}</p>
                        </div>
                        {paperSize === sz.id && <Check className="h-4 w-4 text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Mode */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
                    Color Mode
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: "bw", label: "Black & White Laser", tag: "Most Economical", rate: "from ₹1.20/pg" },
                      { id: "partial", label: "Partial Color (Text + Headings)", tag: "Balanced", rate: "from ₹3.50/pg" },
                      { id: "color", label: "Vivid Full Color (CMYK)", tag: "Laser Rich", rate: "from ₹6.00/pg" },
                    ].map((cm) => (
                      <button
                        key={cm.id}
                        type="button"
                        onClick={() => setColorMode(cm.id as any)}
                        className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                          colorMode === cm.id
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                            : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/15 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            cm.id === "bw" ? "bg-zinc-800 dark:bg-white" : cm.id === "partial" ? "bg-amber-500" : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                          }`} />
                          <span className="text-xs">{cm.label}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">{cm.rate}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Printing Side & Orientation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                    Print Sides
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-white/5 p-1.5 rounded-2xl border border-zinc-200/60 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setSides("single")}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        sides === "single"
                          ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      Single Sided (Simplex)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSides("double")}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        sides === "double"
                          ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      Back-to-Back (Duplex)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                    Orientation
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-white/5 p-1.5 rounded-2xl border border-zinc-200/60 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setOrientation("portrait")}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        orientation === "portrait"
                          ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      Portrait
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation("landscape")}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        orientation === "landscape"
                          ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      Landscape
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Paper Quality & GSM Selector */}
            <div className="rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#0c0c14] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">2</span>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Paper Quality & GSM Weight</h2>
                </div>
                <span className="text-xs text-zinc-400 font-semibold">{paperGsm} GSM Selected</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRINTSTER_PAPER_GSM.map((item) => {
                  const isSelected = paperGsm === item.gsm;
                  return (
                    <button
                      key={item.gsm}
                      type="button"
                      onClick={() => setPaperGsm(item.gsm)}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/20"
                          : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/15 text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-white/[0.01]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{item.name}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />}
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-zinc-200/50 dark:border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Best for: {item.bestFor}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Binding & Cover Finishing */}
            <div className="rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#0c0c14] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">3</span>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Binding Style & Cover Finishing</h2>
                </div>
                <span className="text-xs text-zinc-400">9 Professional Styles</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                  Choose Book / Document Binding
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRINTSTER_BINDINGS.map((b) => {
                    const isSelected = bindingType === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBindingType(b.id)}
                        className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/20"
                            : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/15 text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-white/[0.01]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs truncate max-w-[170px]">{b.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />}
                          </div>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {b.desc}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-zinc-200/50 dark:border-white/5 flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">Max {b.maxPages} pgs</span>
                          <span className="font-bold text-indigo-500">{b.basePrice === 0 ? "Free" : `+₹${b.basePrice}/copy`}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cover options */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                  Cover Card & Protective Sheet
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {PRINTSTER_COVERS.map((c) => {
                    const isSelected = coverType === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCoverType(c.id)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        <span className="truncate max-w-[190px]">{c.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 4: Pages, Copies & Instant File Upload */}
            <div className="rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#0c0c14] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">4</span>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Page Count, Copies & File Drop</h2>
                </div>
                <span className="text-xs text-zinc-400">Instant File Analysis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Pages Stepper */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Total Pages in File
                    </label>
                    <span className="text-xs text-indigo-500 font-bold">
                      {quote.sheetsPerCopy} Physical Sheets ({sides === "double" ? "2-sided" : "1-sided"})
                    </span>
                  </div>
                  <div className="flex items-center rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-zinc-50 dark:bg-white/[0.02]">
                    <button
                      type="button"
                      onClick={() => setPages(Math.max(1, pages - 5))}
                      className="px-4 py-3 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 font-bold transition cursor-pointer"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => setPages(Math.max(1, pages - 1))}
                      className="px-3.5 py-3 bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100 text-zinc-700 dark:text-zinc-200 font-bold transition cursor-pointer"
                    >
                      -1
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={pages}
                      onChange={(e) => setPages(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full text-center py-2.5 bg-transparent text-base font-black text-zinc-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPages(pages + 1)}
                      className="px-3.5 py-3 bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100 text-zinc-700 dark:text-zinc-200 font-bold transition cursor-pointer"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setPages(pages + 5)}
                      className="px-4 py-3 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 font-bold transition cursor-pointer"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Copies Stepper */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Number of Copies / Sets
                    </label>
                    {quote.bulkDiscountPercent > 0 && (
                      <span className="text-xs text-emerald-500 font-bold">
                        🎉 {quote.bulkDiscountPercent}% Bulk Discount Unlocked!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-zinc-50 dark:bg-white/[0.02]">
                    <button
                      type="button"
                      onClick={() => setCopies(Math.max(1, copies - 10))}
                      className="px-4 py-3 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 font-bold transition cursor-pointer"
                    >
                      -10
                    </button>
                    <button
                      type="button"
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      className="px-3.5 py-3 bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100 text-zinc-700 dark:text-zinc-200 font-bold transition cursor-pointer"
                    >
                      -1
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full text-center py-2.5 bg-transparent text-base font-black text-zinc-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCopies(copies + 1)}
                      className="px-3.5 py-3 bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100 text-zinc-700 dark:text-zinc-200 font-bold transition cursor-pointer"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setCopies(copies + 10)}
                      className="px-4 py-3 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 font-bold transition cursor-pointer"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              {/* Document File Uploader Dropzone */}
              <div className="relative border-2 border-dashed border-zinc-200 dark:border-white/10 hover:border-indigo-500/50 rounded-2xl p-6 text-center transition bg-zinc-50/50 dark:bg-white/[0.01]">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.ppt,.pptx,.png,.jpg,.jpeg"
                  onChange={handleFileDrop}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                    {isAnalyzingFile ? (
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    ) : uploadedFileName ? (
                      <FileCheck className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <UploadCloud className="h-6 w-6" />
                    )}
                  </div>
                  {uploadedFileName ? (
                    <div>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {uploadedFileName} ({(uploadedFileSize / 1024 / 1024).toFixed(2)} MB)
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        File attached. Click or drag to replace.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        Drop your PDF or document here to auto-detect pages
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Supports PDF, DOCX, PPTX, JPG, PNG (Max 500 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Live Estimate Sticky Summary Card (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            
            {/* Live Pricing Summary Box */}
            <div className="rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#0c0c14] shadow-xl shadow-indigo-500/5 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">Live Price Breakdown</h3>
                  <p className="text-xs text-zinc-500">Real-time instant calculation</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Best Price
                </span>
              </div>

              {/* Spine Width Calculator Indicator (Printster Feature) */}
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    Spine Thickness Estimator
                  </span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {quote.spineWidthMm} mm
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Based on {quote.sheetsPerCopy} sheets of {paperGsm} GSM + {bindingType.replace(/_/g, " ")}.
                </p>
                {/* Visual spine representation bar */}
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(8, quote.spineWidthMm * 3))}%` }}
                  />
                </div>
              </div>

              {/* Itemized Calculations */}
              <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 border-b border-zinc-100 dark:border-white/5 pb-4">
                <div className="flex justify-between">
                  <span>Printing ({pages} pgs @ {colorMode.toUpperCase()}):</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{(quote.printCostPerCopy * copies).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paper ({quote.totalSheets} sheets of {paperGsm} GSM):</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{(quote.paperCostPerCopy * copies).toFixed(2)}</span>
                </div>
                {quote.bindingCostPerCopy > 0 && (
                  <div className="flex justify-between">
                    <span>Binding ({copies} copies):</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{(quote.bindingCostPerCopy * copies).toFixed(2)}</span>
                  </div>
                )}
                {quote.coverCostPerCopy > 0 && (
                  <div className="flex justify-between">
                    <span>Cover Finishes ({copies} copies):</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{(quote.coverCostPerCopy * copies).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-zinc-100 dark:border-white/5">
                  <span>Gross Subtotal:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">₹{quote.grossSubtotal.toFixed(2)}</span>
                </div>
                {quote.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>Bulk Tier Savings ({quote.bulkDiscountPercent}%):</span>
                    <span>-₹{quote.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18% Included):</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">₹{quote.gstAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Total Payable Block */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-zinc-400 font-medium">Estimated Total Payable:</span>
                  <span className="text-xs text-zinc-500 font-bold">
                    ₹{quote.costPerCopy.toFixed(2)} / copy
                  </span>
                </div>
                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  ₹{quote.totalAmount.toFixed(2)}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Effective price: ~₹{quote.effectivePricePerPage.toFixed(2)} per printed page
                </p>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 active:scale-98 cursor-pointer"
              >
                <span>Proceed to Order & Print</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="space-y-2 pt-2 text-[11px] text-zinc-500">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Free manual PDF pre-flight layout check</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Doorstep delivery with tracked courier</span>
                </div>
              </div>
            </div>

            {/* Printster-Style Volume Discount Tier Table */}
            <div className="rounded-3xl p-6 border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#0c0c14] space-y-4">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest">
                Tiered Volume Discount Scale
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { range: "1 – 9 Copies", discount: "Base Rate" },
                  { range: "10 – 24 Copies", discount: "5% OFF" },
                  { range: "25 – 49 Copies", discount: "10% OFF" },
                  { range: "50 – 99 Copies", discount: "15% OFF" },
                  { range: "100 – 249 Copies", discount: "20% OFF" },
                  { range: "250 – 499 Copies", discount: "25% OFF" },
                  { range: "500+ Copies", discount: "35% OFF (Bulk)" },
                ].map((tier, idx) => (
                  <div 
                    key={idx} 
                    className={`flex justify-between p-2 rounded-xl text-[11px] ${
                      (copies >= 500 && idx === 6) ||
                      (copies >= 250 && copies < 500 && idx === 5) ||
                      (copies >= 100 && copies < 250 && idx === 4) ||
                      (copies >= 50 && copies < 100 && idx === 3) ||
                      (copies >= 25 && copies < 50 && idx === 2) ||
                      (copies >= 10 && copies < 25 && idx === 1) ||
                      (copies < 10 && idx === 0)
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20"
                        : "text-zinc-500"
                    }`}
                  >
                    <span>{tier.range}</span>
                    <span>{tier.discount}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
