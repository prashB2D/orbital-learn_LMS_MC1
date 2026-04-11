"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FreeButtonProps {
  courseId: string;
}

export function FreeButton({ courseId }: FreeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnrollment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/free-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      
      const payload = await response.json();
      
      if (!response.ok) {
        throw new Error(payload.error || "Failed to secure free enrollment");
      }

      // Automatically refresh the underlying backend states to dynamically swap the screen constraints
      router.refresh(); 
      alert("Successfully enrolled for free! You can now start learning.");
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to enroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnrollment}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 rounded-lg font-black tracking-wide hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
    >
      {loading ? "Assigning License..." : "Enroll for Free"}
    </button>
  );
}
