import { PriceBreakdown, SpecificationOptions, OfferRecord } from "@/types";

// Standard base prices (can be modified by Admin in DB / local storage settings)
export const DEFAULT_PRICING_CONFIG = {
  // Printing rates (per page / sq ft)
  "a4-bw": 2,
  "a4-color": 10,
  "a3-bw": 5,
  "a3-color": 20,
  "photo-print": 15,
  "passport-photo": 50, // Per set of 8 photos
  "banner-print": 40,   // Per sq ft

  // Specialty prints base rates
  "300gsm-print": 30,
  "gumming-sheet": 30,
  "vinyl-sheet": 100,
  "rubber-vinyl-sheet": 100,
  "transparent-vinyl-sheet": 100,
  "glossy-photo-sheet": 100,
  "half-cut": 10,

  // Binding & Lamination options
  "binding-spiral": 40,
  "binding-lamination": 20,

  // Document services
  "scanning": 5, // Per page
  "xerox": 1.5,  // Per page
  "resume-creation": 200, // Flat rate

  // Custom Merch base prices (per item)
  "mug-print": 150,
  "magic-mug": 250,
  "tshirt-print": 350,
  "hoodie-print": 750,
  "pillow-print": 200,
  "mousepad-print": 120,
  "keychain-print": 60,
  "mobilecover-print": 180,
  "photoframe-print": 300,
  "cap-print": 120,

  // Corporate business service prices
  "visiting-cards": 1.5,
  "letterheads": 4,
  "brochures": 8,
  "menu-print": 15,
  "invitation-print": 25,
  "calendar-print": 180,
  "corporate-gift": 450,
};

