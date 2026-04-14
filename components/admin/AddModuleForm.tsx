"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function AddModuleForm({ courseId }: { courseId: string }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, title }),
      });

      if (!res.ok) {
        throw new Error("Failed to create module");
      }

      setTitle("");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error creating module.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAdd} className="mt-8 bg-gray-50 border border-dashed border-gray-300 p-6 rounded-xl flex items-center gap-4">
      <div className="flex-1">
        <label className="sr-only">Module Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New Module Name (e.g., Module 1: Introduction)"
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="shrink-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        {loading ? "Adding..." : "Add Module"}
      </button>
    </form>
  );
}
