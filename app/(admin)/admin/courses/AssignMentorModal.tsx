"use client";

import { useState, useEffect } from "react";
import { UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function AssignMentorModal({ 
  courseId, 
  courseTitle,
  isOpen, 
  onClose 
}: { 
  courseId: string, 
  courseTitle: string,
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [mentors, setMentors] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchMentors();
      fetchAssignments();
    }
  }, [isOpen]);

  const fetchMentors = async () => {
    const res = await fetch("/api/admin/mentors");
    const data = await res.json();
    if (data.success) setMentors(data.mentors);
  };

  const fetchAssignments = async () => {
    const res = await fetch(`/api/admin/assign-course?courseId=${courseId}`);
    const data = await res.json();
    if (data.success) setAssignments(data.assignments);
  };

  const handleAssign = async () => {
    if (!selectedMentor) return;
    setLoading(true);
    const res = await fetch("/api/admin/assign-course", {
      method: "POST",
      body: JSON.stringify({ courseId, mentorId: selectedMentor }),
    });
    if (res.ok) {
      setSelectedMentor("");
      fetchAssignments();
      router.refresh();
    }
    setLoading(false);
  };

  const handleRemove = async (mentorId: string) => {
    setLoading(true);
    const res = await fetch("/api/admin/assign-course", {
      method: "DELETE",
      body: JSON.stringify({ courseId, mentorId }),
    });
    if (res.ok) {
      fetchAssignments();
      router.refresh();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-900">Assign Mentor</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Course</p>
            <p className="font-bold text-gray-900">{courseTitle}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Mentor</label>
            <div className="flex gap-2">
              <select 
                value={selectedMentor} 
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">-- Choose a mentor --</option>
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                ))}
              </select>
              <button 
                onClick={handleAssign}
                disabled={loading || !selectedMentor}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50 text-sm"
              >
                Assign
              </button>
            </div>
          </div>

          {assignments.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Currently Assigned</p>
              <div className="space-y-2">
                {assignments.map(a => (
                  <div key={a.id} className="flex justify-between items-center bg-gray-50 border p-3 rounded-lg">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{a.mentor.name}</p>
                      <p className="text-xs text-gray-500">{a.mentor.email}</p>
                    </div>
                    <button 
                      onClick={() => handleRemove(a.mentorId)}
                      disabled={loading}
                      className="text-red-600 text-sm font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