// Default tiered pricing configurations — covers ALL non-merchandise services
export const DEFAULT_TIERED_SERVICES: Record<string, any> = {
  // --- Specialty Sheet Printing ---
  "300gsm-print": [
    { minQty: 1, maxQty: 1, singleSidePrice: 30, doubleSidePrice: 50 },
    { minQty: 2, maxQty: 2, singleSidePrice: 25, doubleSidePrice: 40 },
    { minQty: 3, maxQty: 5, singleSidePrice: 20, doubleSidePrice: 30 },
    { minQty: 6, maxQty: 10, singleSidePrice: 15, doubleSidePrice: 20 },
    { minQty: 11, maxQty: 25, singleSidePrice: 10, doubleSidePrice: 15 },
    { minQty: 26, maxQty: null, singleSidePrice: 8, doubleSidePrice: 12 },
  ],
  "gumming-sheet": [
    { minQty: 1, maxQty: 1, singleSidePrice: 30 },
    { minQty: 2, maxQty: 2, singleSidePrice: 25 },
    { minQty: 3, maxQty: 5, singleSidePrice: 20 },
    { minQty: 6, maxQty: 10, singleSidePrice: 15 },
    { minQty: 11, maxQty: 25, singleSidePrice: 10 },
    { minQty: 26, maxQty: null, singleSidePrice: 8 },
  ],
  "vinyl-sheet": [
    { minQty: 1, maxQty: 1, singleSidePrice: 100 },
    { minQty: 2, maxQty: 2, singleSidePrice: 80 },
    { minQty: 3, maxQty: 5, singleSidePrice: 50 },
    { minQty: 6, maxQty: 10, singleSidePrice: 30 },
    { minQty: 11, maxQty: 25, singleSidePrice: 20 },
    { minQty: 26, maxQty: null, singleSidePrice: 15 },
  ],
  "rubber-vinyl-sheet": [
    { minQty: 1, maxQty: 2, singleSidePrice: 100 },
    { minQty: 3, maxQty: 5, singleSidePrice: 80 },
    { minQty: 6, maxQty: 25, singleSidePrice: 50 },
    { minQty: 26, maxQty: null, singleSidePrice: 40 },
  ],
  "transparent-vinyl-sheet": [
    { minQty: 1, maxQty: 2, singleSidePrice: 100 },
    { minQty: 3, maxQty: 5, singleSidePrice: 80 },
    { minQty: 6, maxQty: 25, singleSidePrice: 50 },
    { minQty: 26, maxQty: null, singleSidePrice: 40 },
  ],
  "glossy-photo-sheet": [
    { minQty: 1, maxQty: 2, singleSidePrice: 100 },
    { minQty: 3, maxQty: 5, singleSidePrice: 80 },
    { minQty: 6, maxQty: 25, singleSidePrice: 50 },
    { minQty: 26, maxQty: null, singleSidePrice: 40 },
  ],
  "half-cut": [
    { minQty: 1, maxQty: 1, singleSidePrice: 10 },
    { minQty: 2, maxQty: 2, singleSidePrice: 8 },
    { minQty: 3, maxQty: 5, singleSidePrice: 5 },
    { minQty: 6, maxQty: 10, singleSidePrice: 3 },
    { minQty: 11, maxQty: 25, singleSidePrice: 2 },
    { minQty: 26, maxQty: null, singleSidePrice: 1 },
  ],

  // --- Document & Standard Printing ---
  "a4-bw": [
    { minQty: 1, maxQty: 10, singleSidePrice: 2, doubleSidePrice: 3 },
    { minQty: 11, maxQty: 50, singleSidePrice: 1.5, doubleSidePrice: 2.5 },
    { minQty: 51, maxQty: 100, singleSidePrice: 1.25, doubleSidePrice: 2 },
    { minQty: 101, maxQty: 250, singleSidePrice: 1, doubleSidePrice: 1.5 },
    { minQty: 251, maxQty: null, singleSidePrice: 0.8, doubleSidePrice: 1.25 },
  ],
  "a4-color": [
    { minQty: 1, maxQty: 10, singleSidePrice: 10, doubleSidePrice: 18 },
    { minQty: 11, maxQty: 50, singleSidePrice: 9, doubleSidePrice: 16 },
    { minQty: 51, maxQty: 100, singleSidePrice: 8, doubleSidePrice: 14 },
    { minQty: 101, maxQty: 250, singleSidePrice: 7, doubleSidePrice: 12 },
    { minQty: 251, maxQty: null, singleSidePrice: 6, doubleSidePrice: 10 },
  ],
  "a3-bw": [
    { minQty: 1, maxQty: 10, singleSidePrice: 5 },
    { minQty: 11, maxQty: 50, singleSidePrice: 4 },
    { minQty: 51, maxQty: 100, singleSidePrice: 3.5 },
    { minQty: 101, maxQty: null, singleSidePrice: 3 },
  ],
  "a3-color": [
    { minQty: 1, maxQty: 10, singleSidePrice: 20 },
    { minQty: 11, maxQty: 50, singleSidePrice: 18 },
    { minQty: 51, maxQty: 100, singleSidePrice: 15 },
    { minQty: 101, maxQty: null, singleSidePrice: 12 },
  ],
  "photo-print": [
    { minQty: 1, maxQty: 5, singleSidePrice: 15 },
    { minQty: 6, maxQty: 20, singleSidePrice: 12 },
    { minQty: 21, maxQty: 50, singleSidePrice: 10 },
    { minQty: 51, maxQty: null, singleSidePrice: 8 },
  ],
  "passport-photo": [
    { minQty: 1, maxQty: 2, singleSidePrice: 50 },
    { minQty: 3, maxQty: 5, singleSidePrice: 45 },
    { minQty: 6, maxQty: null, singleSidePrice: 40 },
  ],
  "banner-print": [
    { minQty: 1, maxQty: 5, singleSidePrice: 40 },
    { minQty: 6, maxQty: 15, singleSidePrice: 35 },
    { minQty: 16, maxQty: 30, singleSidePrice: 30 },
    { minQty: 31, maxQty: null, singleSidePrice: 25 },
  ],

  // --- Bindings & Finishing ---
  "binding-spiral": [
    { minQty: 1, maxQty: 5, singleSidePrice: 40 },
    { minQty: 6, maxQty: 15, singleSidePrice: 35 },
    { minQty: 16, maxQty: 30, singleSidePrice: 30 },
    { minQty: 31, maxQty: null, singleSidePrice: 25 },
  ],
  "binding-lamination": [
    { minQty: 1, maxQty: 10, singleSidePrice: 20 },
    { minQty: 11, maxQty: 30, singleSidePrice: 18 },
    { minQty: 31, maxQty: 100, singleSidePrice: 15 },
    { minQty: 101, maxQty: null, singleSidePrice: 12 },
  ],

  // --- Document Services ---
  "scanning": [
    { minQty: 1, maxQty: 20, singleSidePrice: 5 },
    { minQty: 21, maxQty: 50, singleSidePrice: 4 },
    { minQty: 51, maxQty: 100, singleSidePrice: 3 },
    { minQty: 101, maxQty: null, singleSidePrice: 2.5 },
  ],
  "xerox": [
    { minQty: 1, maxQty: 20, singleSidePrice: 1.5, doubleSidePrice: 2.5 },
    { minQty: 21, maxQty: 100, singleSidePrice: 1.25, doubleSidePrice: 2 },
    { minQty: 101, maxQty: 250, singleSidePrice: 1, doubleSidePrice: 1.75 },
    { minQty: 251, maxQty: null, singleSidePrice: 0.75, doubleSidePrice: 1.5 },
  ],
  "resume-creation": [
    { minQty: 1, maxQty: 1, singleSidePrice: 200 },
    { minQty: 2, maxQty: 3, singleSidePrice: 180 },
    { minQty: 4, maxQty: null, singleSidePrice: 150 },
  ],

  // --- Corporate & Business Printing ---
  "visiting-cards": [
    { minQty: 1, maxQty: 50, singleSidePrice: 3, doubleSidePrice: 4.5 },
    { minQty: 51, maxQty: 100, singleSidePrice: 2.5, doubleSidePrice: 4 },
    { minQty: 101, maxQty: 250, singleSidePrice: 2, doubleSidePrice: 3.5 },
    { minQty: 251, maxQty: 500, singleSidePrice: 1.75, doubleSidePrice: 3 },
    { minQty: 501, maxQty: null, singleSidePrice: 1.5, doubleSidePrice: 2.5 },
  ],
  "letterheads": [
    { minQty: 1, maxQty: 50, singleSidePrice: 4 },
    { minQty: 51, maxQty: 100, singleSidePrice: 3.5 },
    { minQty: 101, maxQty: 250, singleSidePrice: 3 },
    { minQty: 251, maxQty: null, singleSidePrice: 2.5 },
  ],
  "brochures": [
    { minQty: 1, maxQty: 50, singleSidePrice: 8, doubleSidePrice: 14 },
    { minQty: 51, maxQty: 100, singleSidePrice: 7, doubleSidePrice: 12 },
    { minQty: 101, maxQty: 250, singleSidePrice: 6, doubleSidePrice: 10 },
    { minQty: 251, maxQty: null, singleSidePrice: 5, doubleSidePrice: 8 },
  ],
  "menu-print": [
    { minQty: 1, maxQty: 10, singleSidePrice: 15 },
    { minQty: 11, maxQty: 25, singleSidePrice: 13 },
    { minQty: 26, maxQty: 50, singleSidePrice: 11 },
    { minQty: 51, maxQty: null, singleSidePrice: 9 },
  ],
  "invitation-print": [
    { minQty: 1, maxQty: 25, singleSidePrice: 25 },
    { minQty: 26, maxQty: 50, singleSidePrice: 22 },
    { minQty: 51, maxQty: 100, singleSidePrice: 19 },
    { minQty: 101, maxQty: null, singleSidePrice: 16 },
  ],
  "calendar-print": [
    { minQty: 1, maxQty: 5, singleSidePrice: 180 },
    { minQty: 6, maxQty: 15, singleSidePrice: 160 },
    { minQty: 16, maxQty: 30, singleSidePrice: 140 },
    { minQty: 31, maxQty: null, singleSidePrice: 120 },
  ],
  "corporate-gift": [
    { minQty: 1, maxQty: 5, singleSidePrice: 450 },
    { minQty: 6, maxQty: 15, singleSidePrice: 400 },
    { minQty: 16, maxQty: 30, singleSidePrice: 350 },
    { minQty: 31, maxQty: null, singleSidePrice: 300 },
  ],

  // --- Lamination (by paper size) ---
  "lamination-a4": [
    { minQty: 1, maxQty: 10, singleSidePrice: 10 },
    { minQty: 11, maxQty: 30, singleSidePrice: 8 },
    { minQty: 31, maxQty: 100, singleSidePrice: 7 },
    { minQty: 101, maxQty: null, singleSidePrice: 6 },
  ],
  "lamination-small": [
    { minQty: 1, maxQty: 10, singleSidePrice: 7 },
    { minQty: 11, maxQty: 30, singleSidePrice: 6 },
    { minQty: 31, maxQty: 100, singleSidePrice: 5 },
    { minQty: 101, maxQty: null, singleSidePrice: 4 },
  ],
  "lamination-a3": [
    { minQty: 1, maxQty: 10, singleSidePrice: 18 },
    { minQty: 11, maxQty: 30, singleSidePrice: 15 },
    { minQty: 31, maxQty: 100, singleSidePrice: 12 },
    { minQty: 101, maxQty: null, singleSidePrice: 10 },
  ],

  // --- Finishing Services ---
  "comb-binding": [
    { minQty: 1, maxQty: 5, singleSidePrice: 35 },
    { minQty: 6, maxQty: 15, singleSidePrice: 30 },
    { minQty: 16, maxQty: 30, singleSidePrice: 25 },
    { minQty: 31, maxQty: null, singleSidePrice: 20 },
  ],
  "stapling": [
    { minQty: 1, maxQty: 10, singleSidePrice: 5 },
    { minQty: 11, maxQty: 30, singleSidePrice: 4 },
    { minQty: 31, maxQty: 100, singleSidePrice: 3 },
    { minQty: 101, maxQty: null, singleSidePrice: 2 },
  ],
  "file-punching": [
    { minQty: 1, maxQty: 10, singleSidePrice: 3 },
    { minQty: 11, maxQty: 30, singleSidePrice: 2.5 },
    { minQty: 31, maxQty: 100, singleSidePrice: 2 },
    { minQty: 101, maxQty: null, singleSidePrice: 1.5 },
  ],
};

