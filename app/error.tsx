"use client"; // Error components must be Client Components

import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Bug } from "lucide-react";
import { usePathname } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  const handleReportIssue = async () => {
    setReporting(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: pathname || window.location.href,
          error: error.message || "Unknown error",
        }),
      });
      if (res.ok) {
        setReported(true);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to report issue. Please email support.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center p-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 mb-8">
          We limit the technical details, but an unexpected error occurred. You can choose to go back or report this issue to our developers.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>

          <button
            onClick={handleReportIssue}
            disabled={reporting || reported}
            className={`w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition border-2 ${
              reported
                ? "bg-green-50 text-green-700 border-green-200 cursor-default"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {reported ? (
              "Issue Reported! ✓"
            ) : reporting ? (
              "Reporting..."
            ) : (
              <>
                <Bug className="w-5 h-5" /> Report Issue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
