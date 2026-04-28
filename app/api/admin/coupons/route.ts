import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    console.error("Fetch coupons error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { code, discountType, discountValue, scope, courseId, maxUses, onePerUser, validFrom, validUntil } = body;

    if (!code || !discountType || !discountValue || !scope) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        scope,
        courseId: scope === "COURSE_SPECIFIC" ? courseId : null,
        maxUses: maxUses ? Number(maxUses) : null,
        onePerUser: Boolean(onePerUser),
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: true
      }
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Create coupon error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
