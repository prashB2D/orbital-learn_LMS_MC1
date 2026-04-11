/**
 * POST /api/payment/free-enroll
 * Purpose: Bypass Razorpay completely for courses with Price 0 and unlock enrollment directly.
 * Input: { courseId }
 * Output: { success: true }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) throw new Error("User not found");

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json({ error: "Missing course" }, { status: 400 });
    }

    // Double-verify the database mathematically explicitly confirms the price is exactly 0
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.price > 0) {
       return NextResponse.json({ error: "Invalid payment constraints. This course requires checkout." }, { status: 403 });
    }

    // Check if already enrolled to prevent duplicates
    const existing = await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId }
    });

    if (existing) {
        return NextResponse.json({ success: true, message: "Already enrolled" });
    }

    // Instantly generate the absolute enrollment object bypassing gateway
    await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Free Enroll Error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
