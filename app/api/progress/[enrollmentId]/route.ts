/**
 * GET /api/progress/[enrollmentId]
 * Purpose: Get course progress percentage
 * Input: URL param: enrollmentId
 * Output: {totalContents, completedContents, progressPercentage}
 * Auth Required: Yes (verify ownership)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    const session = await requireAuth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) throw new Error("User not found");

    // Fetch deep related structure natively mapping the enrollment constraint
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: params.enrollmentId },
      include: {
        course: {
          include: {
            contents: {
              include: {
                progress: {
                  where: { enrollmentId: params.enrollmentId },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    if (enrollment.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to enrollment" }, { status: 403 });
    }

    // Mathematical resolution
    const totalContents = enrollment.course.contents.length;
    
    const completedContents = enrollment.course.contents.filter(
      (c) => c.progress.length > 0 && c.progress[0].completed
    ).length;

    const progressPercentage =
      totalContents > 0 ? (completedContents / totalContents) * 100 : 0;

    return NextResponse.json({
      totalContents,
      completedContents,
      progressPercentage,
    });
  } catch (error: any) {
    console.error("Progress fetch error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

