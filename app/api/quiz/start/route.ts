import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    // Sometimes it's passed as URL param, but we'll accept body
    const quizId = body.quizId;

    if (!quizId) {
      return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
    }

    const quiz = await prisma.content.findUnique({
      where: { id: quizId },
      select: { courseId: true, duration: true }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const previousAttemptsCount = await prisma.quizAttempt.count({
      where: { userId: user.id, quizId }
    });
    
    const attemptNumber = previousAttemptsCount + 1;
    const isFirstAttempt = attemptNumber === 1;

    const timerStartedAt = new Date();

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId,
        courseId: quiz.courseId,
        attemptNumber,
        answers: {}, // Pending answers
        score: 0,
        timeTaken: 0,
        skippedCount: 0,
        pointsEarned: 0,
        isFirstAttempt,
        timerStartedAt
      }
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      isFirstAttempt,
      timerStartedAt
    });

  } catch (error: any) {
    console.error("Quiz start error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
