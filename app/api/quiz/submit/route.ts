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
    const { quizId, answers, timeTaken = 0 } = await request.json();

    if (!quizId || !answers) {
      return NextResponse.json({ error: "Missing payload params" }, { status: 400 });
    }

    // 0. Fetch the quiz itself to get its courseId and duration
    const quiz = await prisma.content.findUnique({
      where: { id: quizId },
      select: { courseId: true, duration: true }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
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
    const skippedCount = Math.max(0, questions.length - Object.keys(answers).length);

    // Points Calc (Per-Course Schema)
    const maxTime = quiz.duration || 300; // default 5 min
    const validTimeTaken = Math.min(Math.max(timeTaken, 0), maxTime); 
    
    let pointsEarned = correctCount * 10;
    pointsEarned += 20; // Completion Bonus
    
    if (maxTime > 0) {
      pointsEarned += ((maxTime - validTimeTaken) / maxTime) * 5; // Time bonus
    }

    // 3. Increment attempt tracker 
    const previousAttempts = await prisma.quizAttempt.count({
      where: { userId: user.id, quizId }
    });
    
    const attemptNumber = previousAttempts + 1;

    // 4. Save detailed attempt into DB tracking CourseId for rapid retrieval
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId,
        courseId: quiz.courseId,
        attemptNumber,
        answers,
        score,
        timeTaken: validTimeTaken,
        skippedCount,
        pointsEarned
      }
    });

    return NextResponse.json({
      success: true,
      score,
      pointsEarned,
      attemptNumber,
      attemptId: attempt.id
    });

  } catch (error: any) {
    console.error("Quiz submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
