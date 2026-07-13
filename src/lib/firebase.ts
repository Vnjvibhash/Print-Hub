import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
  type Auth
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  type Firestore
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  type FirebaseStorage
} from "firebase/storage";
import { UserProfile, ServiceItem, ProductItem, Order, NotificationRecord, CarouselSlide, OfferRecord } from "@/types";
import { DEFAULT_TIERED_SERVICES } from "@/lib/pricing";
import seedData from "@/data/printhub-seed-data.json";

// 1. Firebase Configuration Detection
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseGoogleClientId = process.env.NEXT_PUBLIC_FIREBASE_GOOGLE_CLIENT_ID;

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.authDomain
);

export let firebaseApp: FirebaseApp | null = null;
export let firebaseAuth: Auth | null = null;
export let firebaseDb: Firestore | null = null;
export let firebaseStorage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
  } catch (error) {
    console.warn("Firebase initialization failed, falling back to Local/Mock mode:", error);
  }
}

export const isFirebaseEnabled = !!(firebaseApp && firebaseAuth && firebaseDb);

// Admin email whitelist — emails listed here are automatically assigned the 'admin' role
const ADMIN_EMAILS: string[] = ["vnjvibhash@gmail.com"];

// --- MOCK DATABASE PRE-POPULATION ---
const DEFAULT_SERVICES: ServiceItem[] = [
  // Printing Services
  { id: "a4-bw", name: "A4 Black & White Printing", category: "printing", description: "Standard single/double-sided black & white printing on 75GSM paper.", basePrice: 2, features: ["75 GSM Bond Paper", "Crisp text rendering", "Single/Double Sided option"], image: "/images/a4-bw.jpg" },
  { id: "a4-color", name: "A4 Color Printing", category: "printing", description: "High-quality A4 color printing on standard or premium paper.", basePrice: 10, features: ["Vibrant color ink", "Standard or gloss finish", "Ideal for presentations"], image: "/images/a4-color.jpg" },
  { id: "a3-bw", name: "A3 Black & White Printing", category: "printing", description: "Larger format black & white printing, ideal for CAD drawings and maps.", basePrice: 5, features: ["A3 Size (297 x 420 mm)", "80 GSM paper", "Accurate detail styling"], image: "/images/a3-bw.jpg" },
  { id: "a3-color", name: "A3 Color Printing", category: "printing", description: "Premium A3 color prints for posters, charts, and spreadsheets.", basePrice: 20, features: ["Large color format", "Vivid pigments", "Perfect for diagrams"], image: "/images/a3-color.jpg" },
  { id: "photo-print", name: "Photo Printing", category: "printing", description: "Vivid, archival photo prints on professional glossy/matte photo paper.", basePrice: 15, features: ["Glossy or Matte Paper", "High DPI print resolution", "Fade resistant"], image: "/images/photo.jpg" },
  { id: "passport-photo", name: "Passport Photo Printing", category: "printing", description: "Standard passport size photo set (8 photos) with background editing.", basePrice: 50, features: ["8 Photos per sheet", "Biometric compliant", "Glossy cutouts"], image: "/images/passport.jpg" },
  { id: "spiral-binding", name: "Spiral Binding", category: "printing", description: "Robust spiral coil binding with clear cover sheet and black back card.", basePrice: 40, features: ["Up to 300 pages", "Flexible plastic coil", "Clear front cover"], image: "/images/spiral.jpg" },
  { id: "lamination", name: "Lamination", category: "printing", description: "Thermal plastic lamination to protect documents from water and tearing.", basePrice: 20, features: ["Heavy duty plastic pouches", "Waterproof and tearproof", "Glossy transparent look"], image: "/images/lamination.jpg" },
  { id: "banner-print", name: "Flex & Banner Printing", category: "printing", description: "High-durability outdoor flex banners and promotional advertising banners.", basePrice: 40, features: ["12oz premium heavy vinyl", "Weatherproof and UV-resistant", "Includes metal grommets"], image: "/images/banner.jpg" },

  // Lamination variants (by paper size)
  { id: "lamination-a4", name: "A4 Lamination", category: "printing", description: "Thermal plastic lamination for A4 documents — waterproof, tearproof and crystal clear.", basePrice: 10, features: ["A4 size lamination", "Thermal gloss finish", "Waterproof & tearproof"] as string[], image: "/images/lamination.jpg" },
  { id: "lamination-small", name: "Small Size Lamination", category: "printing", description: "Compact lamination for cards, IDs, and small documents up to A5/visiting card size.", basePrice: 7, features: ["A5 / small card size", "Heavy-duty plastic pouch", "Crystal clear glossy finish"] as string[], image: "/images/lamination.jpg" },
  { id: "lamination-a3", name: "A3 Lamination", category: "printing", description: "Large-format A3 thermal lamination for posters, charts and presentation sheets.", basePrice: 18, features: ["A3 size lamination", "Thermal gloss coating", "Rigid protective finish"] as string[], image: "/images/lamination.jpg" },

  // Finishing services
  { id: "comb-binding", name: "Comb Binding", category: "printing", description: "Professional plastic comb binding for reports, manuals and booklets up to 400 pages.", basePrice: 35, features: ["Up to 400 pages", "Flexible comb spine", "Clear front cover included"] as string[], image: "/images/spiral.jpg" },
  { id: "stapling", name: "Stapling Service", category: "printing", description: "Corner or booklet stapling for multi-page documents and pamphlets.", basePrice: 5, features: ["Corner or saddle stapling", "Fast turnaround", "Up to 50 pages"] as string[], image: "/images/spiral.jpg" },
  { id: "file-punching", name: "File Punching", category: "printing", description: "Standard 2-hole or 4-hole file punching for office documents and reports.", basePrice: 3, features: ["2-hole or 4-hole punch", "Clean precision cuts", "Compatible with all binders"] as string[], image: "/images/spiral.jpg" },


  // Business Services
  { id: "visiting-cards", name: "Business & Visiting Cards", category: "business", description: "Standard 350GSM business cards with matte/gloss lamination.", basePrice: 1.5, features: ["350 GSM premium cardstock", "Single or double sided", "Matte/Gloss finishing"], image: "/images/cards.jpg" },
  { id: "letterheads", name: "Company Letterheads", category: "business", description: "Professional executive letterheads on premium 100GSM royal executive paper.", basePrice: 4, features: ["100 GSM premium paper", "High resolution company logo", "Executive finish"], image: "/images/letterhead.jpg" },
  { id: "brochures", name: "Flyers & Brochures", category: "business", description: "A4 bi-fold or tri-fold advertising brochures with vibrant color.", basePrice: 8, features: ["130 GSM art paper", "Folded layout", "Vibrant graphic colors"], image: "/images/brochure.jpg" },
  { id: "menu-print", name: "Restaurant Menu Card Printing", category: "business", description: "Premium restaurant menu sheet or folded booklet printing with moisture protection.", basePrice: 15, features: ["300 GSM royal cardstock", "Gloss/Matte lamination coating", "Spill & moisture resistant"], image: "/images/menu.jpg" },
  { id: "invitation-print", name: "Premium Invitation Card Printing", category: "business", description: "Exquisite wedding, birthday, and party invitation card printing.", basePrice: 25, features: ["Textured executive paper", "Complimentary envelope wrap", "Vibrant colors & hot stamping"], image: "/images/invitation.jpg" },
  { id: "calendar-print", name: "Custom Photo Wall Calendars", category: "business", description: "Personalized wall/desk calendars featuring custom photos for each month.", basePrice: 180, features: ["12-month page sheets", "Wiro spiral binder hang hook", "Sturdy premium paper stock"], image: "/images/calendar.jpg" },
  { id: "corporate-gift", name: "Corporate Gift Printing & Combo Sets", category: "business", description: "Embossed diaries, engraved metal pens, and premium customized gift combos.", basePrice: 450, features: ["Engraved executive metal pen", "Leatherette diary notebook", "Premium customized gift box"], image: "/images/corporate-gift.jpg" },

  // Custom Merchandise
  { id: "mug-print", name: "Custom Mug Printing", category: "merchandise", description: "Personalized ceramic coffee mugs with wrap-around photo prints.", basePrice: 150, features: ["325ml premium ceramic", "Microwave and dishwasher safe", "Glossy dynamic wrap"], image: "/images/mug.jpg" },
  { id: "magic-mug", name: "Magic Mug Printing", category: "merchandise", description: "Color-changing ceramic mugs that reveal your design when hot liquids are added.", basePrice: 250, features: ["Heat-sensitive coating", "Black finish turns white", "Wow-factor gift"], image: "/images/magic-mug.jpg" },
  { id: "tshirt-print", name: "Custom T-Shirt Printing", category: "merchandise", description: "Premium cotton round-neck T-shirts with customized DTF graphics.", basePrice: 350, features: ["100% combed cotton", "High durability print", "Multiple color options"], image: "/images/tshirt.jpg" },
  { id: "hoodie-print", name: "Custom Hoodie Printing", category: "merchandise", description: "Warm and cozy fleece-lined hoodies with custom graphics or embroidery.", basePrice: 750, features: ["300 GSM fleece cotton", "Kangaroo pockets", "Durable wash-safe print"], image: "/images/hoodie.jpg" },
  { id: "pillow-print", name: "Custom Cushion/Pillow Printing", category: "merchandise", description: "Cozy custom throw pillows and cushion covers with premium soft fillers.", basePrice: 200, features: ["Satin canvas covers", "Soft fiber filler included", "Vivid photo sublimation"], image: "/images/pillow.jpg" },
  { id: "mobilecover-print", name: "Custom Mobile Cover Printing", category: "merchandise", description: "Edge-to-edge personalized 3D wrap hard cases for popular phone models.", basePrice: 180, features: ["polycarbonate slim case", "3D wrap print covers sides", "Scratch-resistant matte finish"], image: "/images/mobilecover.jpg" },
  { id: "keychain-print", name: "Personalized Keychain Printing", category: "merchandise", description: "Premium clear acrylic or wooden keychains customized with photos or logo.", basePrice: 60, features: ["Glossy acrylic display", "Sturdy metal chain ring", "Double-sided full print"], image: "/images/keychain.jpg" },
  { id: "cap-print", name: "Custom Cap & Hat Printing", category: "merchandise", description: "Printed or embroidered sports caps for branding and promotions.", basePrice: 120, features: ["100% breathable cotton", "Adjustable secure strap", "Vivid logo embroidery"], image: "/images/cap.jpg" },
  { id: "photoframe-print", name: "Archival Canvas Frame Printing", category: "merchandise", description: "Museum-grade canvas material stretched onto a sturdy wooden internal frames.", basePrice: 300, features: ["Premium textured canvas", "Wooden gallery wrapped border", "Pre-installed hangers"], image: "/images/canvas.jpg" },
  { id: "mousepad-print", name: "Custom Rubber Mousepad Printing", category: "merchandise", description: "Smooth textured custom mousepads with anti-slip rubber bases.", basePrice: 120, features: ["High-speed smooth cloth surface", "Anti-fray stitched edges", "Steady heavy rubber grip"], image: "/images/mousepad.jpg" },

  // Document Services
  { id: "scanning", name: "Document Scanning & Archiving", category: "documents", description: "High-speed document scanning to PDF/JPEG and cloud storage backup.", basePrice: 5, features: ["Up to 600 DPI", "Multi-page PDF compilation", "OCR text searchable (optional)"], image: "/images/scan.jpg" },
  { id: "xerox", name: "High-volume Xerox", category: "documents", description: "Quick photocopy services for booklets, documents, and records.", basePrice: 1.5, features: ["High-speed replication", "70 GSM paper", "Bulk discount rates"], image: "/images/xerox.jpg" },
  { id: "resume-creation", name: "Professional Resume Writing", category: "documents", description: "Resume writing and formatting service with ATS-compliant designs.", basePrice: 200, features: ["ATS friendly styling", "PDF & Word deliverables", "Modern executive layout"], image: "/images/resume.jpg" },

  // Specialty Sheet Printing (Volume-based tiered pricing)
  {
    id: "300gsm-print", name: "300 GSM Sheet Printing", category: "printing",
    description: "Premium thick 300 GSM cardstock printing for certificates, invitations, and high-impact documents.",
    basePrice: 30, features: ["300 GSM premium cardstock", "Single & double-sided options", "Volume discounts available"],
    image: "/images/300gsm.jpg", supportsSides: true,
    pricingTiers: [
      { minQty: 1, maxQty: 1, singleSidePrice: 30, doubleSidePrice: 50 },
      { minQty: 2, maxQty: 2, singleSidePrice: 25, doubleSidePrice: 40 },
      { minQty: 3, maxQty: 5, singleSidePrice: 20, doubleSidePrice: 30 },
      { minQty: 6, maxQty: 10, singleSidePrice: 15, doubleSidePrice: 20 },
      { minQty: 11, maxQty: 25, singleSidePrice: 10, doubleSidePrice: 15 },
      { minQty: 26, maxQty: null, singleSidePrice: 8, doubleSidePrice: 12 },
    ]
  },
  {
    id: "gumming-sheet", name: "Gumming Sheet Print", category: "printing",
    description: "Self-adhesive gumming sticker sheet printing for labels, branding, and packaging.",
    basePrice: 30, features: ["Self-adhesive backing", "Precision die-cut ready", "Vibrant color print"],
    image: "/images/gumming.jpg", supportsSides: false,
    pricingTiers: [
      { minQty: 1, maxQty: 1, singleSidePrice: 30 },
      { minQty: 2, maxQty: 2, singleSidePrice: 25 },
      { minQty: 3, maxQty: 5, singleSidePrice: 20 },
      { minQty: 6, maxQty: 10, singleSidePrice: 15 },
      { minQty: 11, maxQty: 25, singleSidePrice: 10 },
      { minQty: 26, maxQty: null, singleSidePrice: 8 },
    ]
  },
  {
    id: "vinyl-sheet", name: "Vinyl Sheet Print", category: "printing",
    description: "Durable vinyl sticker sheet printing — waterproof and UV-resistant for outdoor applications.",
    basePrice: 100, features: ["Waterproof vinyl material", "UV-resistant inks", "Indoor & outdoor use"],
    image: "/images/vinyl.jpg", supportsSides: false,
    pricingTiers: [
      { minQty: 1, maxQty: 1, singleSidePrice: 100 },
      { minQty: 2, maxQty: 2, singleSidePrice: 80 },
      { minQty: 3, maxQty: 5, singleSidePrice: 50 },
      { minQty: 6, maxQty: 10, singleSidePrice: 30 },
      { minQty: 11, maxQty: 25, singleSidePrice: 20 },
      { minQty: 26, maxQty: null, singleSidePrice: 15 },
    ]
  },
  {
    id: "rubber-vinyl-sheet", name: "Rubber Vinyl Sheet Print", category: "printing",
    description: "Heavy-duty rubberized vinyl prints with textured finish for industrial and decorative use.",
    basePrice: 100, features: ["Rubberized textured finish", "Extra durable material", "Scratch & abrasion resistant"],
    image: "/images/rubber-vinyl.jpg", supportsSides: false,
    pricingTiers: [
      { minQty: 1, maxQty: 2, singleSidePrice: 100 },
      { minQty: 3, maxQty: 5, singleSidePrice: 80 },
      { minQty: 6, maxQty: 25, singleSidePrice: 50 },
      { minQty: 26, maxQty: null, singleSidePrice: 40 },
    ]
  },
  {
    id: "transparent-vinyl-sheet", name: "Transparent Vinyl Sheet Print", category: "printing",
    description: "Clear transparent vinyl sticker printing for glass, windows, and see-through branding.",
    basePrice: 100, features: ["Crystal clear transparency", "High-tack adhesive", "Perfect for glass surfaces"],
    image: "/images/transparent-vinyl.jpg", supportsSides: false,
    pricingTiers: [
      { minQty: 1, maxQty: 2, singleSidePrice: 100 },
      { minQty: 3, maxQty: 5, singleSidePrice: 80 },
      { minQty: 6, maxQty: 25, singleSidePrice: 50 },
      { minQty: 26, maxQty: null, singleSidePrice: 40 },
    ]
  },
  {
    id: "glossy-photo-sheet", name: "Glossy Photo Sheet Print", category: "printing",
    description: "High-gloss premium photo paper prints for vivid, gallery-quality photographs.",
    basePrice: 100, features: ["High-gloss photo paper", "Vivid color reproduction", "Fade-resistant archival inks"],
    image: "/images/glossy-photo.jpg", supportsSides: false,
    pricingTiers: [
      { minQty: 1, maxQty: 2, singleSidePrice: 100 },
      { minQty: 3, maxQty: 5, singleSidePrice: 80 },
      { minQty: 6, maxQty: 25, singleSidePrice: 50 },
      { minQty: 26, maxQty: null, singleSidePrice: 40 },
    ]
  },
  {
    id: "half-cut", name: "Half Cut Service", category: "printing",
    description: "Precision half-cut / kiss-cut service for stickers and labels — cut through the top layer only.",
    basePrice: 10, features: ["Precision kiss-cutting", "Peel-and-stick ready", "Works with all sticker sheets"],
    image: "/images/half-cut.jpg", supportsSides: false,
    pricingTiers: [
      { minQty: 1, maxQty: 1, singleSidePrice: 10 },
      { minQty: 2, maxQty: 2, singleSidePrice: 8 },
      { minQty: 3, maxQty: 5, singleSidePrice: 5 },
      { minQty: 6, maxQty: 10, singleSidePrice: 3 },
      { minQty: 11, maxQty: 25, singleSidePrice: 2 },
      { minQty: 26, maxQty: null, singleSidePrice: 1 },
    ]
  },
];

