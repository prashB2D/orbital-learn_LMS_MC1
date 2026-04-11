/**
 * POST /api/quiz/submit
 * Purpose: Submit quiz attempt (MULTIPLE ATTEMPTS allowed)
 * Input: {quizId, userId, answers: {questionId: selectedOptionIndex}}
 * Output: {success, score, attemptNumber, rank, totalAttempts}
 * Auth Required: Yes
 */

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

    // Parse specific shapes explicitly
    const { quizId, answers } = await request.json();

    if (!quizId || !answers) {
      return NextResponse.json({ error: "Missing payload params" }, { status: 400 });
    }

    // 1. Fetch source questions to evaluate correctness securely serverside
    const questions = await prisma.question.findMany({
      where: { contentId: quizId }
    });

    // 2. Score evaluation
    let correctCount = 0;
    questions.forEach((q) => {
      // Frontend submits answers explicitly keyed by question UUID mapping to index integers
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

    // 3. Increment attempt tracker natively mapped to this specific user
    const previousAttempts = await prisma.quizAttempt.count({
      where: { userId: user.id, quizId }
    });
    
    const attemptNumber = previousAttempts + 1;

    // 4. Save quiz attempt into DB
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId,
        attemptNumber,
        answers,
        score
      }
    });

    // 5. Leaderboard / Global Ranking Aggregation targeting best unique scores only
    const allBestScores = await prisma.quizAttempt.groupBy({
      by: ['userId'],
      where: { quizId },
      _max: { score: true }
    });
    
    // Flatten + Sort highest mapping
    const sortedScores = allBestScores
      .map(s => s._max.score || 0)
      .sort((a, b) => b - a);

    // Array index logic guarantees our relative placement integer via finding first equal/lesser marker.
    // e.g., mapping [100, 90, 80] targeting a 90 score trips index 1 natively => Rank 2.
    const rankIndex = sortedScores.findIndex(s => s <= score);
    const rank = rankIndex !== -1 ? rankIndex + 1 : sortedScores.length + 1;

    return NextResponse.json({
      success: true,
      score,
      attemptNumber,
      attemptId: attempt.id,
      rank,
      totalAttempts: attemptNumber
    });

  } catch (error: any) {
    console.error("Quiz submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
