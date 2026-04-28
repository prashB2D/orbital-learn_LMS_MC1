"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CourseSelector } from "../coupons/CourseSelector";

export function AssignCourseToMentorModal({
  mentorId,
  mentorName,
  isOpen,
  onClose,
  onSuccess
}: {
  mentorId: string;
  mentorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAssign = async () => {
    if (!courseId) {
      setError("Please select a course");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/assign-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, mentorId })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
        setCourseId("");
      } else {
        setError(data.error || "Failed to assign course");
      }
    } catch (e) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">Assign Course</h2>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full">
            <X className="w-5 h-5"/>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-1">Mentor</p>
            <p className="text-lg font-bold text-gray-900">{mentorName}</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Select Course</label>
            <CourseSelector value={courseId} onChange={setCourseId} />
            {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t">
            <button onClick={onClose} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleAssign} disabled={loading || !courseId} className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
              {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
