/**
 * GET /api/admin/analytics/sales
 * Purpose: Get sales analytics
 * Input: Query: {startDate?, endDate?} (optional filters)
 * Output: {totalRevenue, totalTransactions, revenuePerCourse: [{courseTitle, revenue}]}
 * Auth Required: Yes (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
      where: { status: "SUCCESS" },
      include: { course: true },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = payments.length;

    const revenuePerCourse: Record<string, any> = {};
    payments.forEach((p) => {
      if (!revenuePerCourse[p.courseId]) {
        revenuePerCourse[p.courseId] = {
          courseTitle: p.course.title,
          revenue: 0,
        };
      }
      revenuePerCourse[p.courseId].revenue += p.amount;
    });

    return NextResponse.json({
      totalRevenue,
      totalTransactions,
      revenuePerCourse: Object.values(revenuePerCourse),
    });
  } catch (error: any) {
    console.error("Sales analytics error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
