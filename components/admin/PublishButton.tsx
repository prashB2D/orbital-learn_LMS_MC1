"use client";

import { useState } from "react";
import { Globe, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

type Status = "idle" | "publishing" | "success" | "error";

export default function PublishButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  async function handlePublish() {
    if (status === "publishing") return;
    setStatus("publishing");

    try {
      const res = await fetch("/api/admin/revalidate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setPublishedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        // Reset back to idle after 4 seconds
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
        <CheckCircle2 className="w-4 h-4" />
        Published {publishedAt && <span className="text-green-500 font-medium">at {publishedAt}</span>}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-sm font-semibold">
        <AlertCircle className="w-4 h-4" /> Failed — try again
      </div>
    );
  }

  return (
    <button
      id="publish-to-website-btn"
      onClick={handlePublish}
      disabled={status === "publishing"}
      title="Push latest programs, courses & testimonials to the public website"
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition shadow-sm whitespace-nowrap"
    >
      {status === "publishing" ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Publishing...
        </>
      ) : (
        <>
          <Globe className="w-4 h-4" />
          Publish to Website
        </>
      )}
    </button>
  );
}
