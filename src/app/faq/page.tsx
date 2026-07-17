"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { HelpCircle, ChevronRight } from "lucide-react";
import { dbService } from "@/lib/firebase";
import { FAQRecord } from "@/types";

const LOCAL_FAQS: FAQRecord[] = [
  { id: "local-1", q: "What file formats do you accept for document printing?", a: "We support PDF, DOCX, PPTX, XLSX, PNG, JPG, and JPEG. For thesis papers and multi-page manuals, we strongly recommend exporting your files as PDF first to ensure your layouts, margins, and fonts are preserved exactly.", displayOnFrontEnd: true, createdAt: "", order: 1 },
  { id: "local-2", q: "What is the maximum file size I can upload?", a: "Our file upload system supports files up to 500 MB. This easily accommodates large high-resolution vectors, blueprints, and multi-hundred-page research project volumes.", displayOnFrontEnd: true, createdAt: "", order: 2 },
  { id: "local-3", q: "How does the dynamic pricing calculator work?", a: "The pricing engine calculates costs in real-time based on A4/A3 dimension parameters, single or double-sided configuration, color format (color prints require specialized ink channels and cost more), lamination choices, and binding types (such as spiral binders). The final price is multiplied by the number of copies.", displayOnFrontEnd: true, createdAt: "", order: 3 },
  { id: "local-4", q: "How can I track my order status?", a: "Once you submit an order, you will receive a unique Order ID (e.g., PH-9821). You can input this ID on our Track Order page at any time to see its exact status: Pending, Payment Received, Processing, Designing, Printing, Ready for Pickup, Shipped, or Delivered.", displayOnFrontEnd: true, createdAt: "", order: 4 },
  { id: "local-5", q: "What is the Magic Mug and how does it work?", a: "A Magic Mug is a ceramic mug coated with a heat-sensitive layer. When cold, it displays a solid black layout. When you pour in hot liquid (tea, coffee, hot water), the black coating becomes transparent, revealing your custom printed high-definition photo or text underneath!", displayOnFrontEnd: true, createdAt: "", order: 5 },
  { id: "local-6", q: "What payment gateways are supported?", a: "We support Stripe, Razorpay (for card payments, NetBanking, wallets), and UPI QR Scan codes. If you select UPI QR, the system generates a dynamic scan code for you to scan and make payments using apps like GooglePay, PhonePe, or Paytm.", displayOnFrontEnd: true, createdAt: "", order: 6 },
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFAQs = async () => {
    try {
      const data = await dbService.getCollection<FAQRecord>("faqs");
      const active = data
        .filter((faq) => faq.displayOnFrontEnd)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      // Fall back to local FAQs if database has none
      setFaqs(active.length > 0 ? active : LOCAL_FAQS);
    } catch (err) {
      console.error("Failed to load FAQs:", err);
      setFaqs(LOCAL_FAQS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();

    window.addEventListener("printhub_settings_updated", fetchFAQs);
    window.addEventListener("storage", fetchFAQs);
    return () => {
      window.removeEventListener("printhub_settings_updated", fetchFAQs);
      window.removeEventListener("storage", fetchFAQs);
    };
  }, []);

  return (
    <>
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            Find instant answers to common queries about print quality, customized gifts, checkout, and tracking.
          </p>
        </div>

        {/* Exclusive accordions scoped by name="faq" (Native HTML API from Web Guidance) */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border-zinc-200/60 dark:border-zinc-800/80">
            <p className="text-zinc-500">No FAQs available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={faq.id}
                name="faq"
                className="group glass-panel rounded-2xl p-6 border-zinc-200/60 dark:border-zinc-800/80 open:border-indigo-500/30 transition-colors duration-300 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between font-bold text-base sm:text-lg cursor-pointer select-none list-none text-zinc-900 dark:text-zinc-100 focus:outline-none focus:text-indigo-600 dark:focus:text-indigo-400">
                  <span>{faq.q}</span>
                  <ChevronRight className="h-5 w-5 text-zinc-400 group-open:rotate-95 transition-transform duration-200 flex-shrink-0 ml-4" />
                </summary>
                <div className="mt-4 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-4 animate-fade-in whitespace-pre-wrap">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
