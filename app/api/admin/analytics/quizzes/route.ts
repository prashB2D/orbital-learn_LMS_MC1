/**
 * GET /api/admin/analytics/quizzes
 * Purpose: Get quiz analytics
 * Input: None
 * Output: {quizzes: [{quizTitle, topPerformers: [{userName, score}], averageScore, totalAttempts}]}
 * Auth Required: Yes (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const quizzes = await prisma.content.findMany({
      where: { type: "QUIZ" },
      include: {
        questions: true,
      },
    });

    const analytics = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await prisma.quizAttempt.findMany({
          where: { quizId: quiz.id },
          include: { user: true },
        });

        const bestScores: Record<string, any> = {};
        attempts.forEach((a) => {
          if (!bestScores[a.userId] || a.score > bestScores[a.userId].score) {
            bestScores[a.userId] = { userName: a.user.name, score: a.score };
          }
        });

        const topPerformers = Object.values(bestScores)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        const averageScore =
          attempts.length > 0
            ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
            : 0;

        return {
          quizTitle: quiz.title,
          topPerformers,
          averageScore,
          totalAttempts: attempts.length,
        };
      })
    );

    return NextResponse.json({ quizzes: analytics });
  } catch (error: any) {
    console.error("Quizzes analytics error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
