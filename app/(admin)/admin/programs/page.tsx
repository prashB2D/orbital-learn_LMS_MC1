"use client";

import { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import {
  Layers, Plus, Pencil, Trash2, Lock, Unlock, Eye, EyeOff,
  X, Calendar, Clock, ChevronDown, AlertTriangle, Timer, CheckCircle2, Hourglass, ImagePlus, ListChecks,
} from "lucide-react";

type ProgramType = "SUMMER" | "WINTER" | "WORKSHOP";

interface Program {
  id: string;
  type: ProgramType;
  title: string;
  duration: string;
  description: string;
  imageUrl?: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  isLocked: boolean;
  unlockDate?: string | null;
  isTimerOnly: boolean;
  highlights?: string[] | null;
  nextBatchDate?: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<ProgramType, string> = {
  SUMMER: "Summer Internship",
  WINTER: "Winter Internship",
  WORKSHOP: "Workshop",
};
const TYPE_COLORS: Record<ProgramType, string> = {
  SUMMER: "bg-orange-100 text-orange-700 border border-orange-200",
  WINTER: "bg-blue-100 text-blue-700 border border-blue-200",
  WORKSHOP: "bg-purple-100 text-purple-700 border border-purple-200",
};
const EMPTY_FORM = {
  type: "SUMMER" as ProgramType,
  title: "", duration: "", description: "", imageUrl: "",
  isActive: true, isLocked: false, unlockDate: "", isTimerOnly: false, nextBatchDate: "",
};

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
// ── Live countdown hook ──────────────────────────────────────────────────────
function useCountdown(targetIso: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!targetIso) return { status: "no-date" as const, units: [] };
  const diff = new Date(targetIso).getTime() - now;
  if (diff <= 0) return { status: "past" as const, units: [] };
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  const secs  = Math.floor((diff % 60000)    / 1000);
  return {
    status: "upcoming" as const,
    units: [
      { l: "Days", v: String(days).padStart(2, "0") },
      { l: "Hrs",  v: String(hours).padStart(2, "0") },
      { l: "Min",  v: String(mins).padStart(2, "0") },
      { l: "Sec",  v: String(secs).padStart(2, "0") },
    ],
  };
}

// ── Countdown display component ──────────────────────────────────────────────
function CountdownTimer({ startDate, endDate }: { startDate: string | null; endDate: string | null }) {
  const startC = useCountdown(startDate);
  const endC   = useCountdown(endDate);
  const now    = Date.now();
  const start  = startDate ? new Date(startDate).getTime() : null;
  const end    = endDate   ? new Date(endDate).getTime()   : null;

  const isOngoing = start && end && now >= start && now <= end;
  const isEnded   = end && now > end;

  if (isEnded) return (
    <div className="mt-3 flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3">
      <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0" />
      <div>
        <p className="text-xs font-bold text-gray-500">Program Ended</p>
        <p className="text-xs text-gray-400">{fmtDate(endDate)}</p>
      </div>
    </div>
  );

  if (isOngoing && endC.status === "upcoming") return (
    <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Hourglass className="w-4 h-4 text-green-600" />
        <p className="text-[10px] font-black text-green-700 uppercase tracking-wider">Ongoing — Ends in</p>
      </div>
      <div className="flex gap-1.5">
        {endC.units.map((u) => (
          <div key={u.l} className="flex-1 bg-green-600 text-white rounded-lg text-center py-1.5">
            <p className="text-sm font-black leading-none">{u.v}</p>
            <p className="text-[9px] font-bold uppercase opacity-80 mt-0.5">{u.l}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (startC.status === "upcoming") return (
    <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Timer className="w-4 h-4 text-indigo-600" />
        <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Starts in</p>
      </div>
      <div className="flex gap-1.5">
        {startC.units.map((u) => (
          <div key={u.l} className="flex-1 bg-indigo-600 text-white rounded-lg text-center py-1.5">
            <p className="text-sm font-black leading-none">{u.v}</p>
            <p className="text-[9px] font-bold uppercase opacity-80 mt-0.5">{u.l}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-indigo-500 font-semibold mt-2 text-center">
        {fmtDate(startDate)} → {fmtDate(endDate) ?? "TBD"}
      </p>
    </div>
  );

  if (startDate || endDate) return (
    <div className="mt-3 flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2">
      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <span className="text-xs text-gray-400 font-medium">
        {fmtDate(startDate) ?? "TBD"} → {fmtDate(endDate) ?? "TBD"}
      </span>
    </div>
  );

  return (
    <div className="mt-3 flex items-center gap-2 bg-gray-50 border border-dashed rounded-lg px-3 py-2">
      <Calendar className="w-3.5 h-3.5 text-gray-300 shrink-0" />
      <span className="text-xs text-gray-400 font-medium italic">No dates set</span>
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

export default function ProgramsPage() {
  const [programs, setPrograms]   = useState<Program[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [highlightsText, setHighlightsText] = useState("");
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [error, setError]         = useState("");

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/programs");
      const data = await res.json();
      if (data.success) setPrograms(data.programs);
    } catch { setError("Failed to load programs."); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchPrograms(); }, []);

  function openCreate() { setForm(EMPTY_FORM); setHighlightsText(""); setEditingId(null); setError(""); setShowModal(true); }
  function openEdit(p: Program) {
    setForm({
      type: p.type, title: p.title, duration: p.duration, description: p.description,
      imageUrl: p.imageUrl || "", isActive: p.isActive, isLocked: p.isLocked, unlockDate: p.unlockDate ? p.unlockDate.split("T")[0] : "", isTimerOnly: p.isTimerOnly ?? false, nextBatchDate: p.nextBatchDate || "",
    });
    
    let parsedHighlights: any[] = [];
    if (typeof p.highlights === "string") {
      try { parsedHighlights = JSON.parse(p.highlights); } catch {}
    } else if (Array.isArray(p.highlights)) {
      parsedHighlights = p.highlights;
    }
    
    const textLines = parsedHighlights.map(h => typeof h === "object" && h !== null ? h.text : h);
    setHighlightsText(textLines.join("\n"));

    setEditingId(p.id); setError(""); setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const url    = editingId ? `/api/admin/programs/${editingId}` : "/api/admin/programs";
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrl: form.imageUrl || null,
          nextBatchDate: form.nextBatchDate || null,
          unlockDate: form.unlockDate || null,
          highlights: highlightsText.trim() ? highlightsText.split("\n").map(f => f.trim()).filter(f => f) : null,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Something went wrong."); return; }
      setShowModal(false); fetchPrograms();
    } catch { setError("Network error. Please try again."); }
    finally  { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return; setDeleting(true);
    try {
      await fetch(`/api/admin/programs/${deleteId}`, { method: "DELETE" });
      setDeleteId(null); fetchPrograms();
    } catch { setError("Failed to delete."); }
    finally  { setDeleting(false); }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">

      {/* ── Header ── */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-7 h-7 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Programs Manager</h1>
          </div>
          <p className="text-gray-500 font-medium">Manage internship programs and workshops shown on the website</p>
        </div>
        <button id="new-program-btn" onClick={openCreate}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition shadow whitespace-nowrap">
          <Plus className="w-4 h-4" /> New Program
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["SUMMER","WINTER","WORKSHOP"] as ProgramType[]).map((type) => (
          <div key={type} className="bg-white border rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-gray-900">{programs.filter(p=>p.type===type).length}</p>
            <p className="text-xs text-gray-500 font-semibold mt-1">{TYPE_LABELS[type]}</p>
          </div>
        ))}
        <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-indigo-600">{programs.length}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Total Programs</p>
        </div>
      </div>

      {/* ── Programs Grid ── */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : programs.length === 0 ? (
        <div className="bg-white border border-dashed rounded-xl py-20 text-center">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-500">No programs yet</h3>
          <p className="text-gray-400 mt-1">Click &quot;New Program&quot; to add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {programs.map((p) => (
            <div key={p.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition flex flex-col overflow-hidden">
              {/* top badges */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[p.type]}`}>
                  {TYPE_LABELS[p.type]}
                </span>
                <div className="flex items-center gap-1.5">
                  {p.isTimerOnly && (
                    <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold">
                      <Timer className="w-3 h-3"/>Timer Only
                    </span>
                  )}
                  {p.isLocked
                    ? <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold"><Lock className="w-3 h-3"/>Locked</span>
                    : <span className="flex items-center gap-1 text-xs text-gray-400 px-2 py-0.5 rounded-full font-semibold"><Unlock className="w-3 h-3"/>Open</span>}
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${p.isActive ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                    {p.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
              </div>

              {/* content */}
              <div className="px-5 pb-4 flex-1 flex flex-col">
                <h2 className="text-lg font-black text-gray-900 leading-tight">{p.title}</h2>
                <div className="flex items-center gap-1.5 text-sm text-indigo-600 font-semibold mt-1">
                  <Clock className="w-3.5 h-3.5" />{p.duration}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mt-1">{p.description}</p>

                {/* Highlights count */}
                {(() => {
                  let count = 0;
                  if (typeof p.highlights === "string") {
                    try { count = JSON.parse(p.highlights).length; } catch {}
                  } else if (Array.isArray(p.highlights)) {
                    count = p.highlights.length;
                  }
                  if (count === 0) return null;
                  return (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <ListChecks className="w-3.5 h-3.5" />
                      {count} item{count !== 1 ? "s" : ""} included
                    </div>
                  );
                })()}

                {/* ── COUNTDOWN TIMER ── */}
                <CountdownTimer startDate={p.startDate} endDate={p.endDate} />
              </div>

              {/* actions */}
              <div className="border-t flex divide-x mt-auto">
                <button id={`edit-program-${p.id}`} onClick={() => openEdit(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button id={`delete-program-${p.id}`} onClick={() => setDeleteId(p.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-[60]">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Program" : "New Program"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Program Image</label>
                {form.imageUrl ? (
                  <div className="relative w-40 h-32 rounded-lg overflow-hidden border mb-3">
                    <img src={form.imageUrl} alt="Program" className="object-cover w-full h-full" />
                    <button 
                      type="button" 
                      onClick={() => setForm({ ...form, imageUrl: "" })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative z-[70]">
                    <CldUploadWidget 
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "lms_preset"} 
                      onSuccess={(result: any) => {
                        setForm({ ...form, imageUrl: result?.info?.secure_url });
                      }}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={() => open()}
                          className="w-full flex justify-center items-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-gray-600 font-medium"
                        >
                          <ImagePlus className="w-5 h-5" /> Click to Upload Program Image
                        </button>
                      )}
                    </CldUploadWidget>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1 mb-2">Used for internship cards on website</p>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Program Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select id="program-type-select" value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as ProgramType })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium appearance-none bg-white focus:ring-2 focus:ring-indigo-500 outline-none pr-10" required>
                    <option value="SUMMER">Summer Internship</option>
                    <option value="WINTER">Winter Internship</option>
                    <option value="WORKSHOP">Workshop</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input id="program-title-input" type="text" value={form.title} required
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Full Stack Development Internship"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Duration <span className="text-red-500">*</span></label>
                <input id="program-duration-input" type="text" value={form.duration} required
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g. 8 Weeks"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea id="program-description-textarea" value={form.description} required rows={4}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief program overview..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
              </div>



              {/* Next Batch Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Next Batch Date</label>
                <input id="program-next-batch-date" type="date" value={form.nextBatchDate}
                  onChange={(e) => setForm({ ...form, nextBatchDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              {/* ── What's Included ── */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  What&apos;s Included (one item per line)
                </label>
                <textarea id="program-highlights-textarea" value={highlightsText} rows={5}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  placeholder="React Training\nNode.js\nDeployment"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
              </div>

              {/* ── Lock System ── */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={form.isLocked} 
                      onChange={(e) => setForm({ ...form, isLocked: e.target.checked })}
                      className="w-5 h-5 border-2 border-amber-300 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                      {form.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />} Lock this program
                    </span>
                    <p className="text-xs text-amber-700 mt-0.5">Program will show as locked on the website.</p>
                  </div>
                </label>

                {form.isLocked && (
                  <div className="pl-8">
                    <label className="block text-sm font-bold text-amber-900 mb-1.5">Unlock Date — when will this program become available?</label>
                    <input type="date" value={form.unlockDate || ""}
                      onChange={(e) => setForm({ ...form, unlockDate: e.target.value })}
                      className="w-full border border-amber-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none bg-white" />
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="space-y-3 bg-gray-50 border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      {form.isActive ? <Eye className="w-4 h-4 text-green-500"/> : <EyeOff className="w-4 h-4 text-gray-400"/>} Show on Website
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Make this program visible to visitors</p>
                  </div>
                  <button type="button" id="program-active-toggle" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.isActive ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
                <div className="border-t" />
                {/* isTimerOnly toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <Timer className={`w-4 h-4 ${form.isTimerOnly ? "text-indigo-500" : "text-gray-400"}`}/> Show timer only (no internship cards)
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Website shows only the countdown — internship cards are hidden</p>
                  </div>
                  <button type="button" id="program-timer-only-toggle" onClick={() => setForm({ ...form, isTimerOnly: !form.isTimerOnly })}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.isTimerOnly ? "bg-indigo-500" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.isTimerOnly ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-sm">
                  Cancel
                </button>
                <button id="program-save-btn" type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Program?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-sm">
                Cancel
              </button>
              <button id="confirm-delete-program-btn" onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition text-sm disabled:opacity-60">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
