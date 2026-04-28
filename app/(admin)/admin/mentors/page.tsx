"use client";

import { useState, useEffect } from "react";
import { Users, Edit, Save, X, Coins, PlusCircle, XCircle } from "lucide-react";
import { AssignCourseToMentorModal } from "./AssignCourseModal";

export default function MentorsPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [platformBalance, setPlatformBalance] = useState(0);
  const [platformAwarded, setPlatformAwarded] = useState(0);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState<number>(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMentorName, setNewMentorName] = useState("");
  const [newMentorEmail, setNewMentorEmail] = useState("");
  const [newMentorPassword, setNewMentorPassword] = useState("");

  const [assignMentorId, setAssignMentorId] = useState<string | null>(null);
  const [assignMentorName, setAssignMentorName] = useState("");

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mentors/limits");
      const data = await res.json();
      if (data.success) {
        setMentors(data.mentors);
        setPlatformBalance(data.platformTotalBalance);
        setPlatformAwarded(data.platformTotalAwarded);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleSaveLimit = async (mentorId: string) => {
    try {
      const res = await fetch("/api/admin/mentors/limits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, newLimit: editLimit })
      });
      const data = await res.json();
      if (data.success) {
        setMentors(mentors.map(m => m.id === mentorId ? { ...m, limit: editLimit } : m));
        setEditingId(null);
      } else {
        alert(data.error || "Failed to update limit");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    }
  };

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMentorName, email: newMentorEmail, password: newMentorPassword })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewMentorName("");
        setNewMentorEmail("");
        setNewMentorPassword("");
        fetchMentors();
      } else {
        alert(data.error || "Failed to create mentor");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    }
  };

  const handleRemoveAssignment = async (courseId: string, mentorId: string) => {
    try {
      const res = await fetch("/api/admin/assign-course", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, mentorId })
      });
      if (res.ok) {
        fetchMentors();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentor Management</h1>
          <p className="text-gray-600">Manage mentor coin limits and platform economy</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition">
          + Add Mentor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Total Coins Awarded</p>
            <p className="text-3xl font-black text-gray-900">{platformAwarded.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Total Coins in Wallets</p>
            <p className="text-3xl font-black text-gray-900">{platformBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-lg">Mentors & Limits</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600 text-sm">Mentor</th>
              <th className="p-4 text-center font-semibold text-gray-600 text-sm">Awarded This Month</th>
              <th className="p-4 text-center font-semibold text-gray-600 text-sm">Monthly Limit</th>
              <th className="p-4 text-right font-semibold text-gray-600 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading mentors...</td></tr>
            ) : mentors.length > 0 ? (
              mentors.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{m.name}</div>
                    <div className="text-sm text-gray-500">{m.email}</div>
                    {m.assignedCourses && m.assignedCourses.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.assignedCourses.map((c: any) => (
                          <span key={c.id} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1 group">
                            {c.courseCode && <span className="text-[8px] uppercase tracking-wider opacity-70 border-r border-blue-200 pr-1 mr-0.5">{c.courseCode}</span>}
                            {c.title}
                            <button 
                              onClick={() => handleRemoveAssignment(c.id, m.id)} 
                              className="text-blue-400 hover:text-red-500 ml-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <button 
                      onClick={() => { setAssignMentorId(m.id); setAssignMentorName(m.name); }}
                      className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded w-fit"
                    >
                      <PlusCircle className="w-3 h-3" /> Assign Course
                    </button>
                  </td>
                  <td className="p-4 text-center font-bold text-gray-700">
                    <span className={m.awardedThisMonth >= m.limit ? "text-red-600" : "text-green-600"}>
                      {m.awardedThisMonth}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {editingId === m.id ? (
                      <input 
                        type="number" 
                        value={editLimit} 
                        onChange={(e) => setEditLimit(Number(e.target.value))}
                        className="w-24 px-2 py-1 border rounded text-center"
                        min="0"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">{m.limit}</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {editingId === m.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-600 bg-gray-100 rounded">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleSaveLimit(m.id)} className="p-1 text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1 px-2 text-xs font-bold">
                          <Save className="w-4 h-4" /> Save
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingId(m.id); setEditLimit(m.limit); }}
                        className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-lg transition"
                      >
                        Set Limit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No mentors found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">Create Mentor Account</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateMentor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <input required type="text" value={newMentorName} onChange={e => setNewMentorName(e.target.value)} className="w-full border px-3 py-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input required type="email" value={newMentorEmail} onChange={e => setNewMentorEmail(e.target.value)} className="w-full border px-3 py-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input required type="text" value={newMentorPassword} onChange={e => setNewMentorPassword(e.target.value)} className="w-full border px-3 py-2 rounded-lg" />
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignMentorId && (
        <AssignCourseToMentorModal
          mentorId={assignMentorId}
          mentorName={assignMentorName}
          isOpen={!!assignMentorId}
          onClose={() => setAssignMentorId(null)}
          onSuccess={() => fetchMentors()}
        />
      )}
    </div>
  );
}
