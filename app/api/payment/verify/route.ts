/**
 * POST /api/payment/verify
 * Purpose: Verify payment signature + create enrollment
 * Input: {orderId, paymentId, signature, courseId}
 * Output: {success, enrollmentId}
 * Auth Required: Yes
 */

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Check session
    const session = await requireAuth();
    if (!session.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) throw new Error("User not found");

    // 2. Validate input
    const { orderId, paymentId, signature, courseId } = await request.json();

    if (!orderId || !paymentId || !signature || !courseId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 3. Verify signature using crypto.createHmac
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    
    // 4. signature == crypto.createHmac('sha256', secret).update(orderId|paymentId).digest('hex')
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generated_signature !== signature) {
      // If payment failed signature check, mark as FAILED
      await prisma.payment.update({
        where: { razorpayOrderId: orderId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 5. Update payment record: status = SUCCESS
    await prisma.payment.update({
      where: { razorpayOrderId: orderId },
      data: {
        razorpayPaymentId: paymentId,
        status: "SUCCESS",
      },
    });

    // 6. Create enrollment (userId, courseId)
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
      },
    });

    // 7. Return success + enrollmentId
    return NextResponse.json({
      success: true,
      enrollmentId: enrollment.id,
      message: "Enrollment successful",
    });

  } catch (error: any) {
    console.error("Verify payment error:", error);
    
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
