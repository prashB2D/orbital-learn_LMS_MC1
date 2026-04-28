import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, courseId } = await request.json();
    if (!code || !courseId) {
      return NextResponse.json({ error: "Code and courseId are required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    
    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      return NextResponse.json({ error: "This coupon is not valid yet" }, { status: 400 });
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    if (coupon.scope === "COURSE_SPECIFIC" && coupon.courseId !== courseId) {
      return NextResponse.json({ error: "This coupon is not valid for this course" }, { status: 400 });
    }

    if (coupon.onePerUser) {
      const existingUsage = await prisma.couponUsage.findFirst({
        where: { couponId: coupon.id, userId: user.id }
      });
      if (existingUsage) {
        return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });
      }
    }

    // Return the discount details so the frontend can update price
    return NextResponse.json({ 
      success: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error: any) {
    console.error("Validate coupon error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