const DEFAULT_PRODUCTS: ProductItem[] = [
  { id: "prod-mug", name: "Standard Ceramic Mug", type: "mug", basePrice: 150, imageUrl: "/images/mug.jpg", colors: ["#ffffff", "#000000", "#ef4444", "#3b82f6"] },
  { id: "prod-magic-mug", name: "Magic Color Changing Mug", type: "magic-mug" as any, basePrice: 250, imageUrl: "/images/magic-mug.jpg", colors: ["#000000"] },
  { id: "prod-tshirt", name: "Premium cotton T-Shirt", type: "tshirt", basePrice: 350, imageUrl: "/images/tshirt.jpg", colors: ["#ffffff", "#000000", "#18181b", "#ef4444", "#3b82f6", "#10b981"], sizes: ["S", "M", "L", "XL", "XXL"] },
  { id: "prod-hoodie", name: "Heavyweight Fleece Hoodie", type: "hoodie", basePrice: 750, imageUrl: "/images/hoodie.jpg", colors: ["#ffffff", "#000000", "#374151", "#3b82f6"], sizes: ["M", "L", "XL", "XXL"] },
  { id: "prod-pillow", name: "Cozy Cushion/Pillow", type: "pillow", basePrice: 200, imageUrl: "/images/pillow.jpg", colors: ["#ffffff", "#fef08a", "#fbcfe8"] },
  { id: "prod-mobilecover", name: "Slim Fit 3D Phone Case", type: "mobilecover", basePrice: 180, imageUrl: "/images/mobilecover.jpg", colors: ["#ffffff", "#000000", "#1e3a8a", "#e11d48"] },
  { id: "prod-keychain", name: "Custom Acrylic Keychain", type: "keychain", basePrice: 60, imageUrl: "/images/keychain.jpg", colors: ["#ffffff", "#ef4444", "#eab308", "#10b981"] },
  { id: "prod-cap", name: "Adjustable Snapback Canvas Cap", type: "cap", basePrice: 120, imageUrl: "/images/cap.jpg", colors: ["#ffffff", "#000000", "#1e3a8a", "#e11d48"], sizes: ["Adjustable"] },
  { id: "prod-photoframe", name: "Stretched Canvas Art Frame", type: "photoframe", basePrice: 300, imageUrl: "/images/canvas.jpg", colors: ["#ffffff"], sizes: ["12x12", "12x18", "18x24"] },
  { id: "prod-mousepad", name: "Premium Non-Slip Mousepad", type: "mousepad", basePrice: 120, imageUrl: "/images/mousepad.jpg", colors: ["#ffffff", "#000000", "#374151"] },
];

