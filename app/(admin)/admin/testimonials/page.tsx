"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  MessageSquareQuote,
} from "lucide-react";

interface Testimonial {
  id: string;
  studentName: string;
  role: string;
  text: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  studentName: "",
  role: "",
  text: "",
  rating: 5,
  isActive: true,
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          id={`star-${star}`}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function DisplayStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      if (data.success) setTestimonials(data.testimonials);
    } catch {
      console.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowModal(true);
  }

  function openEdit(t: Testimonial) {
    setForm({
      studentName: t.studentName,
      role: t.role,
      text: t.text,
      rating: t.rating,
      isActive: t.isActive,
    });
    setEditingId(t.id);
    setError("");
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `/api/admin/testimonials/${editingId}`
        : "/api/admin/testimonials";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setShowModal(false);
      fetchTestimonials();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/testimonials/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchTestimonials();
    } catch {
      console.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const activeCount = testimonials.filter((t) => t.isActive).length;
  const highRatedCount = testimonials.filter((t) => t.rating >= 4).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquareQuote className="w-7 h-7 text-amber-500" />
            <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          </div>
          <p className="text-gray-500 font-medium">
            Manage student testimonials shown on the public website
          </p>
        </div>
        <button
          id="new-testimonial-btn"
          onClick={openCreate}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition shadow whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> New Testimonial
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-gray-900">{testimonials.length}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Total</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-green-600">{activeCount}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Active</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-amber-500">{highRatedCount}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Rating ≥ 4★ (shown on site)</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 fill-amber-500" />
        <div>
          <p className="text-sm font-bold text-amber-800">Website display rule</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Only testimonials with a rating of <strong>4 or 5 stars</strong> will be displayed on the website. The website applies this filter automatically.
          </p>
        </div>
      </div>

      {/* Testimonials Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white border border-dashed rounded-xl py-20 text-center">
          <MessageSquareQuote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-500">No testimonials yet</h3>
          <p className="text-gray-400 mt-1">Click &quot;New Testimonial&quot; to add the first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white border rounded-xl shadow-sm hover:shadow-md transition flex flex-col overflow-hidden"
            >
              {/* Rating + Active badge */}
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <DisplayStars rating={t.rating} />
                <div className="flex items-center gap-2">
                  {t.rating < 4 && (
                    <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">
                      Won&apos;t show (rating &lt; 4)
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      t.isActive
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {t.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Quote */}
              <div className="px-5 flex-1">
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="px-5 py-4 flex items-center gap-3 mt-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-white uppercase text-sm shrink-0">
                  {t.studentName[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.studentName}</p>
                  <p className="text-xs text-gray-500 font-medium">{t.role}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t flex divide-x">
                <button
                  id={`edit-testimonial-${t.id}`}
                  onClick={() => openEdit(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button
                  id={`delete-testimonial-${t.id}`}
                  onClick={() => setDeleteId(t.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Testimonial" : "New Testimonial"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {/* Student Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="testimonial-name-input"
                  type="text"
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  placeholder="e.g. Riya Sharma"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Role / Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="testimonial-role-input"
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Software Engineer Intern"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Testimonial Text */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Testimonial <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="testimonial-text-textarea"
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Student's feedback in their own words..."
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none resize-none"
                  required
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <StarRating
                    value={form.rating}
                    onChange={(v) => setForm({ ...form, rating: v })}
                  />
                  <span className="text-sm font-bold text-gray-700">
                    {form.rating}/5
                  </span>
                  {form.rating < 4 && (
                    <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">
                      Won&apos;t show on website
                    </span>
                  )}
                </div>
              </div>

              {/* Is Active toggle */}
              <div className="bg-gray-50 border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      {form.isActive ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                      Active
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Inactive testimonials are hidden from the website even if rating is high
                    </p>
                  </div>
                  <button
                    type="button"
                    id="testimonial-active-toggle"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                      form.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        form.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  id="testimonial-save-btn"
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Testimonial?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-testimonial-btn"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition text-sm disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
