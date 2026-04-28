import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedUserId = searchParams.get("userId");

    // Only allow querying another user's badges if the requester is an admin/mentor
    let targetUserId = user.id;
    if (requestedUserId && requestedUserId !== user.id) {
      if (user.role !== "ADMIN" && user.role !== "MENTOR") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      targetUserId = requestedUserId;
    }

    const studentBadges = await prisma.studentBadge.findMany({
      where: { userId: targetUserId },
      include: {
        badge: true,
        awardedBy: { select: { name: true } }
      },
      orderBy: { awardedAt: "desc" }
    });

    return NextResponse.json({ success: true, badges: studentBadges });
  } catch (error: any) {
    console.error("Fetch student badges error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
