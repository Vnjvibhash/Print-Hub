"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_PRICING_CONFIG, getAdminRates, DEFAULT_TIERED_SERVICES } from "@/lib/pricing";
import { dbService, isFirebaseEnabled } from "@/lib/firebase";
import {
  Save,
  RotateCcw,
  DollarSign,
  Check,
  AlertTriangle,
} from "lucide-react";

const RATE_GROUPS = [
  {
    title: "Document & Thesis Printing",
    items: [
      { key: "a4-bw", label: "A4 Black & White Page", unit: "page" },
      { key: "a4-color", label: "A4 Full Color Page", unit: "page" },
      { key: "a3-bw", label: "A3 B&W Page", unit: "page" },
      { key: "a3-color", label: "A3 Color Page", unit: "page" },
      { key: "photo-print", label: "Photo Print", unit: "page" },
      { key: "passport-photo", label: "Passport Photo Set", unit: "set" },
      { key: "banner-print", label: "Flex/Banner Print", unit: "sq ft" },
    ],
  },
  {
    title: "Bindings & Finishing",
    items: [
      { key: "binding-spiral", label: "Spiral Binding", unit: "book" },
      { key: "binding-lamination", label: "Thermal Lamination", unit: "sheet" },
    ],
  },
  {
    title: "Document Services",
    items: [
      { key: "scanning", label: "Document Scanning", unit: "page" },
      { key: "xerox", label: "Xerox/Photocopy", unit: "page" },
      { key: "resume-creation", label: "Resume Writing", unit: "flat" },
    ],
  },
  {
    title: "Custom Merchandise",
    items: [
      { key: "mug-print", label: "Ceramic Mug", unit: "mug" },
      { key: "magic-mug", label: "Magic Mug", unit: "mug" },
      { key: "tshirt-print", label: "T-Shirt", unit: "shirt" },
      { key: "hoodie-print", label: "Hoodie", unit: "hoodie" },
      { key: "pillow-print", label: "Cushion/Pillow", unit: "pillow" },
      { key: "mobilecover-print", label: "Mobile Cover", unit: "cover" },
      { key: "keychain-print", label: "Keychain", unit: "keychain" },
      { key: "cap-print", label: "Cap/Hat", unit: "cap" },
      { key: "photoframe-print", label: "Canvas Frame", unit: "canvas" },
      { key: "mousepad-print", label: "Mousepad", unit: "mousepad" },
    ],
  },
  {
    title: "Corporate Business",
    items: [
      { key: "visiting-cards", label: "Visiting Cards", unit: "card" },
      { key: "letterheads", label: "Letterheads", unit: "sheet" },
      { key: "brochures", label: "Flyers/Brochures", unit: "sheet" },
      { key: "menu-print", label: "Menu Card", unit: "copy" },
      { key: "invitation-print", label: "Invitation Card", unit: "card" },
      { key: "calendar-print", label: "Calendar", unit: "calendar" },
      { key: "corporate-gift", label: "Gift Combo Set", unit: "set" },
    ],
  },
];

