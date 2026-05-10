"use client";

import { useState, useEffect } from "react";
import { Settings, Save, AlertTriangle } from "lucide-react";

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/website-settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch {
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSavingKey(key);
    setError("");
    try {
      const res = await fetch("/api/admin/website-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to save setting");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      {/* ── Header ── */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-7 h-7 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Website Settings</h1>
        </div>
        <p className="text-gray-500 font-medium">Control section timers shown on the public website</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Settings Grid ── */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden p-6 space-y-6">
        
        {/* Summer Internship */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Summer Internship — Next Batch Date
          </label>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={settings.summerNextBatch || ""}
              onChange={(e) => setSettings({ ...settings, summerNextBatch: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none max-w-sm" 
            />
            <button 
              onClick={() => handleSave("summerNextBatch", settings.summerNextBatch || "")}
              disabled={savingKey === "summerNextBatch"}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-60 text-sm"
            >
              <Save className="w-4 h-4" />
              {savingKey === "summerNextBatch" ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="border-t" />

        {/* Winter Internship */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Winter Internship — Next Batch Date
          </label>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={settings.winterNextBatch || ""}
              onChange={(e) => setSettings({ ...settings, winterNextBatch: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none max-w-sm" 
            />
            <button 
              onClick={() => handleSave("winterNextBatch", settings.winterNextBatch || "")}
              disabled={savingKey === "winterNextBatch"}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-60 text-sm"
            >
              <Save className="w-4 h-4" />
              {savingKey === "winterNextBatch" ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="border-t" />

        {/* Workshops */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Workshops — Next Batch Date
          </label>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={settings.workshopNextBatch || ""}
              onChange={(e) => setSettings({ ...settings, workshopNextBatch: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none max-w-sm" 
            />
            <button 
              onClick={() => handleSave("workshopNextBatch", settings.workshopNextBatch || "")}
              disabled={savingKey === "workshopNextBatch"}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-60 text-sm"
            >
              <Save className="w-4 h-4" />
              {savingKey === "workshopNextBatch" ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
