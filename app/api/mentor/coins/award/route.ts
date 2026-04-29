import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendNotification } from "@/lib/notification";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MENTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, courseId, quizId, externalCourseName, externalQuizRef, rank, amount, comment } = body;
    const reason = comment || body.reason;

    if (!studentId || !reason || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Security checks
    // 1. Verify mentor assigned to course (skip if Admin, skip if external)
    if (user.role === "MENTOR" && courseId) {
      const assignment = await prisma.courseAssignment.findUnique({
        where: { courseId_mentorId: { courseId, mentorId: user.id } }
      });
      if (!assignment) {
        return NextResponse.json({ error: "Not assigned to this course" }, { status: 403 });
      }
    }

    // 2. Verify student enrolled (only if courseId provided)
    if (courseId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: studentId, courseId } }
      });
      if (!enrollment) {
        return NextResponse.json({ error: "Student not enrolled in course" }, { status: 400 });
      }
    }

    // 3. Verify quiz attempted (only if quizId provided)
    let quizName = externalQuizRef || null;
    if (quizId) {
      const attempts = await prisma.quizAttempt.findFirst({
        where: { userId: studentId, quizId },
        include: { quiz: true }
      });
      if (!attempts) {
        return NextResponse.json({ error: "Student hasn't attempted this quiz" }, { status: 400 });
      }
      quizName = attempts.quiz.title;
    }

    // Amount is now passed from frontend but we can still validate if needed.
    const parsedAmount = parseInt(amount, 10);
    if (rank && ![1, 2, 3].includes(rank)) {
      return NextResponse.json({ error: "Invalid rank. Must be 1, 2, or 3." }, { status: 400 });
    }

    // Enforce mentor limits
    if (user.role === "MENTOR") {
      const firstOfMonth = new Date();
      firstOfMonth.setUTCDate(1);
      firstOfMonth.setUTCHours(0, 0, 0, 0);

      const awardedThisMonth = await prisma.coinTransaction.aggregate({
        where: {
          awardedById: user.id,
          awardedAt: { gte: firstOfMonth }
        },
        _sum: { amount: true }
      });

      const totalAwarded = awardedThisMonth._sum.amount || 0;
      if (totalAwarded + parsedAmount > user.coinAwardLimit) {
        return NextResponse.json({ error: `Monthly coin limit exceeded. You have ${user.coinAwardLimit - totalAwarded} coins left to award this month.` }, { status: 400 });
      }
    }

    // Transaction to update balance and create record
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const coinTx = await tx.coinTransaction.create({
        data: {
          userId: studentId,
          courseId: courseId || null,
          quizId: quizId || null,
          externalCourseName: externalCourseName || null,
          externalQuizRef: externalQuizRef || null,
          amount: parsedAmount,
          rank: rank || null,
          reason,
          mentorComment: comment || null,
          awardedById: user.id
        }
      });

      // Update student balance
      await tx.user.update({
        where: { id: studentId },
        data: { coinBalance: { increment: parsedAmount } }
      });

      return coinTx;
    });

    await sendNotification({
      userId: studentId,
      title: "Coins Earned!",
      message: rank ? `You earned ${parsedAmount} coins for ranking #${rank}!` : `You earned ${parsedAmount} coins!`,
      type: "COIN",
      payload: {
        amount: parsedAmount,
        rank,
        quizName,
        mentorName: user.name,
        reason: comment
      }
    });

    return NextResponse.json({ success: true, transaction: result }, { status: 201 });
  } catch (error: any) {
    console.error("Award coins error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
