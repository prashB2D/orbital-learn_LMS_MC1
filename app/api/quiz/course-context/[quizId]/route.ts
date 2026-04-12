import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { quizId: string } }) {
  try {
    const session = await requireAuth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const currentUserId = user.id;

    // 1. Get Quiz and Course Details
    const quiz = await prisma.content.findUnique({
      where: { id: params.quizId },
      include: {
        course: {
          include: { contents: { where: { type: "QUIZ" }, select: { id: true, title: true } } }
        }
      }
    });

    if (!quiz || !quiz.course) return NextResponse.json({ error: "Quiz or Course not found" }, { status: 404 });

    const totalQuizzes = quiz.course.contents.length;
    const courseId = quiz.course.id;

    // 2. Build exactly the same aggregate leaderboard logic for the miniature view
    const allAttempts = await prisma.quizAttempt.findMany({
      where: { courseId },
      include: { user: { select: { name: true } } },
    });

    const studentStats: Record<string, any> = {};
    let myCompletedQuizIds = new Set<string>();

    allAttempts.forEach((attempt) => {
      const isMe = attempt.userId === currentUserId;
      if (isMe) myCompletedQuizIds.add(attempt.quizId);

      if (!studentStats[attempt.userId]) {
        studentStats[attempt.userId] = {
          userId: attempt.userId,
          userName: isMe ? "You" : attempt.user.name,
          bestPerQuiz: {} as Record<string, any>,
        };
      }

      const s = studentStats[attempt.userId];
      const existingBest = s.bestPerQuiz[attempt.quizId];
      if (!existingBest || attempt.pointsEarned > existingBest.pointsEarned) {
        s.bestPerQuiz[attempt.quizId] = attempt;
      }
    });

    // 3. Calculate Leaderboard
    const leaderboard = Object.values(studentStats).map((s: any) => {
      const bestAttempts = Object.values(s.bestPerQuiz) as any[];
      const total_points = bestAttempts.reduce((sum, a) => sum + a.pointsEarned, 0);
      const quizzes_done = bestAttempts.length;
      return {
        userId: s.userId,
        userName: s.userName,
        total_points: Math.floor(total_points),
        quizzes_done,
      };
    });

    leaderboard.sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      return b.quizzes_done - a.quizzes_done;
    });

    leaderboard.forEach((entry, idx) => {
      (entry as any).rank = idx + 1;
    });

    // Extract Top 3 + Me
    const top3 = leaderboard.slice(0, 3);
    const myRankEntry = leaderboard.find(e => e.userId === currentUserId);
    
    // Ensure "Me" is included if not in Top 3
    const finalMiniLeaderboard = [...top3];
    if (myRankEntry && !top3.some(e => e.userId === currentUserId)) {
      finalMiniLeaderboard.push(myRankEntry);
    }

    return NextResponse.json({
      success: true,
      courseQuizzes: totalQuizzes,
      myCompletedCount: myCompletedQuizIds.size,
      miniLeaderboard: finalMiniLeaderboard,
      courseSlug: quiz.course.slug
    });

  } catch (error: any) {
    console.error("Course Context fetch error:", error);
    return NextResponse.json({ error: "Context fetch failed" }, { status: 500 });
  }
}
