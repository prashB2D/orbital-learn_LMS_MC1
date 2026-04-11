/**
 * GET /api/admin/transactions
 * Purpose: List all payments with filters + search + pagination
 * Input: Query: {page, status?, search?}
 * Output: {transactions: [{id, razorpayOrderId, razorpayPaymentId, amount, status, createdAt, user: {}, course: {}}], summary: {...}, totalPages}
 * Auth Required: Yes (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const pageSize = 15;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: "insensitive" } } },
        { razorpayOrderId: { contains: search, mode: "insensitive" } },
      ];
    }

    const transactions = await prisma.payment.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fire generic stats globally across the db, unencumbered by the `where` constraints above
    const summary = await prisma.$transaction([
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.count({ where: { status: "SUCCESS" } }),
      prisma.payment.count({ where: { status: "FAILED" } }),
      prisma.payment.count(),
    ]);

    const totalFilteredTransactions = await prisma.payment.count({ where });

    return NextResponse.json({
      transactions,
      summary: {
        totalRevenue: summary[0]._sum.amount || 0,
        totalTransactions: summary[3],
        successfulTransactions: summary[1],
        failedTransactions: summary[2],
      },
      totalPages: Math.ceil(totalFilteredTransactions / pageSize),
      currentPage: page,
    });
  } catch (error: any) {
    console.error("Fetch transactions error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
