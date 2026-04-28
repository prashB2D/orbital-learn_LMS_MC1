/**
 * Student Dashboard
 * Shows enrolled courses, progress, certificates, quiz performance
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { PlayCircle, Trophy, Award, Download, Clock, BarChart3, Hexagon, Flame } from "lucide-react";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Coin data is fetched live by the client component

  // ===================================
  // 1. My Courses & Progress Logic
  // ===================================
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: true,
      progress: true,
      certificate: true,
    },
  });

  const coursesWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalContents = await prisma.content.count({
        where: { courseId: enrollment.courseId },
      });
      const completedContents = enrollment.progress.filter((p) => p.completed).length;
      const progressPercentage =
        totalContents > 0 ? (completedContents / totalContents) * 100 : 0;

      return {
        id: enrollment.course.id,
        slug: enrollment.course.slug,
        title: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
        progressPercentage: Math.round(progressPercentage),
        certificateUrl: enrollment.certificate?.pdfUrl,
      };
    })
  );

  // ===================================
  // 2. Quiz Performance Logic
  // ===================================
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id },
    include: { quiz: true },
  });

  const quizzesMap: Record<string, any> = {};
  quizAttempts.forEach((attempt) => {
    if (!quizzesMap[attempt.quizId]) {
      quizzesMap[attempt.quizId] = {
        quizId: attempt.quizId,
        quizTitle: attempt.quiz.title,
        attempts: [],
        bestScore: 0,
      };
    }
    quizzesMap[attempt.quizId].attempts.push({
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      date: attempt.createdAt,
    });
    if (attempt.score > quizzesMap[attempt.quizId].bestScore) {
      quizzesMap[attempt.quizId].bestScore = attempt.score;
    }
  });

  for (const quiz of Object.values(quizzesMap)) {
    const allBestScores = await prisma.quizAttempt.groupBy({
      by: ["userId"],
      where: { quizId: quiz.quizId },
      _max: { score: true },
    });
    const sortedScores = allBestScores
      .map((s) => s._max.score || 0)
      .sort((a, b) => b - a);
      
    const idx = sortedScores.findIndex((s) => s <= quiz.bestScore);
    quiz.yourRank = idx !== -1 ? idx + 1 : sortedScores.length + 1;
    quiz.totalAttempts = quiz.attempts.length;
  }

  const quizPerformance = Object.values(quizzesMap);

  // Coin history is fetched live by the client component

  const badges = await prisma.studentBadge.findMany({
    where: { userId: user.id },
    include: { badge: true },
    orderBy: { awardedAt: "desc" }
  });

  return (
    <DashboardClient 
      user={user}
      coursesWithProgress={coursesWithProgress}
      quizPerformance={quizPerformance}
      badges={badges}
    />
  );
}

