"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_TIERED_SERVICES } from "@/lib/pricing";
import { dbService, isFirebaseEnabled } from "@/lib/firebase";
import {
  Save, RotateCcw, Check, AlertTriangle, TrendingDown,
  ChevronDown, ChevronRight, Layers,
} from "lucide-react";

// ── Service groups (merchandise excluded — managed separately) ─────────────
const TIERED_GROUPS: {
  title: string;
  emoji: string;
  color: string;
  services: { id: string; label: string; unit: string; supportsDouble?: boolean }[];
}[] = [
  {
    title: "Document & Standard Printing",
    emoji: "🖨️",
    color: "sky",
    services: [
      { id: "a4-bw",          label: "A4 Black & White",     unit: "page",    supportsDouble: true },
      { id: "a4-color",       label: "A4 Full Colour",       unit: "page",    supportsDouble: true },
      { id: "a3-bw",          label: "A3 Black & White",     unit: "page" },
      { id: "a3-color",       label: "A3 Full Colour",       unit: "page" },
      { id: "photo-print",    label: "Photo Print",          unit: "print" },
      { id: "passport-photo", label: "Passport Photo Set",   unit: "set" },
      { id: "banner-print",   label: "Flex / Banner Print",  unit: "sq ft" },
    ],
  },
  {
    title: "Specialty Sheet Printing",
    emoji: "📋",
    color: "indigo",
    services: [
      { id: "300gsm-print",            label: "300 GSM Sheet",            unit: "sheet", supportsDouble: true },
      { id: "gumming-sheet",           label: "Gumming Sheet",            unit: "sheet" },
      { id: "vinyl-sheet",             label: "Vinyl Sheet",              unit: "sheet" },
      { id: "rubber-vinyl-sheet",      label: "Rubber Vinyl Sheet",       unit: "sheet" },
      { id: "transparent-vinyl-sheet", label: "Transparent Vinyl Sheet",  unit: "sheet" },
      { id: "glossy-photo-sheet",      label: "Glossy Photo Sheet",       unit: "sheet" },
      { id: "half-cut",                label: "Half Cut Service",         unit: "sheet" },
    ],
  },
  {
    title: "Lamination & Finishing",
    emoji: "📎",
    color: "emerald",
    services: [
      { id: "lamination-a4",    label: "A4 Lamination",       unit: "sheet" },
      { id: "lamination-small", label: "Small Size Lamination", unit: "sheet" },
      { id: "lamination-a3",    label: "A3 Lamination",       unit: "sheet" },
      { id: "binding-spiral",   label: "Spiral Binding",      unit: "book" },
      { id: "comb-binding",     label: "Comb Binding",        unit: "book" },
      { id: "stapling",         label: "Stapling",            unit: "doc" },
      { id: "file-punching",    label: "File Punching",       unit: "doc" },
    ],
  },
  {
    title: "Document Services",
    emoji: "📄",
    color: "amber",
    services: [
      { id: "scanning",        label: "Document Scanning",  unit: "page" },
      { id: "xerox",           label: "Xerox / Photocopy",  unit: "page", supportsDouble: true },
      { id: "resume-creation", label: "Resume Writing",     unit: "resume" },
    ],
  },
  {
    title: "Corporate & Business Printing",
    emoji: "🏢",
    color: "violet",
    services: [
      { id: "visiting-cards",  label: "Visiting Cards",    unit: "card",     supportsDouble: true },
      { id: "letterheads",     label: "Letterheads",       unit: "sheet" },
      { id: "brochures",       label: "Flyers / Brochures", unit: "sheet",   supportsDouble: true },
      { id: "menu-print",      label: "Menu Card",         unit: "copy" },
      { id: "invitation-print",label: "Invitation Card",   unit: "card" },
      { id: "calendar-print",  label: "Calendar",          unit: "calendar" },
      { id: "corporate-gift",  label: "Gift Combo Set",    unit: "set" },
    ],
  },
];

