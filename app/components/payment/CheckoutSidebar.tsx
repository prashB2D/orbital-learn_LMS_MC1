"use client";

import { useState } from "react";
import { RazorpayButton } from "./razorpay-button";
import { FreeButton } from "./free-button";
import { Tag, CheckCircle } from "lucide-react";

export function CheckoutSidebar({ course }: { course: any }) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, courseId: course.id })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setError("");
      } else {
        setError(data.error);
        setAppliedCoupon(null);
      }
    } catch (e) {
      setError("Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  let finalPrice = course.finalPrice;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      finalPrice = Math.max(0, course.finalPrice * (1 - appliedCoupon.discountValue / 100));
    } else {
      finalPrice = Math.max(0, course.finalPrice - appliedCoupon.discountValue);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm sticky top-8">
      {appliedCoupon ? (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500 line-through">₹{course.finalPrice.toLocaleString("en-IN")}</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">₹{finalPrice.toLocaleString("en-IN")}</p>
          <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4"/>
            Code {appliedCoupon.code} applied!
          </div>
        </div>
      ) : course.offerPercent && course.offerPercent > 0 ? (
        <div className="mb-6 text-center flex flex-col items-center gap-1">
          <p className="text-sm text-gray-500">
            Original <span className="line-through text-red-500">₹{course.basePrice.toLocaleString("en-IN")}</span> → <span className="text-green-600 font-medium">You save ₹{(course.basePrice - course.finalPrice).toLocaleString("en-IN")}</span>
          </p>
          <p className="text-4xl font-bold text-gray-900">Pay ₹{course.finalPrice.toLocaleString("en-IN")}</p>
        </div>
      ) : (
        <p className="text-4xl font-bold text-gray-900 mb-6 text-center">
          ₹{course.finalPrice.toLocaleString("en-IN")}
        </p>
      )}

      {course.finalPrice > 0 && !appliedCoupon && (
        <div className="mb-6 border-t pt-4">
          <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-1">
            <Tag className="w-4 h-4"/> Have a coupon?
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={couponCode} 
              onChange={e => setCouponCode(e.target.value)} 
              placeholder="Enter code"
              className="flex-1 border px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
            <button 
              onClick={applyCoupon} 
              disabled={loading || !couponCode}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
        </div>
      )}

      <div className="space-y-4">
        {finalPrice === 0 ? (
          <FreeButton courseId={course.id} />
        ) : (
          <RazorpayButton courseId={course.id} amount={finalPrice} />
        )}
        <p className="text-xs text-center text-gray-400">
          Full lifetime access • Certificate of completion
        </p>
      </div>
    </div>
  );
}
