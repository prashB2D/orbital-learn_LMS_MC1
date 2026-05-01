"use client";

import { useState, useEffect } from "react";
import { Award, Plus, Trash, Edit, RefreshCw } from "lucide-react";

export default function BadgesPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [awardedBadges, setAwardedBadges] = useState<any[]>([]);
  const [role, setRole] = useState<string>("ADMIN");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Revoke state
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeTargetId, setRevokeTargetId] = useState("");
  const [revokeTargetName, setRevokeTargetName] = useState("");
  const [revokeReason, setRevokeReason] = useState("");
  const [revoking, setRevoking] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🏆");
  const [type, setType] = useState("MANUAL");
  const [rarity, setRarity] = useState("COMMON");
  const [triggerLogic, setTriggerLogic] = useState("");

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/badges");
      const data = await res.json();
      if (data.success) {
        setBadges(data.badges);
        setRole(data.role);
        setAwardedBadges(data.awardedBadges || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/badges/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, icon, type, rarity, triggerLogic: type === "AUTOMATED" ? triggerLogic : undefined })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchBadges();
        // Reset form
        setName(""); setDescription(""); setIcon("🏆"); setType("MANUAL"); setRarity("COMMON"); setTriggerLogic("");
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTargetId || revokeReason.length < 10) return;
    setRevoking(true);
    try {
      const res = await fetch("/api/mentor/badges/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentBadgeId: revokeTargetId, reason: revokeReason })
      });
      const data = await res.json();
      if (data.success) {
        setRevokeModalOpen(false);
        setRevokeReason("");
        fetchBadges();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRevoking(false);
    }
  };

  const ICONS = ["🏆", "⭐", "🥇", "🥈", "🥉", "🏅", "🔥", "🚀", "💡", "🧠", "🎯", "🎓", "⚡", "🌟"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{role === "MENTOR" ? "Badges I've Awarded" : "Badges"}</h1>
          <p className="text-gray-600">{role === "MENTOR" ? "View all badges you have manually awarded to students" : "Create and manage system and manual badges"}</p>
        </div>
        {role === "ADMIN" && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" /> New Badge
          </button>
        )}
      </div>

      {role === "MENTOR" ? (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-600">Student</th>
                <th className="p-4 text-left font-semibold text-gray-600">Badge</th>
                <th className="p-4 text-left font-semibold text-gray-600">Comment</th>
                <th className="p-4 text-right font-semibold text-gray-600">Date Awarded</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : awardedBadges.length > 0 ? (
                awardedBadges.map((ab: any) => (
                  <tr key={ab.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-900">{ab.user.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-semibold">
                        <span>{ab.badge.icon}</span> {ab.badge.name}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm max-w-xs truncate" title={ab.comment}>{ab.comment || "-"}</td>
                    <td className="p-4 flex items-center justify-end gap-4 text-sm">
                      <span className="text-gray-500">{new Date(ab.awardedAt).toLocaleDateString()}</span>
                      <button onClick={() => { setRevokeTargetId(ab.id); setRevokeTargetName(ab.badge.name); setRevokeModalOpen(true); }} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded font-bold border border-red-200">Revoke</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">You haven't awarded any badges yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">Loading badges...</div>
          ) : badges.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border">No badges created yet.</div>
          ) : (
            badges.map(badge => (
              <div key={badge.id} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center text-center hover:shadow-md transition relative group">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button className="text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button className="text-gray-400 hover:text-red-600"><Trash className="w-4 h-4" /></button>
                </div>
                <div className="text-5xl mb-4">{badge.icon}</div>
                <h3 className="font-bold text-lg text-gray-900">{badge.name}</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4 h-10 overflow-hidden line-clamp-2">{badge.description}</p>
                
                <div className="flex flex-wrap justify-center gap-2 mt-auto w-full">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    badge.rarity === 'LEGENDARY' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                    badge.rarity === 'EPIC' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                    badge.rarity === 'RARE' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {badge.rarity}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    badge.type === 'AUTOMATED' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {badge.type === 'AUTOMATED' ? 'Auto Trigger' : 'Manual Award'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Badge</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"><Award className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Badge Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Fast Learner" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20" placeholder="e.g. Completed a course in record time!" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Icon (Emoji)</label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 h-32 overflow-y-auto">
                  {ICONS.map(i => (
                    <button key={i} type="button" onClick={() => setIcon(i)} className={`text-2xl p-2 rounded hover:bg-white hover:shadow-sm transition ${icon === i ? 'bg-white shadow-md ring-2 ring-blue-500' : ''}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none bg-white">
                    <option value="MANUAL">Manual Award</option>
                    <option value="AUTOMATED">Automated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Rarity</label>
                  <select value={rarity} onChange={e => setRarity(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none bg-white">
                    <option value="COMMON">Common</option>
                    <option value="RARE">Rare</option>
                    <option value="EPIC">Epic</option>
                    <option value="LEGENDARY">Legendary</option>
                  </select>
                </div>
              </div>
              
              {type === "AUTOMATED" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">System Trigger Logic</label>
                  <select required value={triggerLogic} onChange={e => setTriggerLogic(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none bg-white">
                    <option value="">Select Trigger...</option>
                    <option value="first_100_score">First 100% Quiz Score</option>
                    <option value="top_10_rank">Top 10 Global Rank</option>
                    <option value="quiz_master">Quiz Master (10x ≥80%)</option>
                    <option value="30_day_streak">30-Day Streak</option>
                    <option value="100_day_streak">100-Day Streak</option>
                    <option value="course_completionist_5">Completed 5 Courses</option>
                  </select>
                </div>
              )}

              <div className="pt-4 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">Create Badge</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {revokeModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-red-600">Revoke Badge</h2>
              <button onClick={() => { setRevokeModalOpen(false); setRevokeReason(""); }} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"><Trash className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">You are about to revoke the <span className="font-bold text-gray-900">"{revokeTargetName}"</span> badge from this student.</p>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Revocation (Required)</label>
                <textarea 
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Min 10 characters..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-24"
                />
              </div>
              <div className="flex justify-end pt-4 border-t gap-2">
                <button onClick={() => { setRevokeModalOpen(false); setRevokeReason(""); }} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button 
                  onClick={handleRevoke}
                  disabled={revokeReason.length < 10 || revoking}
                  className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
                >
                  {revoking ? "Revoking..." : "Confirm Revocation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
