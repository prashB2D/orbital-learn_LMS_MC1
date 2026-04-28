import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MENTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const quizId = request.nextUrl.searchParams.get("quizId");
    if (!quizId) {
      return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
    }

    const quiz = await prisma.content.findUnique({
      where: { id: quizId },
      include: {
        quizAttempts: {
          where: { isFirstAttempt: true },
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: [{ score: "desc" }, { timeTaken: "asc" }]
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Get best attempt per user, keep top 3
    const bestAttempts = new Map();
    for (const attempt of quiz.quizAttempts) {
      if (!bestAttempts.has(attempt.userId)) {
        bestAttempts.set(attempt.userId, attempt);
      }
    }

    const leaderboard = Array.from(bestAttempts.values()).slice(0, 3).map((a, i) => ({
      userId: a.user.id,
      name: a.user.name,
      email: a.user.email,
      score: a.score,
      timeTaken: a.timeTaken,
      rank: i + 1,
      quizId: a.quizId,
      courseId: a.courseId
    }));

    // Check if mentor has already awarded coins for this quiz to these students
    const existingAwards = await prisma.coinTransaction.findMany({
      where: {
        awardedById: user.id,
        quizId: quizId,
        userId: { in: leaderboard.map(l => l.userId) }
      }
    });

    const leaderboardWithAwardStatus = leaderboard.map(l => ({
      ...l,
      alreadyAwarded: existingAwards.some(aw => aw.userId === l.userId)
    }));

    return NextResponse.json({ success: true, leaderboard: leaderboardWithAwardStatus });
  } catch (error: any) {
    console.error("Fetch quiz leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