// Retrieve service tiers synchronously
export function getServiceTiers(serviceId: string, useStoredData = true): any[] | null {
  if (useStoredData && typeof window !== "undefined") {
    // Try to get from services collection in localStorage
    const storedServicesRaw = localStorage.getItem("printhub_db_services");
    if (storedServicesRaw) {
      try {
        const services = JSON.parse(storedServicesRaw);
        const match = services.find((s: any) => s.id === serviceId);
        if (match && match.pricingTiers) {
          return match.pricingTiers;
        }
      } catch {}
    }
    // Also try to get from settings.tieredPricing
    const adminSettings = localStorage.getItem("printhub_db_settings");
    if (adminSettings) {
      try {
        const parsed = JSON.parse(adminSettings);
        if (parsed.tieredPricing && parsed.tieredPricing[serviceId]) {
          return parsed.tieredPricing[serviceId];
        }
      } catch {}
    }
  }
  return DEFAULT_TIERED_SERVICES[serviceId] || null;
}

// Retrieve tiered unit price
export function getTieredPrice(
  serviceId: string,
  qty: number,
  sides: "single" | "double",
  useStoredData = true
): number {
  const tiers = getServiceTiers(serviceId, useStoredData);
  if (!tiers || tiers.length === 0) return 0;

  const match = tiers.find((t: any) => {
    const minOk = qty >= t.minQty;
    const maxOk = t.maxQty === null || t.maxQty === undefined || qty <= t.maxQty;
    return minOk && maxOk;
  });

  if (match) {
    if (sides === "double" && match.doubleSidePrice !== undefined) {
      return match.doubleSidePrice;
    }
    return match.singleSidePrice;
  }

  // Fallback to last tier
  const lastTier = tiers[tiers.length - 1];
  if (sides === "double" && lastTier.doubleSidePrice !== undefined) {
    return lastTier.doubleSidePrice;
  }
  return lastTier.singleSidePrice;
}

