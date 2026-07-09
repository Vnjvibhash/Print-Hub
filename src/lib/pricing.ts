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
  useStoredData = true
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
    let merchBase = basePrice;
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

  // 3. Apply best offer/discount if available
  const offer = getBestOfferForService(serviceId, useStoredData);
  let discount = 0;
  if (offer) {
    if (offer.discountType === "percentage") {
      discount = Math.round(subtotal * (offer.discountValue / 100) * 100) / 100;
    } else {
      discount = Math.min(offer.discountValue, subtotal);
    }
    if (offer.minOrderValue && subtotal < offer.minOrderValue) {
      discount = 0; // min order value not met
    }
    subtotal = Math.max(0, subtotal - discount);
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

