/**
 * GET /api/admin/users
 * Purpose: List all users with pagination + search
 * Input: Query: {page, search}
 * Output: {users: [{id, name, email, role, createdAt, totalSpent, coursesEnrolled}], totalPages, currentPage, totalUsers}
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
    const search = searchParams.get("search") || "";
    
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        payments: {
          where: { status: "SUCCESS" },
          select: { amount: true },
        },
        enrollments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const usersWithStats = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      totalSpent: u.payments.reduce((sum, p) => sum + p.amount, 0),
      coursesEnrolled: u.enrollments.length,
    }));

    const totalUsers = await prisma.user.count({ where });

    return NextResponse.json({
      users: usersWithStats,
      totalPages: Math.ceil(totalUsers / pageSize),
      currentPage: page,
      totalUsers,
    });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

