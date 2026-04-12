import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Trophy, Medal, Award, UserCircle2, BookOpen, Clock, Target, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CourseLeaderboardPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const currentUserId = user.id;

  // 1. Fetch Course and total quizzes
  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      contents: {
        where: { type: "QUIZ" },
        select: { id: true, title: true, questions: { select: { id: true } } }
      }
    }
  });

  if (!course) notFound();

  const totalCourseQuizzes = course.contents.length;
  // Map quiz data for quick lookup
  const quizMap = course.contents.reduce((acc: any, q) => {
    acc[q.id] = { title: q.title, questionCount: q.questions.length };
    return acc;
  }, {});

  // 2. Fetch all attempts for this specific course
  const allAttempts = await prisma.quizAttempt.findMany({
    where: { courseId: course.id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "asc" }, // Ascending for trend graphs naturally
  });

  // 3. Group By Student logic
  const studentStats: Record<string, any> = {};
  
  // Track personal attempts strictly for the report
  const myAttempts: any[] = []; 

  allAttempts.forEach((attempt) => {
    const isMe = attempt.userId === currentUserId;
    if (isMe) myAttempts.push(attempt);

    if (!studentStats[attempt.userId]) {
      studentStats[attempt.userId] = {
        userId: attempt.userId,
        userName: isMe ? "You" : attempt.user.name,
        bestPerQuiz: {} as Record<string, any>,
        totalAttempts: 0,
        totalCorrectAnswers: 0,
        totalQuestionsAnswered: 0
      };
    }

    const s = studentStats[attempt.userId];
    s.totalAttempts++;
    s.totalCorrectAnswers += (attempt.score / 100) * (quizMap[attempt.quizId]?.questionCount || 10);
    s.totalQuestionsAnswered += (quizMap[attempt.quizId]?.questionCount || 10);

    // Keep best attempt per quiz for Leaderboard
    const existingBest = s.bestPerQuiz[attempt.quizId];
    if (!existingBest || attempt.pointsEarned > existingBest.pointsEarned) {
      s.bestPerQuiz[attempt.quizId] = attempt;
    }
  });

  // 4. Calculate Final Leaderboard Ranks
  const leaderboard = Object.values(studentStats).map((s: any) => {
    const bestAttempts = Object.values(s.bestPerQuiz) as any[];
    
    // Total Points = SUM(points_earned)
    const total_points = bestAttempts.reduce((sum, a) => sum + a.pointsEarned, 0);
    // Quizzes Done = COUNT(DISTINCT quiz_id)
    const quizzes_done = bestAttempts.length;
    // Avg Time = AVG(time_seconds)
    const avg_time = quizzes_done > 0 
      ? bestAttempts.reduce((sum, a) => sum + a.timeTaken, 0) / quizzes_done 
      : 0;

    return {
      userId: s.userId,
      userName: s.userName,
      total_points: Math.floor(total_points),
      quizzes_done,
      avg_time: Math.floor(avg_time),
      accuracy: s.totalQuestionsAnswered > 0 ? (s.totalCorrectAnswers / s.totalQuestionsAnswered) * 100 : 0
    };
  });

  // Sort: Total Points (DESC), Quizzes Done (DESC), Avg Time (ASC)
  leaderboard.sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    if (b.quizzes_done !== a.quizzes_done) return b.quizzes_done - a.quizzes_done;
    return a.avg_time - b.avg_time;
  });

  // Assign Ranks
  leaderboard.forEach((entry, idx) => {
    (entry as any).rank = idx + 1;
  });

  // 5. Personal Student Report variables
  const myStats = leaderboard.find(e => e.userId === currentUserId);
  const myBestAttemptsRecords = studentStats[currentUserId]?.bestPerQuiz || {};
  const myChartData = myAttempts.slice(-10); // Last 10 tracking

  // Max points logic for visual bars
  const highestPoints = leaderboard.length > 0 ? leaderboard[0].total_points : 1;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{course.title} Leaderboard</h1>
          <p className="text-gray-500 font-medium mt-1">Course-specific Gamification & Personalized Reports</p>
        </div>
        <Link href={`/courses/${course.slug}/learn`} className="bg-gray-100 px-5 py-2.5 rounded-lg border font-bold hover:bg-gray-200 transition text-gray-700">
          Return to Course
        </Link>
      </div>

      {myStats ? (
        <>
          {/* PERSONAL STUDENT REPORT */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
              <UserCircle2 className="w-6 h-6 text-blue-600" /> Your Personal Report
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Completion</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-blue-600">{myStats.quizzes_done}</span>
                  <span className="text-gray-400 font-semibold mb-1">/ {totalCourseQuizzes} Quizzes</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Overall Accuracy</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-green-600">{Math.floor(myStats.accuracy)}%</span>
                  <span className="text-gray-400 font-semibold mb-1">Correct</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Speed Avg</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-purple-600">{myStats.avg_time}</span>
                  <span className="text-gray-400 font-semibold mb-1">s / quiz</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Global Rank</p>
                 <div className="text-3xl font-black text-orange-500">#{myStats.rank}</div>
              </div>
            </div>

            {/* Per Quiz Breakdown & Sparkline (Trend) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 p-4 border-b font-bold tracking-tight text-gray-700 flex items-center gap-2">
                   <BookOpen className="w-5 h-5" /> Per-Quiz Breakdown
                </div>
                <div className="divide-y max-h-[300px] overflow-y-auto">
                   {Object.keys(myBestAttemptsRecords).length > 0 ? (
                     Object.entries(myBestAttemptsRecords).map(([qId, attempt]: [string, any]) => (
                       <div key={qId} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition">
                         <div>
                            <p className="font-bold text-gray-900">{quizMap[qId]?.title || "Unknown Quiz"}</p>
                            <p className="text-xs text-gray-500 font-medium">Attempt #{attempt.attemptNumber}</p>
                         </div>
                         <div className="flex items-center gap-6 shrink-0">
                           <div className="text-right">
                             <p className="text-[10px] uppercase font-bold text-gray-400">Score</p>
                             <p className="font-black text-green-600">{Math.floor(attempt.score)}%</p>
                           </div>
                           <div className="text-right">
                             <p className="text-[10px] uppercase font-bold text-gray-400">Time</p>
                             <p className="font-bold text-gray-700 flex items-center gap-1"><Clock className="w-3 h-3"/> {attempt.timeTaken}s</p>
                           </div>
                           <div className="text-right">
                             <p className="text-[10px] uppercase font-bold text-gray-400">Skipped</p>
                             <p className="font-bold text-gray-700">{attempt.skippedCount}</p>
                           </div>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-8 text-center text-gray-500 text-sm">No completed quizzes to break down.</div>
                   )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                 <div className="bg-gray-50 p-4 border-b font-bold tracking-tight text-gray-700 flex items-center gap-2">
                   <Target className="w-5 h-5" /> Recent Trends (Last 10)
                 </div>
                 <div className="flex-1 p-6 flex items-end justify-between gap-2 h-48">
                   {myChartData.length > 0 ? (
                     myChartData.map((att, i) => (
                       <div key={i} className="relative flex-1 flex flex-col justify-end group h-full">
                         {/* Tooltip */}
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition">
                           {Math.floor(att.score)}%
                         </div>
                         {/* Bar */}
                         <div 
                           className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-400 transition-all duration-500"
                           style={{ height: `${Math.max(att.score, 5)}%` }} // Ensure min height 5% to be visible
                         ></div>
                       </div>
                     ))
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 font-medium">Not enough data</div>
                   )}
                 </div>
              </div>

            </div>
          </section>
        </>
      ) : (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded-xl font-medium flex items-center gap-3">
          <Clock className="w-6 h-6 shrink-0" />
          You haven't completed any quizzes for this course yet! Take a quiz to unlock your personal report.
        </div>
      )}

      {/* COURSE LEADERBOARD */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <Trophy className="w-6 h-6 text-yellow-500" /> Top Ranks
        </h2>
        
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-bold text-gray-500 text-xs tracking-wider uppercase">
            <div className="col-span-1 text-center">Rnk</div>
            <div className="col-span-5">Student</div>
            <div className="col-span-3 text-center hidden md:block">Quizzes Done</div>
            <div className="col-span-6 md:col-span-3 text-right">Total Points</div>
          </div>

          {leaderboard.length > 0 ? (
            <div className="divide-y">
              {leaderboard.map((entry: any) => {
                const isCurrentUser = entry.userId === currentUserId;
                let rankStyle = "bg-gray-100 text-gray-600";
                
                if (entry.rank === 1) rankStyle = "bg-yellow-100 text-yellow-600";
                else if (entry.rank === 2) rankStyle = "bg-gray-200 text-gray-700";
                else if (entry.rank === 3) rankStyle = "bg-orange-100 text-orange-600";

                return (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-12 gap-4 p-4 items-center transition ${
                      isCurrentUser ? "bg-blue-50/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="col-span-1 flex justify-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold shadow-sm text-sm ${rankStyle}`}>
                        {entry.rank}
                      </div>
                    </div>
                    <div className="col-span-5 flex flex-col py-1">
                      <span className={`font-bold ${isCurrentUser ? "text-blue-700" : "text-gray-900"}`}>
                        {entry.userName}
                      </span>
                      {isCurrentUser && <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">This is you</span>}
                      
                      {/* Visual Peer Comparison Bar Graph */}
                      <div className="mt-2 text-xs flex items-center gap-3">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[200px]">
                          <div 
                            className={`h-1.5 rounded-full ${entry.rank === 1 ? 'bg-yellow-400' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.max((entry.total_points / highestPoints) * 100, 2)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3 items-center justify-center flex hidden md:flex font-bold text-gray-600 text-sm">
                       {entry.quizzes_done} <span className="text-gray-400 ml-1">/ {totalCourseQuizzes}</span>
                    </div>
                    <div className="col-span-6 md:col-span-3 flex justify-end items-center font-black text-xl text-gray-900">
                      <span className="bg-gray-100 px-3 py-1 rounded-lg border border-gray-200/50">{entry.total_points}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 font-medium">
              No students have taken quizzes in this course yet.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
