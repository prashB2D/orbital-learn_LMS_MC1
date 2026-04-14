"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderInput, Loader2 } from "lucide-react";

export function AssignModuleComponent({
  contentId,
  modules
}: {
  contentId: string;
  modules: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAssign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const moduleId = e.target.value;
    if (!moduleId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to assign module.");
      }
    } catch (err) {
      alert("Error assigning module.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute ml-2" />}
      <select
        onChange={handleAssign}
        disabled={loading}
        className="text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 p-1 pl-2 pr-6 bg-gray-50 max-w-[150px]"
        defaultValue=""
      >
        <option value="" disabled>Assign Module</option>
        {modules.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title}
          </option>
        ))}
      </select>
    </div>
  );
}
