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
import { logDailyActivity } from "@/lib/streak-engine";

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
    const { attemptId, answers, questionTimes, timeTaken = 0 } = await request.json();

    if (!attemptId || !answers) {
      return NextResponse.json({ error: "Missing payload params" }, { status: 400 });
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId }
    });

    if (!attempt || attempt.userId !== user.id) {
       return NextResponse.json({ error: "Attempt not found or unauthorized" }, { status: 404 });
    }

    // 0. Fetch the quiz itself to get its courseId and duration
    const quiz = await prisma.content.findUnique({
      where: { id: attempt.quizId },
      select: { courseId: true, duration: true }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // 1. Fetch source questions to evaluate correctness securely serverside
    const questions = await prisma.question.findMany({
      where: { contentId: attempt.quizId }
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
    const skippedCount = Math.max(0, questions.length - Object.keys(answers).length);

    // Points Calc (Per-Course Schema)
    const maxTime = quiz.duration || 300; // default 5 min
    const validTimeTaken = Math.min(Math.max(timeTaken, 0), maxTime); 
    
    let pointsEarned = 0;
    // Only award XP if first attempt
    if (attempt.isFirstAttempt) {
      pointsEarned = correctCount * 10;
      pointsEarned += 20; // Completion Bonus
      
      if (maxTime > 0) {
        pointsEarned += ((maxTime - validTimeTaken) / maxTime) * 5; // Time bonus
      }
    }

    // 4. Update the pending attempt in DB
    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        answers,
        score,
        timeTaken: validTimeTaken,
        skippedCount,
        pointsEarned,
        timerStoppedAt: new Date(),
        questionTimes: questionTimes || null
      }
    });

    // Auto Progress if score >= 60
    if (score >= 60) {
      // Find enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: quiz.courseId } }
      });
      if (enrollment) {
        await prisma.progress.upsert({
          where: { enrollmentId_contentId: { enrollmentId: enrollment.id, contentId: attempt.quizId } },
          create: { enrollmentId: enrollment.id, contentId: attempt.quizId, completed: true, completedAt: new Date() },
          update: { completed: true, completedAt: new Date() }
        });
      }
    }

    // Daily Activity Logging (Heatmap + Streak trigger)
    if (attempt.isFirstAttempt) {
      await logDailyActivity(user.id, "quiz", 1);
    }

    return NextResponse.json({
      success: true,
      score,
      pointsEarned,
      attemptNumber: attempt.attemptNumber,
      attemptId: attempt.id
    });

  } catch (error: any) {
    console.error("Quiz submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
