"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

interface RazorpayButtonProps {
  courseId: string;
  amount: number;
}

export function RazorpayButton({ courseId, amount }: RazorpayButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, amount })
      });
      
      const sessionData = await response.json();
      
      if (!response.ok) {
        throw new Error(sessionData.error || "Failed to create order");
      }

      const { orderId, key } = sessionData;

      const options = {
        key,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Horbiteal Study',
        description: 'Course Enrollment',
        order_id: orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              courseId
            })
          });
          
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            alert("Payment Successful!");
            // Redirect to courses learning page
            router.refresh(); // refresh the page so server-side enrolled check passes
          } else {
            alert(verifyData.error || 'Payment verification failed');
          }
        },
        theme: {
          color: "#2563EB",
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + response.error.description);
      });
      
      rzp.open();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition shadow-sm"
      >
        {loading ? "Processing Secure Payment..." : "Buy Now"}
      </button>
    </>
  );
}
