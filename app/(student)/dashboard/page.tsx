/**
 * Student Dashboard
 * Shows enrolled courses, progress, certificates, quiz performance
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { PlayCircle, Trophy, Award, Download, Clock, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT COLUMN: ACTIVE COURSES */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <PlayCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">My Learning Path</h2>
          </div>

          {coursesWithProgress.length > 0 ? (
            <div className="space-y-4">
              {coursesWithProgress.map((course) => (
                <div key={course.id} className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-24 h-24 object-cover rounded-lg border bg-gray-100"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{course.title}</h3>
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="font-medium text-blue-600">{course.progressPercentage}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1.5 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              course.progressPercentage === 100 ? "bg-green-500" : "bg-blue-600"
                            }`}
                            style={{ width: `${course.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {course.progressPercentage < 100 ? (
                          <Link
                            href={`/courses/${course.slug}/learn`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                          >
                            Continue Learning
                          </Link>
                        ) : (
                          <div className="flex gap-2">
                            <Link
                              href={`/courses/${course.slug}/learn`}
                              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                            >
                              Review Material
                            </Link>
                            {course.certificateUrl && (
                              <a
                                href={course.certificateUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-200 transition flex items-center gap-1"
                              >
                                <Download className="w-4 h-4" /> Certificate
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
              <p>You haven't enrolled in any courses yet.</p>
              <Link href="/courses" className="text-blue-600 hover:underline mt-2 inline-block font-medium">Browse Catalog</Link>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: QUIZ PERFORMANCE */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Quiz Performance</h2>
          </div>

          <div className="bg-white rounded-xl border p-1 shadow-sm">
            {quizPerformance.length > 0 ? (
              <div className="divide-y">
                {quizPerformance.map((quiz) => (
                  <div key={quiz.quizId} className="p-4 hover:bg-gray-50 transition">
                    <h3 className="font-bold text-gray-900 mb-3">{quiz.quizTitle}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <span className="block text-xs font-bold text-blue-600 uppercase">Best Score</span>
                        <span className="text-xl font-black text-gray-900">{quiz.bestScore}%</span>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <span className="block text-xs font-bold text-purple-600 uppercase">Rank</span>
                        <span className="text-xl font-black text-gray-900">#{quiz.yourRank}</span>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg text-center flex flex-col justify-center items-center">
                        <Link href={`/rankings/${quiz.quizId}`} className="text-xs font-bold text-gray-600 hover:text-gray-900 hover:underline flex items-center gap-1">
                          <Trophy className="w-4 h-4" /> Leaderboard
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>You haven't attempted any quizzes yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