// Retrieve admin-configured rates (merged with defaults)
export function getAdminRates(useStoredData = true): typeof DEFAULT_PRICING_CONFIG {
  let rates = { ...DEFAULT_PRICING_CONFIG };
  if (useStoredData && typeof window !== "undefined") {
    const adminSettings = localStorage.getItem("printhub_db_settings");
    if (adminSettings) {
      try {
        const parsed = JSON.parse(adminSettings);
        if (parsed.rates) {
          rates = { ...rates, ...parsed.rates };
        }
      } catch (err) {
        console.warn("Failed to parse settings rates:", err);
      }
    }
  }
  return rates;
}

// Get all currently active offers
export function getActiveOffers(useStoredData = true): OfferRecord[] {
  if (!useStoredData || typeof window === "undefined") return [];
  const raw = localStorage.getItem("printhub_db_offers");
  if (!raw) return [];
  try {
    const offers: OfferRecord[] = JSON.parse(raw);
    const now = new Date();
    return offers.filter(o => {
      if (!o.isActive) return false;
      const start = new Date(o.startDate);
      const end = new Date(o.endDate);
      return now >= start && now <= end;
    });
  } catch {
    return [];
  }
}

// Find the best offer applicable for a given serviceId
export function getBestOfferForService(serviceId: string, useStoredData = true): OfferRecord | null {
  const offers = getActiveOffers(useStoredData);
  const applicable = offers.filter(o =>
    o.applicableServiceIds.length === 0 || o.applicableServiceIds.includes(serviceId)
  );
  if (applicable.length === 0) return null;
  // Return highest discount value (simplified: compare raw discountValue)
  return applicable.reduce((best, curr) => {
    if (curr.discountType === "percentage" && best.discountType === "percentage") {
      return curr.discountValue > best.discountValue ? curr : best;
    }
    if (curr.discountType === "flat" && best.discountType === "flat") {
      return curr.discountValue > best.discountValue ? curr : best;
    }
    // Mix: percentage often better, keep percentage
    if (curr.discountType === "percentage") return curr;
    return best;
  });
}

