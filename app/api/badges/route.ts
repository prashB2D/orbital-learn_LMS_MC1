import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const badges = await prisma.badge.findMany({
      orderBy: { createdAt: "desc" }
    });

    let awardedBadges = [];
    if (user.role === "MENTOR") {
      awardedBadges = await prisma.studentBadge.findMany({
        where: { awardedById: user.id },
        include: { badge: true, user: { select: { name: true } } },
        orderBy: { awardedAt: "desc" }
      });
    }

    return NextResponse.json({ success: true, badges, role: user.role, awardedBadges });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
