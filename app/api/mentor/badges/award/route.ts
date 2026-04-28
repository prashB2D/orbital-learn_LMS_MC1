import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendNotification } from "@/lib/notification";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MENTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, badgeId, comment } = body;

    if (!studentId || !badgeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge || badge.type !== "MANUAL") {
      return NextResponse.json({ error: "Invalid badge or not a manual badge" }, { status: 400 });
    }

    const studentBadge = await prisma.studentBadge.create({
      data: {
        userId: studentId,
        badgeId,
        awardedById: user.id,
        comment
      },
      include: { badge: true }
    });

    await sendNotification({
      userId: studentId,
      title: "Badge Awarded!",
      message: `You were awarded the ${studentBadge.badge.name} badge by your mentor!`,
      type: "BADGE"
    });

    return NextResponse.json({ success: true, studentBadge }, { status: 201 });
  } catch (error: any) {
    console.error("Award badge error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Student already has this badge" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