const COLOR_STYLES: Record<string, { badge: string; dot: string; header: string }> = {
  sky:     { badge: "bg-sky-500/10 text-sky-400",         dot: "bg-sky-400",     header: "border-sky-500/10" },
  indigo:  { badge: "bg-indigo-500/10 text-indigo-400",   dot: "bg-indigo-400",  header: "border-indigo-500/10" },
  emerald: { badge: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400", header: "border-emerald-500/10" },
  amber:   { badge: "bg-amber-500/10 text-amber-400",     dot: "bg-amber-400",   header: "border-amber-500/10" },
  violet:  { badge: "bg-violet-500/10 text-violet-400",   dot: "bg-violet-400",  header: "border-violet-500/10" },
};

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminPricingPage() {
  const [tieredPricing, setTieredPricing] = useState<Record<string, any[]>>({});
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(TIERED_GROUPS.map((g) => g.title))
  );
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load tiers from localStorage (admin overrides) or fall back to defaults
  useEffect(() => {
    const loaded: Record<string, any[]> = {};
    let stored: any = {};
    try {
      const raw = localStorage.getItem("printhub_db_settings");
      if (raw) stored = JSON.parse(raw);
    } catch {}

    Object.keys(DEFAULT_TIERED_SERVICES).forEach((id) => {
      loaded[id] = stored.tieredPricing?.[id]
        ? stored.tieredPricing[id]
        : JSON.parse(JSON.stringify(DEFAULT_TIERED_SERVICES[id]));
    });
    setTieredPricing(loaded);
  }, []);

  const updateTierPrice = (
    serviceId: string,
    idx: number,
    field: "singleSidePrice" | "doubleSidePrice",
    value: number
  ) => {
    setTieredPricing((prev) => {
      const copy = { ...prev };
      const tiers = [...(copy[serviceId] || [])];
      tiers[idx] = { ...tiers[idx], [field]: value };
      copy[serviceId] = tiers;
      return copy;
    });
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    let settings: any = {};
    try {
      const raw = localStorage.getItem("printhub_db_settings");
      if (raw) settings = JSON.parse(raw);
    } catch {}
    settings.tieredPricing = tieredPricing;
    localStorage.setItem("printhub_db_settings", JSON.stringify(settings));

    // Propagate to cached services list
    try {
      const raw = localStorage.getItem("printhub_db_services");
      if (raw) {
        const services = JSON.parse(raw);
        const updated = services.map((s: any) =>
          tieredPricing[s.id] ? { ...s, pricingTiers: tieredPricing[s.id] } : s
        );
        localStorage.setItem("printhub_db_services", JSON.stringify(updated));
        if (isFirebaseEnabled) {
          for (const s of updated) {
            if (tieredPricing[s.id]) {
              await dbService.updateDocument("services", s.id, {
                pricingTiers: tieredPricing[s.id],
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("Failed to sync tieredPricing to services:", err);
    }

    if (isFirebaseEnabled) {
      try {
        await dbService.setDocument("settings", "app-settings", settings);
      } catch (err) {
        console.error("Firestore save failed:", err);
      }
    }

    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setTieredPricing(JSON.parse(JSON.stringify(DEFAULT_TIERED_SERVICES)));
    setHasChanges(true);
    setSaved(false);
  };

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  const fmtRange = (tier: any, unit: string) => {
    const suffix = tier.maxQty !== null && tier.minQty !== tier.maxQty ? `${unit}s` : unit;
    if (tier.maxQty === null || tier.maxQty === undefined) return `${tier.minQty}+ ${suffix}`;
    if (tier.minQty === tier.maxQty) return `${tier.minQty} ${suffix}`;
    return `${tier.minQty} – ${tier.maxQty} ${suffix}`;
  };

  return (
    <div className="space-y-6 page-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Pricing Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Volume-based tiered rates for all services — prices decrease automatically as quantity increases.
          </p>
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

      {/* ── Info banner ── */}
      <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/10 px-4 py-3 flex items-start gap-3">
        <TrendingDown className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-400 leading-relaxed">
          <span className="text-indigo-400 font-bold">Volume Pricing Active.</span>{" "}
          Every service uses tiered rates — the per-unit price drops as quantity increases. Edit any cell below and click Save to apply changes live.
        </p>
      </div>

      {/* ── Unsaved warning ── */}
      {hasChanges && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-zinc-400">
            <span className="text-amber-400 font-bold">Unsaved changes.</span>{" "}
            Click "Save Changes" to apply your updated rates to all live calculations.
          </p>
        </div>
      )}

      {/* ── Groups ── */}
      <div className="space-y-4">
        {TIERED_GROUPS.map((group) => {
          const c = COLOR_STYLES[group.color];
          const isOpen = openGroups.has(group.title);

          return (
            <div
              key={group.title}
              className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden"
            >
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{group.emoji}</span>
                  <h2 className="text-sm font-bold text-white">{group.title}</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${c.badge}`}>
                    {group.services.length} services
                  </span>
                </div>
                {isOpen
                  ? <ChevronDown className="h-4 w-4 text-zinc-500" />
                  : <ChevronRight className="h-4 w-4 text-zinc-500" />}
              </button>

              {/* Service tier tables */}
              {isOpen && (
                <div className="border-t border-white/5 divide-y divide-white/[0.03]">
                  {group.services.map((svc) => {
                    const tiers = tieredPricing[svc.id] || [];
                    return (
                      <div key={svc.id} className="px-5 py-4">
                        {/* Service label */}
                        <div className="flex items-center gap-2 mb-3">
                          <Layers className="h-3.5 w-3.5 text-zinc-600" />
                          <span className="text-xs font-bold text-zinc-300">{svc.label}</span>
                          <span className="text-[10px] text-zinc-600">per {svc.unit}</span>
                          <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded ${c.badge}`}>
                            {tiers.length} tiers
                          </span>
                        </div>

                        {/* Tier table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="text-zinc-500 font-bold">
                                <th className="pb-2 text-left pr-6 whitespace-nowrap">Qty Range</th>
                                <th className="pb-2 text-right pr-3 whitespace-nowrap">Single Side (₹)</th>
                                {svc.supportsDouble && (
                                  <th className="pb-2 text-right whitespace-nowrap">Double Side (₹)</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                              {tiers.map((tier, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.01]">
                                  <td className="py-2 pr-6 text-zinc-500 whitespace-nowrap font-medium">
                                    {fmtRange(tier, svc.unit)}
                                  </td>
                                  <td className="py-2 pr-3 text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={tier.singleSidePrice}
                                      onChange={(e) =>
                                        updateTierPrice(svc.id, idx, "singleSidePrice", parseFloat(e.target.value) || 0)
                                      }
                                      className="w-24 px-3 py-1.5 rounded-lg text-right text-xs font-bold bg-white/[0.03] border border-white/5 text-zinc-200 focus:outline-none focus:border-indigo-500/30 transition"
                                    />
                                  </td>
                                  {svc.supportsDouble && (
                                    <td className="py-2 text-right">
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={tier.doubleSidePrice ?? ""}
                                        placeholder="—"
                                        onChange={(e) =>
                                          updateTierPrice(svc.id, idx, "doubleSidePrice", parseFloat(e.target.value) || 0)
                                        }
                                        className="w-24 px-3 py-1.5 rounded-lg text-right text-xs font-bold bg-white/[0.03] border border-white/5 text-zinc-200 focus:outline-none focus:border-indigo-500/30 transition placeholder:text-zinc-700"
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
              )}
            </div>
          );
        })}
      </div>

      {/* ── Merchandise note ── */}
      <div className="rounded-xl bg-white/[0.02] border border-white/5 px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-base">
          🛍️
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-300">Custom Merchandise Pricing</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            Mugs, T-shirts, hoodies, etc. use flat per-item pricing.{" "}
            <a href="/admin/merchandise" className="text-purple-400 hover:underline">
              Manage in the Merchandise Manager →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