export function calculatePricing(
  serviceId: string,
  quantity: number,
  specs: SpecificationOptions,
  useStoredData = true,
  appliedCoupon?: OfferRecord | null
): PriceBreakdown {
  // 1. Fetch current config from localStorage if available (Admin pricing overrides)
  const rates = getAdminRates(useStoredData);

  let basePrice = rates[serviceId as keyof typeof rates] || 0;
  let optionsPrice = 0;
  let subtotal = 0;
  const qty = Math.max(1, quantity);

  // Merchandise service IDs — these always use flat basePrice
  const MERCH_IDS = [
    "mug-print", "magic-mug", "tshirt-print", "hoodie-print", "pillow-print",
    "cap-print", "keychain-print", "mobilecover-print", "photoframe-print", "mousepad-print"
  ];

  // 2. Calculations based on service category
  if (MERCH_IDS.includes(serviceId)) {
    // A. Custom Merchandise — flat basePrice per item
    const merchBase = basePrice;
    if (specs.size === "XL" || specs.size === "XXL") {
      optionsPrice += 50;
    } else if (specs.size === "12x18") {
      optionsPrice += 100;
    } else if (specs.size === "18x24") {
      optionsPrice += 250;
    }
    subtotal = (merchBase + optionsPrice) * qty;
  } else {
    // B. All non-merch services — use tiered pricing if tiers exist, else basePrice
    const tiers = getServiceTiers(serviceId, useStoredData);
    const pages = specs.pages || 1;
    const copies = specs.copies || 1;
    const totalSheets = pages * copies;

    let ratePerUnit: number;
    if (tiers && tiers.length > 0) {
      ratePerUnit = getTieredPrice(serviceId, totalSheets, specs.sides || "single", useStoredData);
      basePrice = ratePerUnit;
    } else {
      ratePerUnit = basePrice;
    }

    // Add binding/lamination add-ons when selected as an option on a print job
    if (specs.binding === "spiral") {
      const bindingTiers = getServiceTiers("binding-spiral", useStoredData);
      optionsPrice += bindingTiers
        ? getTieredPrice("binding-spiral", copies * qty, "single", useStoredData)
        : (rates["binding-spiral"] || 0);
    }
    if (specs.binding === "lamination") {
      const lamTiers = getServiceTiers("binding-lamination", useStoredData);
      optionsPrice += lamTiers
        ? getTieredPrice("binding-lamination", copies * qty, "single", useStoredData)
        : (rates["binding-lamination"] || 0);
    }

    subtotal = (ratePerUnit * pages + optionsPrice) * copies * qty;
  }

  // 3. Apply coupon-based discount if available
  let discount = 0;
  if (appliedCoupon) {
    const isApplicable = appliedCoupon.applicableServiceIds.length === 0 || appliedCoupon.applicableServiceIds.includes(serviceId);
    if (isApplicable) {
      if (appliedCoupon.discountType === "percentage") {
        discount = Math.round(subtotal * (appliedCoupon.discountValue / 100) * 100) / 100;
      } else {
        discount = Math.min(appliedCoupon.discountValue, subtotal);
      }
      if (appliedCoupon.minOrderValue && subtotal < appliedCoupon.minOrderValue) {
        discount = 0; // min order value not met
      }
      subtotal = Math.max(0, subtotal - discount);
    }
  }

  // 4. GST Tax Calculation (configurable tax rate, default 18%)
  let gstRate = 0.18;
  if (useStoredData && typeof window !== "undefined") {
    const adminSettings = localStorage.getItem("printhub_db_settings");
    if (adminSettings) {
      try {
        const parsed = JSON.parse(adminSettings);
        if (parsed.taxRate != null) {
          gstRate = parsed.taxRate / 100;
        }
      } catch {}
    }
  }
  const gst = Math.round(subtotal * gstRate * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;

  return {
    base: basePrice,
    optionsPrice,
    subtotal,
    gst,
    total,
  };
}

// ── Printster-Style Advanced Price Calculator Engine ─────────────────────────

export interface PaperGsmItem {
  gsm: number;
  name: string;
  desc: string;
  multiplier: number; // cost multiplier relative to 70 GSM
  caliperMm: number; // sheet thickness per leaf in mm
  bestFor: string;
}

export const PRINTSTER_PAPER_GSM: PaperGsmItem[] = [
  { gsm: 70, name: "70 GSM Standard Copier", desc: "Economical multipurpose paper, perfect for study notes & daily docs", multiplier: 1.0, caliperMm: 0.088, bestFor: "Study Notes, Worksheets" },
  { gsm: 75, name: "75 GSM Premium Copier", desc: "Crisp white, high-contrast laser paper for professional reading", multiplier: 1.15, caliperMm: 0.095, bestFor: "Office Reports, Manuals" },
  { gsm: 85, name: "85 GSM Executive Bond", desc: "Smooth heavy bond paper, excellent opacity for double-sided prints", multiplier: 1.35, caliperMm: 0.110, bestFor: "Thesis, Legal & Formal Letters" },
  { gsm: 100, name: "100 GSM Super Smooth", desc: "Ultra-bright premium presentation paper for high-impact graphics", multiplier: 1.60, caliperMm: 0.125, bestFor: "Client Proposals, Portfolios" },
  { gsm: 130, name: "130 GSM Gloss Art Paper", desc: "Silky gloss coating for rich photo contrast and vibrant magazines", multiplier: 2.10, caliperMm: 0.135, bestFor: "Flyers, Magazines, Photo Pages" },
  { gsm: 170, name: "170 GSM Matte Art Paper", desc: "Non-glare luxury finish, sturdy for catalog booklets and brochures", multiplier: 2.60, caliperMm: 0.170, bestFor: "Art Catalogs, Booklets" },
  { gsm: 250, name: "250 GSM Heavy Cardstock", desc: "Durable cardstock for certificates, book divider tabs & greeting cards", multiplier: 3.50, caliperMm: 0.250, bestFor: "Certificates, Menu Inserts" },
  { gsm: 300, name: "300 GSM Velvet Card", desc: "Ultra-thick premium ivory board for business cards and book covers", multiplier: 4.20, caliperMm: 0.320, bestFor: "Book Covers, Business Cards" },
  { gsm: 350, name: "350 GSM Royal Velvet", desc: "Supreme rigid board with rich tactile touch for high-end corporate stationery", multiplier: 5.00, caliperMm: 0.380, bestFor: "Luxury Cards, Premium Covers" },
];

export interface PrintsterBindingItem {
  id: string;
  name: string;
  desc: string;
  basePrice: number;
  maxPages: number;
  coverIncluded: boolean;
  extraSpineMm: number;
}

export const PRINTSTER_BINDINGS: PrintsterBindingItem[] = [
  { id: "none", name: "No Binding / Loose Sheets", desc: "Neatly stacked and shrink-wrapped loose printed leaves", basePrice: 0, maxPages: 2500, coverIncluded: false, extraSpineMm: 0 },
  { id: "staple_corner", name: "Corner Staple", desc: "Single top-left heavy gauge steel staple", basePrice: 5, maxPages: 80, coverIncluded: false, extraSpineMm: 0 },
  { id: "staple_side", name: "Double Side Staple", desc: "Dual edge staples along left margin with binding tape finish", basePrice: 15, maxPages: 120, coverIncluded: false, extraSpineMm: 0 },
  { id: "staple_booklet", name: "Center Staple Booklet", desc: "Folded & saddle-stitched center staple booklet format", basePrice: 20, maxPages: 64, coverIncluded: false, extraSpineMm: 0 },
  { id: "spiral_plastic", name: "Plastic Coil Spiral Binding", desc: "360° lay-flat plastic spiral coil with clear PVC front + dark back cover", basePrice: 35, maxPages: 500, coverIncluded: true, extraSpineMm: 0.5 },
  { id: "wiro_metal", name: "Twin-Loop Metal Wiro", desc: "Executive twin-loop wire binding with frosted crystal covers", basePrice: 50, maxPages: 300, coverIncluded: true, extraSpineMm: 0.6 },
  { id: "softcover_perfect", name: "Softcover Perfect Binding", desc: "Glued spine book with 300 GSM full-color wrap-around cover", basePrice: 80, maxPages: 800, coverIncluded: true, extraSpineMm: 1.2 },
  { id: "hardcover_gold", name: "Thesis Hardcover (Golden Foil)", desc: "Formal rigid leatherette hardbound book with custom gold foil letter embossing", basePrice: 250, maxPages: 1000, coverIncluded: true, extraSpineMm: 4.5 },
  { id: "thermal_lamination", name: "All-Page Thermal Lamination", desc: "125-micron water-resistant thermal protective encapsulation on all sheets", basePrice: 15, maxPages: 50, coverIncluded: false, extraSpineMm: 0.2 },
];

export interface PrintsterCoverItem {
  id: string;
  name: string;
  price: number;
}

export const PRINTSTER_COVERS: PrintsterCoverItem[] = [
  { id: "none", name: "No Extra Cover", price: 0 },
  { id: "pvc_transparent", name: "Transparent PVC Front + Opaque Back (₹20)", price: 20 },
  { id: "300gsm_card", name: "300 GSM Full Color Card Cover (₹35)", price: 35 },
  { id: "gloss_laminated", name: "300 GSM Gloss Laminated Custom Cover (₹50)", price: 50 },
  { id: "matte_laminated", name: "300 GSM Velvet Matte Laminated Cover (₹55)", price: 55 },
  { id: "hardcover_embossed", name: "Premium Hardboard Cover with Gold Lettering (₹250)", price: 250 },
];

export interface DetailedQuoteResult {
  pages: number;
  copies: number;
  paperSize: string;
  paperGsm: number;
  colorMode: string;
  sides: string;
  bindingType: string;
  coverType: string;
  sheetsPerCopy: number;
  totalSheets: number;
  spineWidthMm: number;
  printCostPerCopy: number;
  paperCostPerCopy: number;
  bindingCostPerCopy: number;
  coverCostPerCopy: number;
  costPerCopy: number;
  grossSubtotal: number;
  bulkDiscountPercent: number;
  discountAmount: number;
  netSubtotal: number;
  gstRatePercent: number;
  gstAmount: number;
  totalAmount: number;
  effectivePricePerPage: number;
}

/**
 * Calculates a complete Printster-style detailed printing and book-binding quote.
 */
export function calculateDetailedPrintingQuote(options: {
  pages: number;
  copies: number;
  paperSize?: 'A4' | 'A3' | 'A5' | 'B5';
  paperGsm?: number;
  colorMode?: 'bw' | 'color' | 'partial';
  sides?: 'single' | 'double';
  bindingType?: string;
  coverType?: string;
}): DetailedQuoteResult {
  const pages = Math.max(1, options.pages || 1);
  const copies = Math.max(1, options.copies || 1);
  const paperSize = options.paperSize || 'A4';
  const paperGsm = options.paperGsm || 70;
  const colorMode = options.colorMode || 'bw';
  const sides = options.sides || 'single';
  const bindingType = options.bindingType || 'none';
  const coverType = options.coverType || 'none';

  // 1. Sheets computation
  const sheetsPerCopy = sides === 'double' ? Math.ceil(pages / 2) : pages;
  const totalSheets = sheetsPerCopy * copies;

  // 2. Paper GSM & Caliper selection
  const gsmItem = PRINTSTER_PAPER_GSM.find((g) => g.gsm === paperGsm) || PRINTSTER_PAPER_GSM[0];
  const bindingItem = PRINTSTER_BINDINGS.find((b) => b.id === bindingType) || PRINTSTER_BINDINGS[0];
  const coverItem = PRINTSTER_COVERS.find((c) => c.id === coverType) || PRINTSTER_COVERS[0];

  // 3. Spine Width in mm (Printster spine width calculator algorithm)
  const rawPaperSpine = sheetsPerCopy * gsmItem.caliperMm;
  const calculatedSpine = Math.round((rawPaperSpine + (bindingItem.extraSpineMm || 0)) * 10) / 10;
  const spineWidthMm = Math.max(0.5, calculatedSpine);

  // 4. Base Print Rate per page
  let basePrintRatePerPage = 1.20; // base B&W A4
  if (paperSize === 'A3') basePrintRatePerPage *= 2.0;
  if (paperSize === 'A5') basePrintRatePerPage *= 0.75;
  if (paperSize === 'B5') basePrintRatePerPage *= 0.85;

  if (colorMode === 'color') {
    basePrintRatePerPage = paperSize === 'A3' ? 18.0 : paperSize === 'A5' ? 6.0 : 8.5;
  } else if (colorMode === 'partial') {
    basePrintRatePerPage = paperSize === 'A3' ? 10.0 : paperSize === 'A5' ? 3.5 : 5.0;
  }

  // Double side discount per impression
  const printCostPerCopy = sides === 'double'
    ? pages * (basePrintRatePerPage * 0.9)
    : pages * basePrintRatePerPage;

  // 5. Paper Material Cost per sheet
  let baseSheetCost = 0.50 * gsmItem.multiplier;
  if (paperSize === 'A3') baseSheetCost *= 2.1;
  if (paperSize === 'A5') baseSheetCost *= 0.6;
  if (paperSize === 'B5') baseSheetCost *= 0.75;
  const paperCostPerCopy = sheetsPerCopy * baseSheetCost;

  // 6. Binding Cost per copy
  let bindingCostPerCopy = bindingItem.basePrice;
  if (bindingType === 'thermal_lamination') {
    bindingCostPerCopy = sheetsPerCopy * (paperSize === 'A3' ? 25 : 12);
  }

  // 7. Cover Cost per copy
  const coverCostPerCopy = coverItem.price;

  // 8. Cost per copy & Gross Subtotal
  const costPerCopy = Math.round((printCostPerCopy + paperCostPerCopy + bindingCostPerCopy + coverCostPerCopy) * 100) / 100;
  const grossSubtotal = Math.round(costPerCopy * copies * 100) / 100;

  // 9. Tiered Volume Discount (Printster-style volume discounts)
  let bulkDiscountPercent = 0;
  if (copies >= 500 || totalSheets >= 5000) {
    bulkDiscountPercent = 35;
  } else if (copies >= 250 || totalSheets >= 2500) {
    bulkDiscountPercent = 25;
  } else if (copies >= 100 || totalSheets >= 1000) {
    bulkDiscountPercent = 20;
  } else if (copies >= 50 || totalSheets >= 500) {
    bulkDiscountPercent = 15;
  } else if (copies >= 25 || totalSheets >= 250) {
    bulkDiscountPercent = 10;
  } else if (copies >= 10 || totalSheets >= 100) {
    bulkDiscountPercent = 5;
  }

  const discountAmount = Math.round((grossSubtotal * (bulkDiscountPercent / 100)) * 100) / 100;
  const netSubtotal = Math.round((grossSubtotal - discountAmount) * 100) / 100;

  // 10. GST (18% standard across printing and stationery services)
  const gstRatePercent = 18;
  const gstAmount = Math.round((netSubtotal * (gstRatePercent / 100)) * 100) / 100;
  const totalAmount = Math.round((netSubtotal + gstAmount) * 100) / 100;

  const effectivePricePerPage = Math.round((totalAmount / (pages * copies)) * 100) / 100;

  return {
    pages,
    copies,
    paperSize,
    paperGsm,
    colorMode,
    sides,
    bindingType,
    coverType,
    sheetsPerCopy,
    totalSheets,
    spineWidthMm,
    printCostPerCopy,
    paperCostPerCopy,
    bindingCostPerCopy,
    coverCostPerCopy,
    costPerCopy,
    grossSubtotal,
    bulkDiscountPercent,
    discountAmount,
    netSubtotal,
    gstRatePercent,
    gstAmount,
    totalAmount,
    effectivePricePerPage,
  };
}

// ── Async Firestore loaders ─────────────────────────────────────────────────
export async function loadPricingFromFirestore(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { isFirebaseEnabled: fbe, dbService: db } = await import("@/lib/firebase");
    if (!fbe) return;
    const snap = await db.getDocument<Record<string, any>>("settings", "app-settings");
    if (!snap) return;

    // Merge into localStorage settings
    const raw = localStorage.getItem("printhub_db_settings");
    let existing: any = {};
    try { if (raw) existing = JSON.parse(raw); } catch {}

    const merged = { ...existing, ...snap };
    localStorage.setItem("printhub_db_settings", JSON.stringify(merged));
  } catch (err) {
    console.warn("[pricing] loadPricingFromFirestore failed:", err);
  }
}

export async function loadOffersFromFirestore(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { isFirebaseEnabled: fbe, dbService: db } = await import("@/lib/firebase");
    if (!fbe) return;
    const offers = await db.getCollection<OfferRecord>("offers");
    localStorage.setItem("printhub_db_offers", JSON.stringify(offers));
  } catch (err) {
    console.warn("[pricing] loadOffersFromFirestore failed:", err);
  }
}
