"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/home/HeroCarousel";
import { motion } from "framer-motion";
import { calculatePricing, loadPricingFromFirestore } from "@/lib/pricing";
import { dbService } from "@/lib/firebase";
import { ReviewRecord } from "@/types";
import { 
  Upload, 
  ShoppingBag, 
  ArrowRight, 
  Printer, 
  CreditCard, 
  CheckCircle,
  TrendingUp, 
  Star,
  Layers,
  Sparkles,
  BookOpen,
  GraduationCap,
  Calculator
} from "lucide-react";

const LOCAL_TESTIMONIALS: ReviewRecord[] = [
  {
    id: "local-rev-1",
    customerId: "local-user-1",
    customerName: "Rahul Verma",
    customerRole: "PhD Scholar",
    rating: 5,
    comment: "Printed my complete doctoral thesis here. The spiral binding is sturdy and A4 color page quality is stellar. Finished in less than 2 hours!",
    serviceId: "a4-color",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "local-rev-2",
    customerId: "local-user-2",
    customerName: "Sneha Kapoor",
    customerRole: "Brand Manager",
    rating: 5,
    comment: "Ordered 500 visiting cards and customized hoodies for our startup crew. Colors match our branding exactly and prints are very durable.",
    serviceId: "visiting-cards",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "local-rev-3",
    customerId: "local-user-3",
    customerName: "Amit Joshi",
    customerRole: "Gift Shop Owner",
    rating: 5,
    comment: "The Magic Mugs are a bestseller. The transition is smooth and prints look premium. The bulk billing tools make tracking payments a breeze.",
    serviceId: "mug-print",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "local-rev-4",
    customerId: "local-user-4",
    customerName: "Priya Sharma",
    customerRole: "Delhi University Student",
    rating: 5,
    comment: "Got my semester study guides printed and spiral bound. Extremely cost-effective for students, and fast delivery too!",
    serviceId: "a4-bw",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "local-rev-5",
    customerId: "local-user-5",
    customerName: "Vikram Malhotra",
    customerRole: "Tech Startup Founder",
    rating: 5,
    comment: "Ordered custom hoodies and letterheads for our team. The print quality is premium and customer support was very helpful.",
    serviceId: "hoodie-print",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "local-rev-6",
    customerId: "local-user-6",
    customerName: "Ananya Patel",
    customerRole: "Freelance Designer",
    rating: 4,
    comment: "Excellent sticker sheet and vinyl printing. Clean cuts and vivid colors. Perfect for packaging labels.",
    serviceId: "vinyl-sheet",
    approved: true,
    createdAt: new Date().toISOString(),
  },
];

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
  };

  const services = [
    { id: "a4-print", title: "Document & PDF Printing", desc: "A4/A3 B&W and high-speed color laser printing for reports, legal docs, manuals and notes.", icon: Printer, price: "from ₹1.20/pg", tag: "Fastest Turnaround", href: "/pricecalculator" },
    { id: "book-print", title: "Book & Novel Printing", desc: "Softcover perfect bound books with wrap-around full color laminated covers.", icon: BookOpen, price: "from ₹80/copy", tag: "Authors & Publishers", href: "/pricecalculator" },
    { id: "thesis-print", title: "Thesis Hardbound Binding", desc: "Official academic leatherette hardbound thesis with gold foil letter embossing.", icon: GraduationCap, price: "from ₹250/copy", tag: "PhD & University", href: "/pricecalculator" },
    { id: "visiting-cards", title: "Visiting Cards & Stationery", desc: "Premium 350 GSM matte/gloss cards, letterheads, envelopes and corporate folders.", icon: Layers, price: "from ₹1.50/card", tag: "B2B Corporate", href: "/services" },
    { id: "tshirt-print", title: "Custom DTF Apparel", desc: "Vibrant direct-to-film printing on 100% combed cotton T-shirts and hoodies.", icon: Sparkles, price: "from ₹350/unit", tag: "Merch Studio", href: "/customizer?type=tshirt" },
    { id: "mug-print", title: "Customized Photo Gifts", desc: "Ceramic coffee mugs, heat-reactive magic mugs, pillows, frames and keychains.", icon: ShoppingBag, price: "from ₹150/unit", tag: "Personalized", href: "/customizer?type=mug" }
  ];

  const workflowSteps = [
    { number: "01", title: "Choose Your Service", desc: "Select from standard prints, business stationery, or custom merch.", icon: Printer },
    { number: "02", title: "Upload Design or Files", desc: "Drag and drop your PDF, DOCX, PNG, or JPEG. Use our live customizer.", icon: Upload },
    { number: "03", title: "Instant Payment", desc: "Secure checkout using Stripe, Razorpay, or scans with UPI QR.", icon: CreditCard },
    { number: "04", title: "Track & Collect", desc: "Get real-time SMS/email status alerts as your order progresses.", icon: CheckCircle }
  ];

  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Review Form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRole, setReviewRole] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [paperSize, setPaperSize] = useState<"A4" | "A3">("A4");
  const [colorMode, setColorMode] = useState<"bw" | "color">("bw");
  const [binding, setBinding] = useState<"none" | "spiral" | "lamination">("none");
  const [copies, setCopies] = useState<number>(100);
  const [pages, setPages] = useState<number>(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const [settingsVersion, setSettingsVersion] = useState(0);

  const fetchReviews = async () => {
    try {
      const data = await dbService.getCollection<ReviewRecord>("reviews");
      const activeReviews = data.filter((r) => r.approved !== false);
      const sorted = activeReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(sorted.length > 0 ? sorted : LOCAL_TESTIMONIALS);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setReviews(LOCAL_TESTIMONIALS);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const triggerUpdate = () => setSettingsVersion((prev) => prev + 1);

    const initEstimator = async () => {
      try {
        await Promise.all([loadPricingFromFirestore(), fetchReviews()]);
      } catch (err) {
        console.error("Failed to load layout data:", err);
      } finally {
        setIsHydrated(true);
        triggerUpdate();
      }
    };

    initEstimator();

    window.addEventListener("printhub_settings_updated", triggerUpdate);
    window.addEventListener("storage", triggerUpdate);

    return () => {
      window.removeEventListener("printhub_settings_updated", triggerUpdate);
      window.removeEventListener("storage", triggerUpdate);
    };
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const newId = `rev-${Date.now().toString(36)}`;
      const record: ReviewRecord = {
        id: newId,
        customerId: "anonymous",
        customerName: reviewName.trim(),
        customerRole: reviewRole.trim() || "Customer",
        rating: reviewRating,
        comment: reviewComment.trim(),
        serviceId: "general",
        approved: true, // starts approved so it displays instantly on Home screen
        createdAt: new Date().toISOString(),
      };
      await dbService.setDocument("reviews", newId, record);
      setReviews((prev) => [record, ...prev]);
      setReviewSuccess(true);
      setReviewName("");
      setReviewRole("");
      setReviewRating(5);
      setReviewComment("");
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Auto-scroll reviews carousel
  const reviewsScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = reviewsScrollRef.current;
    if (!container || reviews.length === 0) return;
    const interval = setInterval(() => {
      if (!container) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 2) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: 340, behavior: "smooth" });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [reviews]);

  const estimatorServiceId = useMemo(() => {
    const sizeKey = paperSize.toLowerCase();
    return `${sizeKey}-${colorMode}`;
  }, [paperSize, colorMode]);

  const priceBreakdown = useMemo(() => {
    void settingsVersion;
    return calculatePricing(
      estimatorServiceId,
      1,
      {
        pages,
        copies,
        sides: "single",
        binding,
      },
      isHydrated
    );
  }, [estimatorServiceId, copies, pages, binding, isHydrated, settingsVersion]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#07070a] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />
      
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* International Trust Ticker Bar */}
      <section className="border-y border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50/70 dark:bg-white/[0.02] py-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x-0 md:divide-x divide-zinc-200 dark:divide-white/5">
            <div className="flex items-center justify-center gap-2.5 py-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Star className="h-4 w-4 fill-amber-500" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-900 dark:text-white">4.9 / 5.0 Star Rating</p>
                <p className="text-[10px] text-zinc-500">Over 15,000+ orders verified</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 py-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Printer className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-900 dark:text-white">High-Speed Digital Press</p>
                <p className="text-[10px] text-zinc-500">Same-day dispatch available</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 py-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-900 dark:text-white">100% Quality Guaranteed</p>
                <p className="text-[10px] text-zinc-500">Free reprint if not satisfied</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 py-1">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-900 dark:text-white">Live Design Customizer</p>
                <p className="text-[10px] text-zinc-500">Preview mugs, shirts & stationery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Featured Services Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
              Explore Our Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              Engineered For High Precision
            </h2>
          </div>
          <Link
            href="/services"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            <span>View all printing categories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((svc) => {
            const IconComponent = svc.icon;
            return (
              <motion.div
                key={svc.id}
                variants={itemVariants}
                className="group relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 border border-zinc-200/80 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] hover:border-indigo-500/40 hover:bg-white dark:hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {svc.tag}
                    </span>
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{svc.price}</span>
                  </div>

                  <div className="mt-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-7 w-7" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {svc.desc}
                  </p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-zinc-200/60 dark:border-white/5 flex items-center justify-between">
                  <Link
                    href={svc.href || "/services"}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Instant Calculator & Order</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="In Stock / Ready" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Interactive Live Price Estimator Studio */}
      <section className="py-24 bg-zinc-50/70 dark:bg-zinc-950/40 border-y border-zinc-200/80 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Description Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="h-3.5 w-3.5" />
                Instant Live Pricing Studio
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                Calculate Exact Costs in Real Time
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Tired of waiting for quotes? Our dynamic calculator calculates paper size, color calibration, lamination, and spiral binding costs instantly with full GST transparency.
              </p>
              
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <span>A4 B&W from ₹2.00 / page &bull; Color from ₹10.00 / page</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <span>A3 Large Form B&W from ₹5.00 &bull; Color from ₹20.00</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <span>Automatic volume discounts on 100+ copies</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/pricecalculator"
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition shadow-lg shadow-indigo-500/25 active:scale-95 inline-flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Launch Advanced Calculator</span>
                </Link>
                <Link
                  href="/pricing"
                  className="px-6 py-3.5 rounded-2xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-200 font-bold text-sm transition"
                >
                  Rate Card
                </Link>
              </div>
            </div>
            
            {/* Right Estimator Card */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl p-7 sm:p-9 border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#0c0c14] shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
                <div className="flex items-center justify-between pb-5 border-b border-zinc-100 dark:border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Quick Price Estimator</h3>
                    <p className="text-xs text-zinc-500">Live computation engine</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                    Interactive
                  </span>
                </div>

                <div className="space-y-5 mt-6">
                  {/* Paper Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Paper Dimension</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaperSize("A4")}
                        className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                          paperSize === "A4"
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/15 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm">A4 Standard</p>
                          <p className="text-[10px] text-zinc-400">210 &times; 297 mm</p>
                        </div>
                        {paperSize === "A4" && <CheckCircle className="h-4 w-4 text-indigo-500" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaperSize("A3")}
                        className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                          paperSize === "A3"
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/15 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm">A3 Large Format</p>
                          <p className="text-[10px] text-zinc-400">297 &times; 420 mm</p>
                        </div>
                        {paperSize === "A3" && <CheckCircle className="h-4 w-4 text-indigo-500" />}
                      </button>
                    </div>
                  </div>

                  {/* Color & Binding */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Color Format</label>
                      <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-white/5 p-1.5 rounded-2xl border border-zinc-200/60 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => setColorMode("bw")}
                          className={`py-2 rounded-xl text-xs font-bold transition ${
                            colorMode === "bw"
                              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          Black & White
                        </button>
                        <button
                          type="button"
                          onClick={() => setColorMode("color")}
                          className={`py-2 rounded-xl text-xs font-bold transition ${
                            colorMode === "color"
                              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          Full Color
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Finishing / Binding</label>
                      <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 dark:bg-white/5 p-1.5 rounded-2xl border border-zinc-200/60 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => setBinding("none")}
                          className={`py-2 rounded-xl text-[11px] font-bold transition ${
                            binding === "none"
                              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          None
                        </button>
                        <button
                          type="button"
                          onClick={() => setBinding("spiral")}
                          className={`py-2 rounded-xl text-[11px] font-bold transition ${
                            binding === "spiral"
                              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          Spiral
                        </button>
                        <button
                          type="button"
                          onClick={() => setBinding("lamination")}
                          className={`py-2 rounded-xl text-[11px] font-bold transition ${
                            binding === "lamination"
                              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          Laminate
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pages and Copies Steppers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Pages in File</label>
                      <div className="flex items-center rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setPages(Math.max(1, pages - 1))}
                          className="px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 text-zinc-600 dark:text-zinc-300 font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={pages}
                          onChange={(e) => setPages(Math.max(1, Number(e.target.value) || 1))}
                          className="w-full text-center py-2 bg-transparent text-sm font-bold text-zinc-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setPages(pages + 1)}
                          className="px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 text-zinc-600 dark:text-zinc-300 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Copies</label>
                      <div className="flex items-center rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setCopies(Math.max(1, copies - 10))}
                          className="px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 text-zinc-600 dark:text-zinc-300 font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={copies}
                          onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))}
                          className="w-full text-center py-2 bg-transparent text-sm font-bold text-zinc-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setCopies(copies + 10)}
                          className="px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 text-zinc-600 dark:text-zinc-300 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total Computation Box */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 mt-6">
                    <div>
                      <p className="text-xs text-zinc-500">Estimated Total for {copies} copies &times; {pages} pages</p>
                      <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                        ₹{priceBreakdown.total.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Subtotal: ₹{priceBreakdown.subtotal.toFixed(2)} + GST 18%: ₹{priceBreakdown.gst.toFixed(2)}</p>
                    </div>

                    <Link
                      href="/services"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 active:scale-95 transition"
                    >
                      <span>Proceed with this Spec</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Workflow */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
            Streamlined Ordering
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            From File to Print in 4 Steps
          </h2>
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
            Experience frictionless digital document printing, apparel customization, and swift door delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {workflowSteps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div key={idx} className="relative rounded-3xl p-7 border border-zinc-200/80 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] flex flex-col items-center text-center">
                <span className="absolute top-4 right-5 text-2xl font-black text-zinc-200 dark:text-zinc-800 select-none">
                  {step.number}
                </span>
                
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                  <IconComponent className="h-7 w-7" />
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Customer Reviews & Interactive Feedback Section */}
      <section className="py-24 bg-zinc-50/70 dark:bg-zinc-950/40 border-t border-zinc-200/80 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
              <Star className="h-3 w-3 fill-current" />
              Verified Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              Loved by Researchers & Creators
            </h2>
            <p className="mt-3 text-sm text-zinc-500">
              Trusted by 10,000+ university scholars, creative designers, and business managers.
            </p>
          </div>

          {/* Testimonial Cards Carousel */}
          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-52 rounded-3xl bg-zinc-100 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div
              ref={reviewsScrollRef}
              className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
            >
              {reviews.map((test) => (
                <div
                  key={test.id}
                  className="rounded-3xl p-7 border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#0c0c14] min-w-[320px] max-w-[380px] flex-shrink-0 snap-start shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-1 text-amber-500 mb-4">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                      &ldquo;{test.comment}&rdquo;
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {test.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{test.customerName}</h4>
                      <p className="text-xs text-zinc-400 truncate">{test.customerRole || "Verified Customer"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Write a Review Studio */}
          <div className="mt-16 max-w-2xl mx-auto rounded-3xl p-8 border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#0c0c14] shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">Share Your Feedback</h3>
              <p className="text-xs text-zinc-500 mt-1">Help others discover our print precision</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="e.g. Dr. Aryan Sharma"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-transparent text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5">Role / University / Org</label>
                  <input
                    type="text"
                    value={reviewRole}
                    onChange={(e) => setReviewRole(e.target.value)}
                    placeholder="e.g. Professor, AIIMS / Founder"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-transparent text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5">Rating</label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${star <= reviewRating ? "text-amber-500 fill-amber-500" : "text-zinc-300 dark:text-zinc-700"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5">Review Experience *</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about print sharpness, paper thickness, or delivery speed..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-transparent text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {reviewSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                  ✓ Review submitted! Thank you for supporting SUVIR Printing.
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReview || !reviewName.trim() || !reviewComment.trim()}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                {submittingReview ? "Submitting..." : "Post Verified Review"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
