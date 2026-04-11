import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Trophy, Medal, Award, UserCircle2 } from "lucide-react";

export default async function LeaderboardPage({
  params,
}: {
  params: { quizId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const currentUserId = user.id;

  // Verify quiz exists
  const quiz = await prisma.content.findUnique({
    where: { id: params.quizId },
    select: { title: true, courseId: true },
  });

  if (!quiz) {
    notFound();
  }

  // 1. Get all attempts
  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId: params.quizId },
    include: { user: { select: { name: true } } },
    orderBy: { score: "desc" },
  });

  // 2. Group by user, keep best score
  const bestScores: Record<string, any> = {};
  attempts.forEach((a) => {
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

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden">
        <Trophy className="absolute -top-6 -right-6 w-32 h-32 text-white/10" />
        <h1 className="text-4xl font-bold mb-4">Quiz Leaderboard</h1>
        <p className="text-xl text-blue-100">{quiz.title}</p>
      </div>

      {/* Your Rank Widget */}
      {yourRank && (
        <div className="bg-white rounded-xl border p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600">
              <UserCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Position</p>
              <h2 className="text-2xl font-bold text-gray-900">Rank #{yourRank}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Best Score</p>
            <p className="text-3xl font-black text-green-600">{yourBestScore}%</p>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-semibold text-gray-600 text-sm tracking-wider uppercase">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-7">Student</div>
          <div className="col-span-3 text-right">Score</div>
        </div>

        {leaderboard.length > 0 ? (
          <div className="divide-y">
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.userId === currentUserId;
              let rankStyle = "bg-gray-100 text-gray-600";
              let Icon = null;

              if (entry.rank === 1) {
                rankStyle = "bg-yellow-100 text-yellow-600";
                Icon = <Trophy className="w-5 h-5" />;
              } else if (entry.rank === 2) {
                rankStyle = "bg-gray-200 text-gray-700";
                Icon = <Medal className="w-5 h-5" />;
              } else if (entry.rank === 3) {
                rankStyle = "bg-orange-100 text-orange-600";
                Icon = <Award className="w-5 h-5" />;
              }

              return (
                <div
                  key={entry.userId}
                  className={`grid grid-cols-12 gap-4 p-4 items-center transition ${
                    isCurrentUser ? "bg-blue-50/50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="col-span-2 flex justify-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold shadow-sm ${rankStyle}`}>
                      {Icon ? Icon : entry.rank}
                    </div>
                  </div>
                  <div className="col-span-7 flex flex-col">
                    <span
                      className={`font-semibold ${
                        isCurrentUser ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {entry.userName}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs text-blue-500 font-medium">This is you</span>
                    )}
                  </div>
                  <div className="col-span-3 text-right font-bold text-lg text-gray-900">
                    {entry.bestScore}%
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 italic">
            No one has completed this quiz yet. Be the first!
          </div>
        )}
      </div>
    </div>
  );
}
