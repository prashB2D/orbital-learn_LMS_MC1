import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "MENTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentBadgeId, reason } = await request.json();

    if (!studentBadgeId || !reason || reason.length < 10) {
      return NextResponse.json({ error: "Badge ID and reason (min 10 chars) are required" }, { status: 400 });
    }

    const studentBadge = await prisma.studentBadge.findUnique({
      where: { id: studentBadgeId },
      include: { badge: true }
    });

    if (!studentBadge) {
      return NextResponse.json({ error: "Student badge not found" }, { status: 404 });
    }

    if (studentBadge.awardedById !== user.id) {
      return NextResponse.json({ error: "You can only revoke badges you awarded" }, { status: 403 });
    }

    if (studentBadge.isRevoked) {
      return NextResponse.json({ error: "Badge is already revoked" }, { status: 400 });
    }

    const updatedBadge = await prisma.studentBadge.update({
      where: { id: studentBadgeId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedBy: user.id,
        revokeReason: reason
      }
    });

    await prisma.notification.create({
      data: {
        userId: studentBadge.userId,
        title: "Badge Revoked",
        message: `Your ${studentBadge.badge.name} badge has been revoked by Mentor ${user.name}: ${reason}`,
        type: "BADGE",
        payload: { studentBadgeId }
      }
    });

    return NextResponse.json({ success: true, studentBadge: updatedBadge }, { status: 200 });

  } catch (error) {
    console.error("Badge revoke error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
