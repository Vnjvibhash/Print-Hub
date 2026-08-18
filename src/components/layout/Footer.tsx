"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Printer, Mail, Phone, MapPin, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail("");
    setTimeout(() => setSubscribed(false), 6000);
  };

  const servicesLinks = [
    { name: "Document Printing (A4/A3)", href: "/services" },
    { name: "Custom T-Shirts & Apparel", href: "/customizer?type=tshirt" },
    { name: "Ceramic & Magic Mugs", href: "/customizer?type=mug" },
    { name: "Business Cards & Stationery", href: "/services" },
    { name: "Custom Keychains & Frames", href: "/customizer?type=keychain" },
  ];

  const supportLinks = [
    { name: "Track Live Order", href: "/track" },
    { name: "Transparent Pricing Guide", href: "/pricing" },
    { name: "Help Center & FAQs", href: "/faq" },
    { name: "Contact & Store Location", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ];

  return (
    <footer className="bg-zinc-50 dark:bg-[#040408] border-t border-zinc-200/80 dark:border-white/[0.08] transition-colors mt-auto z-10">
      {/* Newsletter / Exclusive Offers Section */}
      <div className="border-b border-zinc-200/80 dark:border-white/[0.06] py-10 bg-white/50 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h4 className="text-lg font-black text-zinc-900 dark:text-white">
                Get 10% Off Your First Bulk Printing Order
              </h4>
              <p className="text-xs text-zinc-500 mt-1">
                Subscribe to our newsletter for exclusive student discounts, corporate promos, and print tips.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex items-center w-full max-w-md gap-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your work or university email..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0a0a12] text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 flex-shrink-0"
              >
                <span>Join</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
          {subscribed && (
            <p className="text-center text-xs font-bold text-emerald-500 mt-3">
              ✓ You&apos;re subscribed! Use code WELCOME10 at checkout for 10% off.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Printer className="h-4.5 w-4.5" />
              </div>
              <span className="font-black">SUVIR<span className="text-zinc-900 dark:text-white font-semibold"> Printing</span></span>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Industrial grade color printing, dissertation bindings, luxury stationery, and bespoke DTF apparel merchandise.
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>GST Registered: 27AAAAA1111A1Z1</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                <span>ISO 9001 Color Calibrated Press</span>
              </div>
            </div>
          </div>

          {/* Column 2: Popular Services */}
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-widest mb-4">
              Print Services
            </h3>
            <ul className="space-y-2.5">
              {servicesLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Support */}
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-widest mb-4">
              Support & Track
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-widest mb-4">
              Connect With Us
            </h3>
            <div className="flex items-start space-x-2.5 text-xs text-zinc-500 dark:text-zinc-400">
              <MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <span>102, Digital Towers, Sector 62, Noida, UP - 201301</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Mail className="h-4 w-4 text-indigo-500 flex-shrink-0" />
              <a href="mailto:support@suvirprinting.com" className="hover:underline">support@suvirprinting.com</a>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Phone className="h-4 w-4 text-indigo-500 flex-shrink-0" />
              <a href="tel:+919876543210" className="hover:underline">+91 98765 43210</a>
            </div>

            {/* Payment Gateway Trust Badges */}
            <div className="pt-3">
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-2">Accepted Payment Channels</p>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                <span className="px-2 py-1 rounded bg-zinc-200/60 dark:bg-white/5 border border-zinc-300/60 dark:border-white/5">UPI QR</span>
                <span className="px-2 py-1 rounded bg-zinc-200/60 dark:bg-white/5 border border-zinc-300/60 dark:border-white/5">Visa</span>
                <span className="px-2 py-1 rounded bg-zinc-200/60 dark:bg-white/5 border border-zinc-300/60 dark:border-white/5">Mastercard</span>
                <span className="px-2 py-1 rounded bg-zinc-200/60 dark:bg-white/5 border border-zinc-300/60 dark:border-white/5">Stripe</span>
                <span className="px-2 py-1 rounded bg-zinc-200/60 dark:bg-white/5 border border-zinc-300/60 dark:border-white/5">Razorpay</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-200/80 dark:border-white/[0.08] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-400 space-y-4 md:space-y-0">
          <div>
            &copy; {currentYear} SUVIR Printing. All rights reserved. Precision digital print solutions.
          </div>
          <div className="flex space-x-6">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-indigo-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
