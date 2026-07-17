"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/firebase";
import { ReviewRecord } from "@/types";
import {
  Check,
  X,
  Trash2,
  Edit3,
  MessageSquare,
  Eye,
  EyeOff,
  Star,
  Save,
} from "lucide-react";

const LOCAL_TESTIMONIALS: ReviewRecord[] = [
  {
    id: "rev-1",
    customerId: "user-customer",
    customerName: "Rahul Verma",
    customerRole: "PhD Scholar",
    rating: 5,
    comment: "Printed my complete doctoral thesis here. The spiral binding is sturdy and A4 color page quality is stellar. Finished in less than 2 hours!",
    serviceId: "a4-color",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rev-2",
    customerId: "user-customer",
    customerName: "Sneha Kapoor",
    customerRole: "Brand Manager",
    rating: 5,
    comment: "Ordered 500 visiting cards and customized hoodies for our startup crew. Colors match our branding exactly and prints are very durable.",
    serviceId: "visiting-cards",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rev-3",
    customerId: "user-customer",
    customerName: "Amit Joshi",
    customerRole: "Gift Shop Owner",
    rating: 5,
    comment: "The Magic Mugs are a bestseller. The transition is smooth and prints look premium. The bulk billing tools make tracking payments a breeze.",
    serviceId: "mug-print",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rev-4",
    customerId: "user-customer",
    customerName: "Priya Sharma",
    customerRole: "Delhi University Student",
    rating: 5,
    comment: "Got my semester study guides printed and spiral bound. Extremely cost-effective for students, and fast delivery too!",
    serviceId: "a4-bw",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rev-5",
    customerId: "user-customer",
    customerName: "Vikram Malhotra",
    customerRole: "Tech Startup Founder",
    rating: 5,
    comment: "Ordered custom hoodies and letterheads for our team. The print quality is premium and customer support was very helpful.",
    serviceId: "hoodie-print",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rev-6",
    customerId: "user-customer",
    customerName: "Ananya Patel",
    customerRole: "Freelance Designer",
    rating: 4,
    comment: "Excellent sticker sheet and vinyl printing. Clean cuts and vivid colors. Perfect for packaging labels.",
    serviceId: "vinyl-sheet",
    approved: true,
    createdAt: new Date().toISOString(),
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewRecord | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerRole: "",
    rating: 5,
    comment: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dbService.getCollection<ReviewRecord>("reviews");
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReviews(sorted.length > 0 ? sorted : LOCAL_TESTIMONIALS);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setReviews(LOCAL_TESTIMONIALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleApproval = async (review: ReviewRecord) => {
    const updated = { ...review, approved: !review.approved };
    try {
      await dbService.setDocument("reviews", review.id, updated);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? updated : r))
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("printhub_settings_updated"));
      }
    } catch (err) {
      console.error("Failed to update approval status:", err);
    }
  };

  const openEditModal = (review: ReviewRecord) => {
    setEditingReview(review);
    setFormData({
      customerName: review.customerName,
      customerRole: review.customerRole || "",
      rating: review.rating,
      comment: review.comment,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingReview) return;
    setSaving(true);
    try {
      const record: ReviewRecord = {
        ...editingReview,
        customerName: formData.customerName.trim(),
        customerRole: formData.customerRole.trim() || "Customer",
        rating: formData.rating,
        comment: formData.comment.trim(),
      };
      await dbService.setDocument("reviews", editingReview.id, record);
      setReviews((prev) =>
        prev.map((r) => (r.id === editingReview.id ? record : r))
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("printhub_settings_updated"));
      }
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save review:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await dbService.deleteDocument("reviews", reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setDeleteConfirm(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("printhub_settings_updated"));
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };

  return (
    <div className="space-y-6 page-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Reviews Manager</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Approve, edit, or delete customer reviews displayed on the website.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-16 text-center">
          <MessageSquare className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`rounded-2xl border overflow-hidden transition-all bg-white/[0.02] border-white/5 ${
                rev.approved ? "" : "border-amber-500/20 bg-amber-500/[0.01]"
              }`}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Review summary info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {rev.customerName}
                    </h3>
                    <span className="text-xs text-zinc-550">•</span>
                    <span className="text-xs text-zinc-400">
                      {rev.customerRole || "Customer"}
                    </span>
                    <span className="text-xs text-zinc-550">•</span>
                    <div className="flex items-center text-amber-500 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < rev.rating ? "fill-amber-500" : "text-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-350 leading-relaxed italic mt-1.5">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-[10px] text-zinc-550">
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[8px] ${
                        rev.approved
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                      }`}
                    >
                      {rev.approved ? "Approved" : "Pending Approval"}
                    </span>
                    <span>•</span>
                    <span>ID: {rev.id}</span>
                    <span>•</span>
                    <span>Submitted: {new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleApproval(rev)}
                    title={rev.approved ? "Hide from Website" : "Display on Website"}
                    className={`p-2 rounded-lg transition ${
                      rev.approved
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-white/5 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {rev.approved ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(rev)}
                    className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-indigo-400 transition"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  {deleteConfirm === rev.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(rev.id)}
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
                      onClick={() => setDeleteConfirm(rev.id)}
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

      {/* Edit Review Form Modal */}
      {showModal && (
        <div
          className="fixed top-0 bottom-0 right-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          style={{ left: "var(--sidebar-width)" }}
        >
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-white">Edit Review</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-grow text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, customerName: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-200 focus:outline-none focus:border-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">
                    Customer Role
                  </label>
                  <input
                    type="text"
                    value={formData.customerRole}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, customerRole: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-200 focus:outline-none focus:border-indigo-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, rating: star }))}
                      className="p-1 text-amber-500"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= formData.rating ? "fill-amber-500" : "text-zinc-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">
                  Review Comment *
                </label>
                <textarea
                  rows={4}
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, comment: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-200 focus:outline-none focus:border-indigo-500/30 resize-none"
                />
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
                disabled={saving || !formData.customerName.trim() || !formData.comment.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-40"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
