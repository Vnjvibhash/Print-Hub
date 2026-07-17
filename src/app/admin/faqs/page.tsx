"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/firebase";
import { FAQRecord } from "@/types";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Save,
  HelpCircle,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const LOCAL_FAQS: FAQRecord[] = [
  { id: "faq-1", q: "What file formats do you accept for document printing?", a: "We support PDF, DOCX, PPTX, XLSX, PNG, JPG, and JPEG. For thesis papers and multi-page manuals, we strongly recommend exporting your files as PDF first to ensure your layouts, margins, and fonts are preserved exactly.", displayOnFrontEnd: true, createdAt: new Date().toISOString(), order: 1 },
  { id: "faq-2", q: "What is the maximum file size I can upload?", a: "Our file upload system supports files up to 500 MB. This easily accommodates large high-resolution vectors, blueprints, and multi-hundred-page research project volumes.", displayOnFrontEnd: true, createdAt: new Date().toISOString(), order: 2 },
  { id: "faq-3", q: "How does the dynamic pricing calculator work?", a: "The pricing engine calculates costs in real-time based on A4/A3 dimension parameters, single or double-sided configuration, color format (color prints require specialized ink channels and cost more), lamination choices, and binding types (such as spiral binders). The final price is multiplied by the number of copies.", displayOnFrontEnd: true, createdAt: new Date().toISOString(), order: 3 },
  { id: "faq-4", q: "How can I track my order status?", a: "Once you submit an order, you will receive a unique Order ID (e.g., PH-9821). You can input this ID on our Track Order page at any time to see its exact status: Pending, Payment Received, Processing, Designing, Printing, Ready for Pickup, Shipped, or Delivered.", displayOnFrontEnd: true, createdAt: new Date().toISOString(), order: 4 },
  { id: "faq-5", q: "What is the Magic Mug and how does it work?", a: "A Magic Mug is a ceramic mug coated with a heat-sensitive layer. When cold, it displays a solid black layout. When you pour in hot liquid (tea, coffee, hot water), the black coating becomes transparent, revealing your custom printed high-definition photo or text underneath!", displayOnFrontEnd: true, createdAt: new Date().toISOString(), order: 5 },
  { id: "faq-6", q: "What payment gateways are supported?", a: "We support Stripe, Razorpay (for card payments, NetBanking, wallets), and UPI QR Scan codes. If you select UPI QR, the system generates a dynamic scan code for you to scan and make payments using apps like GooglePay, PhonePe, or Paytm.", displayOnFrontEnd: true, createdAt: new Date().toISOString(), order: 6 },
];