export default function AdminPricingPage() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [tieredPricing, setTieredPricing] = useState<Record<string, any[]>>({});
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentRates = getAdminRates();
    setRates(currentRates);

    // Load tiered pricing from storage or defaults
    const loadedTiers: Record<string, any[]> = {};
    const settingsRaw = localStorage.getItem("printhub_db_settings");
    let parsedSettings: any = {};
    if (settingsRaw) {
      try { parsedSettings = JSON.parse(settingsRaw); } catch {}
    }

    Object.keys(DEFAULT_TIERED_SERVICES).forEach(id => {
      if (parsedSettings.tieredPricing && parsedSettings.tieredPricing[id]) {
        loadedTiers[id] = parsedSettings.tieredPricing[id];
      } else {
        loadedTiers[id] = JSON.parse(JSON.stringify(DEFAULT_TIERED_SERVICES[id])); // deep copy
      }
    });
    setTieredPricing(loadedTiers);
  }, []);

  const updateRate = (key: string, value: number) => {
    setRates((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  const updateTierPrice = (serviceId: string, index: number, field: "singleSidePrice" | "doubleSidePrice", value: number) => {
    setTieredPricing(prev => {
      const copy = { ...prev };
      const serviceTiers = [...copy[serviceId]];
      serviceTiers[index] = { ...serviceTiers[index], [field]: value };
      copy[serviceId] = serviceTiers;
      return copy;
    });
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    const settingsRaw = localStorage.getItem("printhub_db_settings");
    let settings: any = {};
    if (settingsRaw) {
      try { settings = JSON.parse(settingsRaw); } catch {}
    }
    settings.rates = rates;
    settings.tieredPricing = tieredPricing;
    localStorage.setItem("printhub_db_settings", JSON.stringify(settings));

    // Update cached services in localStorage so services list page picks up the pricingTiers
    const storedServicesRaw = localStorage.getItem("printhub_db_services");
    if (storedServicesRaw) {
      try {
        const services = JSON.parse(storedServicesRaw);
        const updatedServices = services.map((s: any) => {
          if (tieredPricing[s.id]) {
            return { ...s, pricingTiers: tieredPricing[s.id] };
          }
          return s;
        });
        localStorage.setItem("printhub_db_services", JSON.stringify(updatedServices));

        if (isFirebaseEnabled) {
          for (const s of updatedServices) {
            if (tieredPricing[s.id]) {
              await dbService.updateDocument("services", s.id, { pricingTiers: tieredPricing[s.id] });
            }
          }
        }
      } catch (err) {
        console.warn("Failed to update services pricingTiers in localStorage:", err);
      }
    }

    if (isFirebaseEnabled) {
      try {
        await dbService.setDocument("settings", "app-settings", settings);
      } catch (err) {
        console.error("Failed to save pricing rates to Firestore:", err);
      }
    }

    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setRates({ ...DEFAULT_PRICING_CONFIG });
    setTieredPricing(JSON.parse(JSON.stringify(DEFAULT_TIERED_SERVICES)));
    setHasChanges(true);
    setSaved(false);
  };

  const getDefaultRate = (key: string) => {
    return DEFAULT_PRICING_CONFIG[key as keyof typeof DEFAULT_PRICING_CONFIG] ?? 0;
  };

  const isModified = (key: string) => {
    return rates[key] !== getDefaultRate(key);
  };

  return (
    <div className="space-y-6 page-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Pricing Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">Edit service rates. Changes affect checkout calculations and the public pricing page.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-40"
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Notification */}
      {hasChanges && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-zinc-400">
            <span className="text-amber-400 font-bold">Unsaved changes.</span> Click "Save Changes" to apply your new rates to all live calculations.
          </p>
        </div>
      )}

      {/* Pricing Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {RATE_GROUPS.map((group) => (
          <div key={group.title} className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-indigo-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">{group.title}</h2>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {group.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition">
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${isModified(item.key) ? "text-indigo-400" : "text-zinc-300"}`}>
                      {item.label}
                      {isModified(item.key) && <span className="ml-1.5 text-[9px] text-indigo-500 font-bold">MODIFIED</span>}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      Default: ₹{getDefaultRate(item.key).toFixed(2)}/{item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={rates[item.key] ?? 0}
                      onChange={(e) => updateRate(item.key, parseFloat(e.target.value) || 0)}
                      className={`w-24 px-3 py-1.5 rounded-lg text-right text-xs font-bold focus:outline-none transition ${
                        isModified(item.key)
                          ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                          : "bg-white/[0.03] border border-white/5 text-zinc-200"
                      }`}
                    />
                    <span className="text-[10px] text-zinc-600 w-14">/{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <hr className="border-white/5 my-8" />

      {/* Tiered Pricing Editor */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-black text-white">Volume-Based Tiered Pricing</h2>
          <p className="text-xs text-zinc-500 mt-1">Edit pricing tiers for specialty sheet prints. Per-sheet rates adjust dynamically based on volume.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(tieredPricing).map((serviceId) => {
            const serviceName = serviceId === "300gsm-print" ? "300 GSM Sheet Printing"
              : serviceId === "gumming-sheet" ? "Gumming Sheet Print"
              : serviceId === "vinyl-sheet" ? "Vinyl Sheet Print"
              : serviceId === "rubber-vinyl-sheet" ? "Rubber Vinyl Sheet Print"
              : serviceId === "transparent-vinyl-sheet" ? "Transparent Vinyl Sheet Print"
              : serviceId === "glossy-photo-sheet" ? "Glossy Photo Sheet Print"
              : serviceId === "half-cut" ? "Half Cut Service"
              : serviceId;

            const supportsDouble = serviceId === "300gsm-print";
            const tiers = tieredPricing[serviceId] || [];

            return (
              <div key={serviceId} className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{serviceName}</h3>
                  </div>
                  <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Tiered
                  </span>
                </div>
                
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-zinc-500 font-bold">
                        <th className="pb-2">Sheet Range</th>
                        <th className="pb-2 text-right">Single Side (₹)</th>
                        {supportsDouble && <th className="pb-2 text-right">Double Side (₹)</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {tiers.map((tier, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01]">
                          <td className="py-2.5 font-medium text-zinc-400">
                            {tier.maxQty === null 
                              ? `${tier.minQty}+ sheets` 
                              : tier.minQty === tier.maxQty 
                                ? `${tier.minQty} sheet` 
                                : `${tier.minQty} - ${tier.maxQty} sheets`}
                          </td>
                          <td className="py-2.5 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={tier.singleSidePrice}
                              onChange={(e) => updateTierPrice(serviceId, idx, "singleSidePrice", parseFloat(e.target.value) || 0)}
                              className="w-24 px-3 py-1.5 rounded-lg text-right text-xs font-bold bg-white/[0.03] border border-white/5 text-zinc-200 focus:outline-none focus:border-indigo-500/30"
                            />
                          </td>
                          {supportsDouble && (
                            <td className="py-2.5 text-right">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={tier.doubleSidePrice ?? 0}
                                onChange={(e) => updateTierPrice(serviceId, idx, "doubleSidePrice", parseFloat(e.target.value) || 0)}
                                className="w-24 px-3 py-1.5 rounded-lg text-right text-xs font-bold bg-white/[0.03] border border-white/5 text-zinc-200 focus:outline-none focus:border-indigo-500/30"
                              />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
