"use client";

/**
 * PushToWebsiteButton
 * A self-contained client component that calls POST /api/admin/push-to-website.
 * Rendered on the admin dashboard page above all other content.
 */

import { useState, useEffect } from "react";
import { Upload, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

type PushState =
  | { status: "idle" }
  | { status: "pushing" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export default function PushToWebsiteButton() {
  const [state, setState] = useState<PushState>({ status: "idle" });

  // Auto-clear success / error after 5 seconds
  useEffect(() => {
    if (state.status === "success" || state.status === "error") {
      const timer = setTimeout(() => setState({ status: "idle" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  async function handlePush() {
    setState({ status: "pushing" });
    try {
      const res = await fetch("/api/admin/push-to-website", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        const { courses, testimonials, programs } = data.pushed;
        setState({
          status: "success",
          message: `Pushed successfully — ${courses} course${courses !== 1 ? "s" : ""}, ${testimonials} testimonial${testimonials !== 1 ? "s" : ""}, ${programs} program${programs !== 1 ? "s" : ""}`,
        });
      } else {
        setState({
          status: "error",
          message: data.error ?? "Push failed. Please try again.",
        });
      }
    } catch {
      setState({
        status: "error",
        message: "Network error — could not reach the server.",
      });
    }
  }

  const isPushing = state.status === "pushing";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
      {/* Label */}
      <div>
        <h2 className="text-base font-bold text-gray-900">Push to Website</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Sync active programs, testimonials, and showcase courses to the live website.
        </p>
      </div>

      {/* Button + feedback */}
      <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
        <button
          id="push-to-website-btn"
          onClick={handlePush}
          disabled={isPushing}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-bold transition shadow text-sm whitespace-nowrap"
        >
          {isPushing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isPushing ? "Pushing…" : "Push to Website"}
        </button>

        {state.status === "success" && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {state.message}
          </p>
        )}
        {state.status === "error" && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-red-500">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}
