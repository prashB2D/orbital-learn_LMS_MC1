/**
 * GET /api/quiz/attempts/[quizId]
 * Purpose: Get all attempts by current user for a quiz
 * Input: URL param: quizId
 * Output: {attempts: [{attemptNumber, score, createdAt}], bestScore}
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) throw new Error("User not found");

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        quizId: params.quizId,
      },
      orderBy: {
        attemptNumber: "asc",
      },
      select: {
        attemptNumber: true,
        score: true,
        createdAt: true,
      },
    });

    const bestScore = attempts.length > 0
      ? Math.max(...attempts.map((a) => a.score))
      : 0;

    return NextResponse.json({ attempts, bestScore });
  } catch (error: any) {
    console.error("Get attempts error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