// Prepopulate localStorage for Mocks
const getLocalData = (key: string) => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(`printhub_db_${key}`);
  return data ? JSON.parse(data) : null;
};

const setLocalData = (key: string, data: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`printhub_db_${key}`, JSON.stringify(data));
};

const initLocalDatabase = () => {
  if (typeof window === "undefined") return;
  
  const existingServices = getLocalData("services");
  if (!existingServices) {
    setLocalData("services", DEFAULT_SERVICES);
  } else {
    // Merge any missing services
    const missing = DEFAULT_SERVICES.filter(
      (ds) => !existingServices.some((cs: any) => cs.id === ds.id)
    );
    if (missing.length > 0) {
      setLocalData("services", [...existingServices, ...missing]);
    }
  }

  const existingProducts = getLocalData("products");
  if (!existingProducts) {
    setLocalData("products", DEFAULT_PRODUCTS);
  } else {
    // Merge any missing products
    const missing = DEFAULT_PRODUCTS.filter(
      (dp) => !existingProducts.some((cp: any) => cp.id === dp.id)
    );
    if (missing.length > 0) {
      setLocalData("products", [...existingProducts, ...missing]);
    }
  }

  if (!getLocalData("settings")) {
    setLocalData("settings", {
      gstNumber: "27AAAAA1111A1Z1",
      companyName: "SUVIR Printing",
      companyAddress: "102, Digital Towers, Sector 62, Noida, UP - 201301",
      taxRate: 18,
      upiId: "pay.printhub@okaxis",
      contactEmail: "support@printhub.com"
    });
  }
  
  // Prepopulate standard accounts
  if (!getLocalData("users")) {
    const defaultUsers: Record<string, UserProfile> = {
      "user-customer": {
        uid: "user-customer",
        email: "customer@printhub.com",
        displayName: "Vikas Yadav",
        role: "customer",
        photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane",
        addresses: [
          { id: "addr-1", name: "Home", street: "Flat 402, Royal Gardens", city: "Noida", state: "Uttar Pradesh", zipCode: "201301", phone: "9876543210" }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      "user-admin": {
        uid: "user-admin",
        email: "admin@printhub.com",
        displayName: "Viveka Jee",
        role: "admin",
        photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    setLocalData("users", defaultUsers);
  }

  // Prepopulate sample order history for demonstration
  // Carousel slides
  if (!getLocalData("carousel")) {
    const defaultSlides: CarouselSlide[] = [
      {
        id: "slide-document-print",
        tag: "⚡ Super Fast",
        tagColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
        headline: "Print Documents,",
        highlight: "Instantly.",
        sub: "A4 & A3 documents, reports, theses — B&W or full color. Ready within the hour.",
        ctaLabel: "Upload & Order Now",
        ctaHref: "/services",
        secondaryCtaLabel: "View Pricing",
        secondaryCtaHref: "/pricing",
        accentColor: "indigo",
        iconName: "Printer",
        stats: [
          { value: "₹2", label: "per A4 B&W page" },
          { value: "₹10", label: "per A4 color page" },
          { value: "1 hr", label: "average turnaround" },
        ],
        isActive: true,
        order: 0,
      },
      {
        id: "slide-business-cards",
        tag: "💼 Corporate",
        tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        headline: "Premium Business",
        highlight: "Cards & Stationery.",
        sub: "350GSM matte & glossy finish cards, letterheads, envelopes, and brochures for your brand.",
        ctaLabel: "Design Your Cards",
        ctaHref: "/services",
        secondaryCtaLabel: "Bulk Quote",
        secondaryCtaHref: "/pricing",
        accentColor: "emerald",
        iconName: "Layers",
        stats: [
          { value: "₹1.5", label: "per card" },
          { value: "500+", label: "minimum for bulk" },
          { value: "350gsm", label: "premium cardstock" },
        ],
        isActive: true,
        order: 1,
      },
      {
        id: "slide-custom-merch",
        tag: "🎁 Trending Now",
        tagColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        headline: "Custom Merchandise",
        highlight: "Made to Order.",
        sub: "T-shirts, hoodies, caps, mugs, cushions, mobile covers and more — print your design on anything.",
        ctaLabel: "Start Customizing",
        ctaHref: "/customizer",
        secondaryCtaLabel: "See All Merch",
        secondaryCtaHref: "/services",
        accentColor: "purple",
        iconName: "Sparkles",
        stats: [
          { value: "20+", label: "product types" },
          { value: "₹150", label: "starting price" },
          { value: "DTF", label: "premium print tech" },
        ],
        isActive: true,
        order: 2,
      },
      {
        id: "slide-gifts",
        tag: "🎀 Perfect Gifts",
        tagColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        headline: "Personalized Gifts",
        highlight: "They'll Love.",
        sub: "Magic mugs, canvas prints, photo pillows, keychains, and more — perfect for every occasion.",
        ctaLabel: "Browse Gift Ideas",
        ctaHref: "/customizer",
        secondaryCtaLabel: "Corporate Gifts",
        secondaryCtaHref: "/services",
        accentColor: "amber",
        iconName: "Gift",
        stats: [
          { value: "100%", label: "custom printed" },
          { value: "₹150", label: "mugs starting at" },
          { value: "Next day", label: "dispatch available" },
        ],
        isActive: true,
        order: 3,
      },
    ];
    setLocalData("carousel", defaultSlides);
  }

  // Offers
  const defaultOffers = (seedData.offers ?? []) as OfferRecord[];
  const existingOffers = getLocalData("offers");
  if (!existingOffers || existingOffers.length === 0) {
    setLocalData("offers", defaultOffers);
  } else {
    const missingOffers = defaultOffers.filter(
      (offer) => !existingOffers.some((existingOffer: OfferRecord) => existingOffer.id === offer.id)
    );
    if (missingOffers.length > 0) {
      setLocalData("offers", [...existingOffers, ...missingOffers]);
    }
  }

  if (!getLocalData("orders")) {
    const defaultOrders: Order[] = [
      {
        id: "PH-9821",
        customerId: "user-customer",
        customerEmail: "customer@printhub.com",
        customerName: "Jane Doe",
        serviceId: "a4-color",
        serviceName: "A4 Color Printing",
        serviceCategory: "printing",
        files: [{ name: "semester_project_presentation.pdf", url: "#", size: 1048576, type: "application/pdf" }],
        quantity: 1,
        specifications: { paperSize: "A4", colorMode: "color", sides: "double", binding: "spiral", pages: 15, copies: 2 },
        priceBreakdown: { base: 10, optionsPrice: 40, subtotal: 340, gst: 61.2, total: 401.2 },
        paymentId: "pay_mock_12345",
        paymentMethod: "stripe",
        paymentStatus: "completed",
        orderStatus: "Ready for Pickup",
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "PH-7712",
        customerId: "user-customer",
        customerEmail: "customer@printhub.com",
        customerName: "Jane Doe",
        serviceId: "mug-print",
        serviceName: "Custom Mug Printing",
        serviceCategory: "merchandise",
        files: [{ name: "my_family_portrait.jpg", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300", size: 409600, type: "image/jpeg" }],
        quantity: 2,
        specifications: { size: "M" as any, color: "#ffffff", customText: "Happy Birthday Mom", customImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300" },
        priceBreakdown: { base: 150, optionsPrice: 0, subtotal: 300, gst: 54, total: 354 },
        paymentId: "pay_mock_67890",
        paymentMethod: "upi",
        paymentStatus: "completed",
        orderStatus: "Delivered",
        createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString()
      }
    ];
    setLocalData("orders", defaultOrders);
  }
};

if (typeof window !== "undefined") {
  initLocalDatabase();
}

// --- HYBRID ACTIONS ROUTER ---

// 1. AUTHENTICATION SERVICES
export const authService = {
  // Subscribe to auth state changes
  onAuthStateChange: (callback: (user: UserProfile | null) => void) => {
    if (isFirebaseEnabled) {
      return firebaseOnAuthStateChanged(firebaseAuth!, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Fetch additional profile fields from Firestore
          const docRef = doc(firebaseDb!, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const existingProfile = docSnap.data() as UserProfile;
            // Auto-promote admin emails if not already admin
            const userEmail = (existingProfile.email || "").toLowerCase();
            if (ADMIN_EMAILS.includes(userEmail) && existingProfile.role !== "admin") {
              const promoted = { ...existingProfile, role: "admin" as const, updatedAt: new Date().toISOString() };
              await setDoc(docRef, promoted);
              callback(promoted);
            } else {
              callback(existingProfile);
            }
          } else {
            // Create profile record if missing
            const userEmail = (firebaseUser.email || "").toLowerCase();
            const isAdmin = ADMIN_EMAILS.includes(userEmail);
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              role: isAdmin ? "admin" : "customer",
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.uid}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(docRef, profile);
            callback(profile);
          }
        } else {
          callback(null);
        }
      });
    } else {
      // Mock implementation using localStorage
      const checkSession = () => {
        if (typeof window === "undefined") return;
        const loggedInUid = sessionStorage.getItem("printhub_logged_in_uid");
        if (loggedInUid) {
          const usersMap = getLocalData("users") || {};
          const user = usersMap[loggedInUid];
          callback(user || null);
        } else {
          callback(null);
        }
      };

      // Set listener
      if (typeof window !== "undefined") {
        window.addEventListener("printhub_auth_event", checkSession);
      }
      checkSession();

      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("printhub_auth_event", checkSession);
        }
      };
    }
  },

  // Email/Password sign up
  signUp: async (email: string, password: string, displayName: string): Promise<UserProfile> => {
    if (isFirebaseEnabled) {
      const userCred = await createUserWithEmailAndPassword(firebaseAuth!, email, password);
      const profile: UserProfile = {
        uid: userCred.user.uid,
        email,
        displayName,
        role: "customer",
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userCred.user.uid}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(firebaseDb!, "users", userCred.user.uid), profile);
      return profile;
    } else {
      // Mock Signup
      const usersMap = getLocalData("users") || {};
      
      // Check if already exists
      const emailExists = Object.values(usersMap).some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) throw new Error("Email already in use.");

      const newUid = `user-${Math.random().toString(36).substring(2, 11)}`;
      const profile: UserProfile = {
        uid: newUid,
        email,
        displayName,
        role: "customer",
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newUid}`,
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      usersMap[newUid] = profile;
      setLocalData("users", usersMap);
      
      sessionStorage.setItem("printhub_logged_in_uid", newUid);
      window.dispatchEvent(new Event("printhub_auth_event"));
      return profile;
    }
  },

  // Email/Password sign in
  signIn: async (email: string, password: string): Promise<UserProfile> => {
    if (isFirebaseEnabled) {
      const userCred = await signInWithEmailAndPassword(firebaseAuth!, email, password);
      const docRef = doc(firebaseDb!, "users", userCred.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const existingProfile = docSnap.data() as UserProfile;
        // Auto-promote admin emails if not already admin
        const userEmail = (existingProfile.email || "").toLowerCase();
        if (ADMIN_EMAILS.includes(userEmail) && existingProfile.role !== "admin") {
          const promoted = { ...existingProfile, role: "admin" as const, updatedAt: new Date().toISOString() };
          await setDoc(docRef, promoted);
          return promoted;
        }
        return existingProfile;
      }
      throw new Error("User profile not found.");
    } else {
      // Mock Signin
      const usersMap = getLocalData("users") || {};
      const foundUser = Object.values(usersMap).find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase()
      ) as UserProfile;

      if (!foundUser) {
        throw new Error("Auth failed: Invalid credentials.");
      }

      // Check simple passwords for mocks (customer@printhub.com / password123, admin@printhub.com / admin123)
      if (email === "customer@printhub.com" && password !== "password123") {
        throw new Error("Auth failed: Invalid password.");
      }
      if (email === "admin@printhub.com" && password !== "admin123") {
        throw new Error("Auth failed: Invalid password.");
      }

      sessionStorage.setItem("printhub_logged_in_uid", foundUser.uid);
      window.dispatchEvent(new Event("printhub_auth_event"));
      return foundUser;
    }
  },

  // Social Google login
  signInWithGoogle: async (): Promise<UserProfile> => {
    if (isFirebaseEnabled) {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      try {
        const userCred = await signInWithPopup(firebaseAuth!, provider);
        const docRef = doc(firebaseDb!, "users", userCred.user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const existingProfile = docSnap.data() as UserProfile;
          // Auto-promote admin emails if not already admin
          const userEmail = (existingProfile.email || "").toLowerCase();
          if (ADMIN_EMAILS.includes(userEmail) && existingProfile.role !== "admin") {
            const promoted = { ...existingProfile, role: "admin" as const, updatedAt: new Date().toISOString() };
            await setDoc(docRef, promoted);
            return promoted;
          }
          return existingProfile;
        } else {
          const userEmail = (userCred.user.email || "").toLowerCase();
          const isAdmin = ADMIN_EMAILS.includes(userEmail);
          const profile: UserProfile = {
            uid: userCred.user.uid,
            email: userCred.user.email || "",
            displayName: userCred.user.displayName || "Google User",
            role: isAdmin ? "admin" : "customer",
            photoURL: userCred.user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userCred.user.uid}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(docRef, profile);
          return profile;
        }
      } catch (error: any) {
        const message = error?.code === "auth/popup-closed-by-user"
          ? "Google sign-in was cancelled."
          : error?.message || "Google authentication failed.";
        throw new Error(message);
      }
    } else {
      // Mock Google Login - Log in the mock customer directly
      const usersMap = getLocalData("users") || {};
      const customer = usersMap["user-customer"];
      
      sessionStorage.setItem("printhub_logged_in_uid", customer.uid);
      window.dispatchEvent(new Event("printhub_auth_event"));
      return customer;
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    if (isFirebaseEnabled) {
      await firebaseSignOut(firebaseAuth!);
    } else {
      sessionStorage.removeItem("printhub_logged_in_uid");
      window.dispatchEvent(new Event("printhub_auth_event"));
    }
  },

  updateUserProfile: async (uid: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    if (isFirebaseEnabled) {
      const docRef = doc(firebaseDb!, "users", uid);
      await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
      const docSnap = await getDoc(docRef);
      return docSnap.data() as UserProfile;
    } else {
      const usersMap = getLocalData("users") || {};
      const user = usersMap[uid];
      if (!user) throw new Error("User profile not found.");

      const updated = {
        ...user,
        ...data,
        updatedAt: new Date().toISOString()
      };
      usersMap[uid] = updated;
      setLocalData("users", usersMap);
      window.dispatchEvent(new Event("printhub_auth_event"));
      return updated;
    }
  }
};

// 2. FIRESTORE DATABASE SERVICES
export const dbService = {
  // Read all items in a collection
  getCollection: async <T>(collName: string): Promise<T[]> => {
    if (isFirebaseEnabled) {
      const q = query(collection(firebaseDb!, collName));
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];

      // Fallback/Merge default services when Firestore is missing them (e.g. new services added in code)
      if (collName === "services" && results.length > 0) {
        const missing = (DEFAULT_SERVICES as unknown as T[]).filter(
          (ds: any) => !results.some((cs: any) => cs.id === ds.id)
        );
        if (missing.length > 0) {
          // Upload missing services in background
          missing.forEach(async (item: any) => {
            try {
              await setDoc(doc(firebaseDb!, "services", item.id), item);
            } catch (err) {
              console.warn(`Failed to auto-seed service ${item.id} to Firestore:`, err);
            }
          });
          return [...results, ...missing];
        }
      }

      // Fallback to hardcoded defaults when Firestore collection is empty
      // (e.g. database hasn't been seeded yet)
      if (results.length === 0) {
        if (collName === "services") return DEFAULT_SERVICES as unknown as T[];
        if (collName === "products") return DEFAULT_PRODUCTS as unknown as T[];
        if (collName === "carousel") {
          const defaultSlides = (seedData.carousel || []) as unknown as T[];
          // Auto-seed to Firestore
          defaultSlides.forEach(async (slide: any) => {
            try {
              await setDoc(doc(firebaseDb!, "carousel", slide.id), slide);
            } catch (err) {
              console.warn(`Failed to auto-seed slide ${slide.id} to Firestore:`, err);
            }
          });
          return defaultSlides;
        }
        if (collName === "offers") {
          const defaultOffers = (seedData.offers || []) as unknown as T[];
          // Auto-seed to Firestore
          defaultOffers.forEach(async (offer: any) => {
            try {
              await setDoc(doc(firebaseDb!, "offers", offer.id), offer);
            } catch (err) {
              console.warn(`Failed to auto-seed offer ${offer.id} to Firestore:`, err);
            }
          });
          return defaultOffers;
        }
      }

      return results;
    } else {
      const data = getLocalData(collName);
      return (data || []) as T[];
    }
  },

  // Read a single document by ID
  getDocument: async <T>(collName: string, docId: string): Promise<T | null> => {
    if (isFirebaseEnabled) {
      const docRef = doc(firebaseDb!, collName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return ({ id: docSnap.id, ...docSnap.data() } as T);
      }
      
      // Fallback: Query by custom 'id' field for legacy/mismatched documents
      const q = query(collection(firebaseDb!, collName), where("id", "==", docId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const d = querySnapshot.docs[0];
        return ({ id: d.id, ...d.data() } as T);
      }
      return null;
    } else {
      const collectionData = getLocalData(collName);
      if (Array.isArray(collectionData)) {
        return (collectionData.find((item: any) => item.id === docId) || null) as T | null;
      } else if (collectionData && typeof collectionData === "object") {
        return (collectionData[docId] || null) as T | null;
      }
      return null;
    }
  },

  // Add document (handles both custom 'id' in data and auto-generated IDs)
  addDocument: async <T extends { id?: string }>(collName: string, documentData: Omit<T, "id">): Promise<T> => {
    const dataWithId = documentData as any;
    if (isFirebaseEnabled) {
      if (dataWithId && typeof dataWithId === "object" && dataWithId.id) {
        // If a custom ID is provided at runtime (e.g. PH-XXXX), write with that ID as the document ID
        const docRef = doc(firebaseDb!, collName, dataWithId.id);
        await setDoc(docRef, dataWithId);
        return dataWithId as T;
      }
      const collRef = collection(firebaseDb!, collName);
      const docRef = await addDoc(collRef, documentData);
      return { id: docRef.id, ...documentData } as unknown as T;
    } else {
      const collectionData = getLocalData(collName) || [];
      const newId = (dataWithId && dataWithId.id) || `doc-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      const record = { id: newId, ...documentData } as unknown as T;
      
      collectionData.push(record);
      setLocalData(collName, collectionData);
      return record;
    }
  },

  // Set document (custom ID)
  setDocument: async <T>(collName: string, docId: string, documentData: T): Promise<T> => {
    if (isFirebaseEnabled) {
      await setDoc(doc(firebaseDb!, collName, docId), documentData as any);
      return documentData;
    } else {
      const collectionData = getLocalData(collName) || [];
      const index = collectionData.findIndex((item: any) => item.id === docId);
      const record = { id: docId, ...documentData };

      if (index > -1) {
        collectionData[index] = record;
      } else {
        collectionData.push(record);
      }
      setLocalData(collName, collectionData);
      return record as T;
    }
  },

  // Update document
  updateDocument: async (collName: string, docId: string, updateData: any): Promise<void> => {
    if (isFirebaseEnabled) {
      try {
        await updateDoc(doc(firebaseDb!, collName, docId), updateData);
      } catch (error: any) {
        // Fallback: If document is not found by document ID, try querying by custom 'id' field
        const errorMsg = error.message || "";
        if (error.code === 'not-found' || errorMsg.includes('No document to update') || errorMsg.includes('not found')) {
          const q = query(collection(firebaseDb!, collName), where("id", "==", docId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            await updateDoc(querySnapshot.docs[0].ref, updateData);
            return;
          }
        }
        throw error;
      }
    } else {
      const collectionData = getLocalData(collName) || [];
      const index = collectionData.findIndex((item: any) => item.id === docId);
      if (index > -1) {
        collectionData[index] = { ...collectionData[index], ...updateData };
        setLocalData(collName, collectionData);
      } else {
        // Check if map structure (e.g. users collection is structured as a map in mock)
        const mapData = getLocalData(collName);
        if (mapData && mapData[docId]) {
          mapData[docId] = { ...mapData[docId], ...updateData };
          setLocalData(collName, mapData);
        }
      }
    }
  },

  // Delete document
  deleteDocument: async (collName: string, docId: string): Promise<void> => {
    if (isFirebaseEnabled) {
      try {
        await deleteDoc(doc(firebaseDb!, collName, docId));
        
        // Also check if there exists a legacy/mismatched document to delete
        const q = query(collection(firebaseDb!, collName), where("id", "==", docId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          await deleteDoc(querySnapshot.docs[0].ref);
        }
      } catch (error: any) {
        // Try fallback query on any deletion failure
        const q = query(collection(firebaseDb!, collName), where("id", "==", docId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          await deleteDoc(querySnapshot.docs[0].ref);
          return;
        }
        throw error;
      }
    } else {
      const collectionData = getLocalData(collName);
      if (Array.isArray(collectionData)) {
        const filtered = collectionData.filter((item: any) => item.id !== docId);
        setLocalData(collName, filtered);
      } else if (collectionData && typeof collectionData === "object") {
        delete collectionData[docId];
        setLocalData(collName, collectionData);
      }
    }
  },

  // Seed default data into Firebase for a configured project.
  seedDefaultData: async (): Promise<void> => {
    if (!isFirebaseEnabled) {
      throw new Error("Firebase is not configured.");
    }

    const { importSeedDataFromJson } = await import("@/lib/importSeedData");
    await importSeedDataFromJson();
  },

  importSeedData: async (payload: {
    services: ServiceItem[];
    products: ProductItem[];
    users: Array<UserProfile & { photoURL: string; addresses: NonNullable<UserProfile["addresses"]> }>;
    orders: Order[];
    carousel: CarouselSlide[];
    settings: { gstNumber: string; companyName: string; companyAddress: string; taxRate: number; upiId: string; contactEmail: string; };
    offers: OfferRecord[];
  }): Promise<void> => {
    if (!isFirebaseEnabled) {
      throw new Error("Firebase is not configured.");
    }

    const { importSeedDataFromJson } = await import("@/lib/importSeedData");
    await importSeedDataFromJson(payload);
  },

  seedDefaultDataLegacy: async (): Promise<void> => {
    if (!isFirebaseEnabled) {
      throw new Error("Firebase is not configured.");
    }

    const defaultUsers: UserProfile[] = [
      {
        uid: "user-customer",
        email: "customer@printhub.com",
        displayName: "Jane Doe",
        role: "customer",
        photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane",
        addresses: [
          {
            id: "addr-1",
            name: "Home",
            street: "Flat 402, Royal Gardens",
            city: "Noida",
            state: "Uttar Pradesh",
            zipCode: "201301",
            phone: "9876543210",
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        uid: "user-admin",
        email: "admin@printhub.com",
        displayName: "Viveka Jee",
        role: "admin",
        photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const defaultSlides: CarouselSlide[] = [
      {
        id: "slide-document-print",
        tag: "⚡ Super Fast",
        tagColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
        headline: "Print Documents,",
        highlight: "Instantly.",
        sub: "A4 & A3 documents, reports, theses — B&W or full color. Ready within the hour.",
        ctaLabel: "Upload & Order Now",
        ctaHref: "/services",
        secondaryCtaLabel: "View Pricing",
        secondaryCtaHref: "/pricing",
        accentColor: "indigo",
        iconName: "Printer",
        stats: [
          { value: "₹2", label: "per A4 B&W page" },
          { value: "₹10", label: "per A4 color page" },
          { value: "1 hr", label: "average turnaround" },
        ],
        isActive: true,
        order: 0,
      },
      {
        id: "slide-business-cards",
        tag: "💼 Corporate",
        tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        headline: "Premium Business",
        highlight: "Cards & Stationery.",
        sub: "350GSM matte & glossy finish cards, letterheads, envelopes, and brochures for your brand.",
        ctaLabel: "Design Your Cards",
        ctaHref: "/services",
        secondaryCtaLabel: "Bulk Quote",
        secondaryCtaHref: "/pricing",
        accentColor: "emerald",
        iconName: "Layers",
        stats: [
          { value: "₹1.5", label: "per card" },
          { value: "500+", label: "minimum for bulk" },
          { value: "350gsm", label: "premium cardstock" },
        ],
        isActive: true,
        order: 1,
      },
      {
        id: "slide-custom-merch",
        tag: "🎁 Trending Now",
        tagColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        headline: "Custom Merchandise",
        highlight: "Made to Order.",
        sub: "T-shirts, hoodies, caps, mugs, cushions, mobile covers and more — print your design on anything.",
        ctaLabel: "Start Customizing",
        ctaHref: "/customizer",
        secondaryCtaLabel: "See All Merch",
        secondaryCtaHref: "/services",
        accentColor: "purple",
        iconName: "Sparkles",
        stats: [
          { value: "20+", label: "product types" },
          { value: "₹150", label: "starting price" },
          { value: "DTF", label: "premium print tech" },
        ],
        isActive: true,
        order: 2,
      },
      {
        id: "slide-gifts",
        tag: "🎀 Perfect Gifts",
        tagColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        headline: "Personalized Gifts",
        highlight: "They'll Love.",
        sub: "Magic mugs, canvas prints, photo pillows, keychains, and more — perfect for every occasion.",
        ctaLabel: "Browse Gift Ideas",
        ctaHref: "/customizer",
        secondaryCtaLabel: "Corporate Gifts",
        secondaryCtaHref: "/services",
        accentColor: "amber",
        iconName: "Gift",
        stats: [
          { value: "100%", label: "custom printed" },
          { value: "₹150", label: "mugs starting at" },
          { value: "Next day", label: "dispatch available" },
        ],
        isActive: true,
        order: 3,
      },
    ];

    const defaultOrders: Order[] = [
      {
        id: "PH-9821",
        customerId: "user-customer",
        customerEmail: "customer@printhub.com",
        customerName: "Jane Doe",
        serviceId: "a4-color",
        serviceName: "A4 Color Printing",
        serviceCategory: "printing",
        files: [{ name: "semester_project_presentation.pdf", url: "#", size: 1048576, type: "application/pdf" }],
        quantity: 1,
        specifications: { paperSize: "A4", colorMode: "color", sides: "double", binding: "spiral", pages: 15, copies: 2 },
        priceBreakdown: { base: 10, optionsPrice: 40, subtotal: 340, gst: 61.2, total: 401.2 },
        paymentId: "pay_mock_12345",
        paymentMethod: "stripe",
        paymentStatus: "completed",
        orderStatus: "Ready for Pickup",
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: "PH-7712",
        customerId: "user-customer",
        customerEmail: "customer@printhub.com",
        customerName: "Jane Doe",
        serviceId: "mug-print",
        serviceName: "Custom Mug Printing",
        serviceCategory: "merchandise",
        files: [{ name: "my_family_portrait.jpg", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300", size: 409600, type: "image/jpeg" }],
        quantity: 2,
        specifications: { size: "M" as any, color: "#ffffff", customText: "Happy Birthday Mom", customImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300" },
        priceBreakdown: { base: 150, optionsPrice: 0, subtotal: 300, gst: 54, total: 354 },
        paymentId: "pay_mock_67890",
        paymentMethod: "upi",
        paymentStatus: "completed",
        orderStatus: "Delivered",
        createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
      },
    ];

    const tasks: Promise<unknown>[] = [];

    DEFAULT_SERVICES.forEach((service) => {
      tasks.push(dbService.setDocument("services", service.id, service));
    });
    DEFAULT_PRODUCTS.forEach((product) => {
      tasks.push(dbService.setDocument("products", product.id, product));
    });
    defaultUsers.forEach((user) => {
      tasks.push(dbService.setDocument("users", user.uid, user));
    });
    tasks.push(dbService.setDocument("settings", "app-settings", {
      gstNumber: "27AAAAA1111A1Z1",
      companyName: "SUVIR Printing",
      companyAddress: "102, Digital Towers, Sector 62, Noida, UP - 201301",
      taxRate: 18,
      upiId: "pay.printhub@okaxis",
      contactEmail: "support@printhub.com",
      tieredPricing: DEFAULT_TIERED_SERVICES,
    }));

    // Seed default offers
    const defaultOffers: OfferRecord[] = [
      {
        id: "offer-welcome10",
        code: "WELCOME10",
        name: "Welcome Discount",
        description: "10% off on all services for new customers.",
        discountType: "percentage",
        discountValue: 10,
        applicableServiceIds: [],
        minOrderValue: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 86400000).toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "offer-bulk50",
        code: "BULK50",
        name: "Bulk Print Offer",
        description: "₹50 flat off on orders above ₹500.",
        discountType: "flat",
        discountValue: 50,
        applicableServiceIds: ["a4-bw", "a4-color", "a3-bw", "a3-color", "visiting-cards", "brochures"],
        minOrderValue: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
    defaultOffers.forEach((offer) => {
      tasks.push(dbService.setDocument("offers", offer.id, offer));
    });

    defaultOrders.forEach((order) => {
      tasks.push(dbService.setDocument("orders", order.id, order));
    });
    defaultSlides.forEach((slide) => {
      tasks.push(dbService.setDocument("carousel", slide.id, slide));
    });

    await Promise.all(tasks);
  },

  // Query documents with filters
  queryDocuments: async <T>(collName: string, filters: { field: string; operator: "==" | ">" | "<" | "array-contains"; value: any }[]): Promise<T[]> => {
    if (isFirebaseEnabled) {
      let q = query(collection(firebaseDb!, collName));
      filters.forEach(f => {
        q = query(q, where(f.field, f.operator, f.value));
      });
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
    } else {
      const collectionData = (getLocalData(collName) || []) as any[];
      return collectionData.filter(item => {
        return filters.every(f => {
          if (f.operator === "==") return item[f.field] === f.value;
          if (f.operator === ">") return item[f.field] > f.value;
          if (f.operator === "<") return item[f.field] < f.value;
          if (f.operator === "array-contains") return Array.isArray(item[f.field]) && item[f.field].includes(f.value);
          return false;
        });
      }) as T[];
    }
  }
};

// 3. STORAGE SERVICES (FILE UPLOAD)
export const storageService = {
  uploadFile: (
    file: File, 
    path: string, 
    onProgress: (progress: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (isFirebaseEnabled) {
        const storageRef = ref(firebaseStorage!, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          },
          (error) => {
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          }
        );
      } else {
        // Mock upload: Simulate progress and return standard Data URI or Object URL
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          onProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            
            // Create a fake URL using URL.createObjectURL or standard visual asset
            try {
              const fileUrl = URL.createObjectURL(file);
              resolve(fileUrl);
            } catch (err) {
              resolve(`https://firebasestorage.googleapis.com/v0/b/printhub-mock/o/${encodeURIComponent(file.name)}?alt=media`);
            }
          }
        }, 150);
      }
    });
  }
};
