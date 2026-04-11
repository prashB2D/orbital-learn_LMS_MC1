/**
 * POST /api/payment/create-order
 * Purpose: Create Razorpay order
 * Input: {courseId, amount}
 * Output: {orderId, amount, currency, key}
 * Auth Required: Yes
 */

import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Check session
    const session = await requireAuth();
    if (!session.user?.email) throw new Error("Unauthorized");

    // Get user id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) throw new Error("User not found");

    // 2. Validate input (courseId, amount)
    const { courseId, amount } = await request.json();

    if (!courseId || !amount) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 3. Create Razorpay order (convert amount to paise: amount * 100)
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${user.id.substring(0, 5)}`,
    });

    // 4. Save payment record with status: PENDING
    await prisma.payment.create({
      data: {
        userId: user.id,
        courseId,
        amount,
        razorpayOrderId: order.id,
        status: "PENDING",
      },
    });

    // 5. Return JSON payload matching client assumptions
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    });

  } catch (error: any) {
    console.error("Create order error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
