"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, UserPlus } from "lucide-react";
import { useState } from "react";
import { AssignMentorModal } from "./AssignMentorModal";

export function CourseActions({ courseId, courseSlug, courseTitle }: { courseId: string, courseSlug: string, courseTitle: string }) {
  const router = useRouter();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-2 mt-auto">
      <Link href={`/admin/courses/${courseSlug}/edit`} className="text-center py-2 bg-gray-50 text-gray-700 hover:text-blue-600 font-semibold rounded border cursor-pointer text-sm flex justify-center items-center gap-1 hover:bg-gray-100 transition">
        <Settings className="w-4 h-4" /> Edit Course Settings
      </Link>
      <button 
        onClick={() => setIsAssignModalOpen(true)}
        className="text-center py-2 bg-blue-50 text-blue-700 hover:text-blue-800 font-semibold rounded border border-blue-100 cursor-pointer text-sm flex justify-center items-center gap-1 hover:bg-blue-100 transition"
      >
        <UserPlus className="w-4 h-4" /> Assign Mentor
      </button>

      <AssignMentorModal 
        courseId={courseId}
        courseTitle={courseTitle}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </div>
  );
}