const EMPTY_FAQ: Omit<FAQRecord, "id" | "createdAt"> = {
  q: "",
  a: "",
  displayOnFrontEnd: true,
  order: 1,
};

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQRecord | null>(null);
  const [formData, setFormData] = useState(EMPTY_FAQ);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dbService.getCollection<FAQRecord>("faqs");
      const sorted = data.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setFaqs(sorted.length > 0 ? sorted : LOCAL_FAQS);
    } catch (err) {
      console.error("Failed to load FAQs:", err);
      setFaqs(LOCAL_FAQS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingFAQ(null);
    setFormData({
      ...EMPTY_FAQ,
      order: faqs.length > 0 ? Math.max(...faqs.map((f) => f.order)) + 1 : 1,
    });
    setShowModal(true);
  };

  const openEditModal = (faq: FAQRecord) => {
    setEditingFAQ(faq);
    setFormData({
      q: faq.q,
      a: faq.a,
      displayOnFrontEnd: faq.displayOnFrontEnd,
      order: faq.order || 1,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.q.trim() || !formData.a.trim()) return;
    setSaving(true);
    try {
      if (editingFAQ) {
        const record: FAQRecord = {
          ...formData,
          id: editingFAQ.id,
          createdAt: editingFAQ.createdAt,
        };
        await dbService.setDocument("faqs", editingFAQ.id, record);
        setFaqs((prev) =>
          prev
            .map((f) => (f.id === editingFAQ.id ? record : f))
            .sort((a, b) => a.order - b.order)
        );
      } else {
        const newId = `faq-${Date.now().toString(36)}`;
        const record: FAQRecord = {
          ...formData,
          id: newId,
          createdAt: new Date().toISOString(),
        };
        await dbService.setDocument("faqs", newId, record);
        setFaqs((prev) => [...prev, record].sort((a, b) => a.order - b.order));
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("printhub_settings_updated"));
      }
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save FAQ:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (faqId: string) => {
    try {
      await dbService.deleteDocument("faqs", faqId);
      setFaqs((prev) => prev.filter((f) => f.id !== faqId));
      setDeleteConfirm(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("printhub_settings_updated"));
      }
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
    }
  };

  const toggleDisplay = async (faq: FAQRecord) => {
    const updated = { ...faq, displayOnFrontEnd: !faq.displayOnFrontEnd };
    await dbService.setDocument("faqs", faq.id, updated);
    setFaqs((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("printhub_settings_updated"));
    }
  };

  const changeOrder = async (faq: FAQRecord, direction: "up" | "down") => {
    const index = faqs.findIndex((f) => f.id === faq.id);
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === faqs.length - 1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const sibling = faqs[swapIndex];

    const currentOrder = faq.order;
    const siblingOrder = sibling.order;

    // Sibling swap order values
    const updatedCurrent = { ...faq, order: siblingOrder };
    const updatedSibling = { ...sibling, order: currentOrder };

    try {
      await Promise.all([
        dbService.setDocument("faqs", faq.id, updatedCurrent),
        dbService.setDocument("faqs", sibling.id, updatedSibling),
      ]);

      setFaqs((prev) =>
        prev
          .map((f) => {
            if (f.id === faq.id) return updatedCurrent;
            if (f.id === sibling.id) return updatedSibling;
            return f;
          })
          .sort((a, b) => a.order - b.order)
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("printhub_settings_updated"));
      }
    } catch (err) {
      console.error("Failed to reorder FAQs:", err);
    }
  };

  return (
    <div className="space-y-6 page-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">FAQs Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Configure the Frequently Asked Questions shown on the customer portal.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20"
        >
          <Plus className="h-4 w-4" />
          Add FAQ
        </button>
      </div>

      {/* FAQs List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-16 text-center">
          <HelpCircle className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No FAQs found. Add one to display on the website.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={`rounded-2xl border overflow-hidden transition-all bg-white/[0.02] border-white/5 ${
                faq.displayOnFrontEnd ? "" : "opacity-50"
              }`}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Reordering indicators */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => changeOrder(faq, "up")}
                    disabled={index === 0}
                    className="p-1 text-zinc-500 hover:text-white hover:bg-white/5 disabled:opacity-20 rounded-md transition"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => changeOrder(faq, "down")}
                    disabled={index === faqs.length - 1}
                    className="p-1 text-zinc-500 hover:text-white hover:bg-white/5 disabled:opacity-20 rounded-md transition"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="font-bold text-indigo-400 text-xs mt-0.5 select-none">Q:</span>
                    <h3 className="text-sm font-bold text-white leading-tight">{faq.q}</h3>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="font-bold text-zinc-500 select-none">A:</span>
                    <p className="leading-relaxed whitespace-pre-wrap">{faq.a}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-500">
                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono">
                      Order: {faq.order}
                    </span>
                    <span>•</span>
                    <span>Created: {new Date(faq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleDisplay(faq)}
                    title={faq.displayOnFrontEnd ? "Visible on Frontend" : "Hidden from Frontend"}
                    className={`p-2 rounded-lg transition ${
                      faq.displayOnFrontEnd
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-white/5 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {faq.displayOnFrontEnd ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-indigo-400 transition"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  {deleteConfirm === faq.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-2 rounded-lg bg-rose-500/20 text-rose-400"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="p-2 rounded-lg hover:bg-white/10 text-zinc-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(faq.id)}
                      className="p-2 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQ Form Modal */}
      {showModal && (
        <div
          className="fixed top-0 bottom-0 right-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          style={{ left: "var(--sidebar-width)" }}
        >
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-white">
                {editingFAQ ? "Edit FAQ" : "Create New FAQ"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-grow text-xs sm:text-sm">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">
                  Question *
                </label>
                <input
                  type="text"
                  value={formData.q}
                  onChange={(e) => setFormData((p) => ({ ...p, q: e.target.value }))}
                  placeholder="e.g. What is your turnaround time?"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-indigo-500/30"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  value={formData.a}
                  onChange={(e) => setFormData((p) => ({ ...p, a: e.target.value }))}
                  placeholder="Provide details..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-200 focus:outline-none focus:border-indigo-500/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">
                    Order index
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 1 }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-200 focus:outline-none focus:border-indigo-500/30"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 py-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.displayOnFrontEnd}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, displayOnFrontEnd: e.target.checked }))
                      }
                      className="w-4 h-4 rounded border-zinc-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 bg-transparent"
                    />
                    <span className="text-zinc-300 font-medium">Display on Front End</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 border border-white/5 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.q.trim() || !formData.a.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-40"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : editingFAQ ? "Update FAQ" : "Create FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
