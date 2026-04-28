/**
 * GET /api/quiz/leaderboard/[quizId]
 * Purpose: Get ranking for a quiz (top performers + user's rank)
 * Input: URL param: quizId
 * Output: {leaderboard: [{rank, userId, userName, bestScore}], yourRank, yourBestScore}
 * Auth Required: Yes
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await requireAuth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!currentUser) throw new Error("User not found");

    const currentUserId = currentUser.id;

    // 1. Get all first attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: params.quizId, isFirstAttempt: true },
      include: { user: { select: { name: true } } },
      orderBy: { score: "desc" },
    });

    // 2. Group by user, keep best score
    const bestScores: Record<string, any> = {};
    attempts.forEach((a) => {
      // If we don't have a score for this user yet, or this attempt's score is higher
      if (!bestScores[a.userId] || a.score > bestScores[a.userId].bestScore) {
        bestScores[a.userId] = {
          userId: a.userId,
          userName: a.userId === currentUserId ? "You" : a.user.name,
          bestScore: a.score,
        };
      }
    });

    // 3. Sort and rank
    const leaderboard = Object.values(bestScores)
      .sort((a, b) => b.bestScore - a.bestScore)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    // 4. Find user's rank
    let yourRank = null;
    let yourBestScore = null;
    const userIndex = leaderboard.findIndex((e) => e.userId === currentUserId);
    if (userIndex !== -1) {
      yourRank = leaderboard[userIndex].rank;
      yourBestScore = leaderboard[userIndex].bestScore;
    }

    return NextResponse.json({
      leaderboard,
      yourRank,
      yourBestScore,
    });
  } catch (error: any) {
    console.error("Leaderboard error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
