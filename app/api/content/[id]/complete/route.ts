/**
 * POST /api/content/[contentId]/complete
 * Purpose: Mark lesson as complete (triggered at 90% video watched or quiz submitted)
 * Input: {enrollmentId, contentId}
 * Output: {success, progressPercentage}
 * Auth Required: Yes
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth check
    const session = await requireAuth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    // 2. Parse payload
    const { contentId, enrollmentId } = await request.json();

    if (!contentId || !enrollmentId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (params.id !== contentId) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    // 2.5 Block if QUIZ and no passing attempt
    const content = await prisma.content.findUnique({ where: { id: contentId } });
    if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });

    if (content.type === "QUIZ") {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const passingAttempt = await prisma.quizAttempt.findFirst({
        where: {
          userId: user.id,
          quizId: contentId,
          score: { gte: 60 }
        }
      });

      if (!passingAttempt) {
        return NextResponse.json({ error: "You must pass this quiz to mark it complete" }, { status: 400 });
      }
    }

    // 3. Upsert Progress
    const progress = await prisma.progress.upsert({
      where: {
        enrollmentId_contentId: {
          enrollmentId,
          contentId,
        },
      },
      create: {
        enrollmentId,
        contentId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });

    if (content.type === "LESSON") {
       const user = await prisma.user.findUnique({ where: { email: session.user.email } });
       if (user) {
          const { logDailyActivity } = await import("@/lib/streak-engine");
          await logDailyActivity(user.id, "video", 1);
       }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Mark complete error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
