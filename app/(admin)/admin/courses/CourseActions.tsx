"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, Trash } from "lucide-react";
import { useState } from "react";

export function CourseActions({ courseId, courseSlug }: { courseId: string, courseSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-2 mt-auto">
      <Link href={`/admin/courses/${courseSlug}/edit`} className="text-center py-2 bg-gray-50 text-gray-700 hover:text-blue-600 font-semibold rounded border cursor-pointer text-sm flex justify-center items-center gap-1 hover:bg-gray-100 transition">
        <Settings className="w-4 h-4" /> Edit Course Settings
      </Link>
    </div>
  );
}
