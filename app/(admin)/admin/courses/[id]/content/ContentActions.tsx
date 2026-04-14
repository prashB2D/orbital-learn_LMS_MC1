"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";

export function ContentActions({ courseSlug, contentId, type }: { courseSlug: string, contentId: string, type: 'LESSON' | 'QUIZ' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async () => {
    setIsModalOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/content/${contentId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete content");
      }
    } catch (e) {
      alert("Error deleting content");
    } finally {
      setLoading(false);
    }
  };

  const editPath = type === 'LESSON' ? 'edit-lesson' : 'edit-quiz';

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        <Link href={`/admin/courses/${courseSlug}/content/${editPath}/${contentId}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition">
          <Edit2 className="w-4 h-4" />
        </Link>
        <button disabled={loading} onClick={() => setIsModalOpen(true)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        itemName={type === 'LESSON' ? 'Class' : 'Quiz'}
      />
    </>
  );
}
