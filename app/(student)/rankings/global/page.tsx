import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Trophy, Medal, Award, UserCircle2, Globe2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GlobalLeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const currentUserId = user.id;

  // 1. Get all attempts for all quizzes
  const allAttempts = await prisma.quizAttempt.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { score: "desc" },
  });

  // 2. Group by user AND quiz, keeping best score for each quiz
  // Structure: { userId: { quizId: bestScore } }
  const userQuizBestScores: Record<string, Record<string, number>> = {};
  const userNames: Record<string, string> = {};

  allAttempts.forEach((a) => {
    userNames[a.userId] = a.userId === currentUserId ? "You" : a.user.name;
    
    if (!userQuizBestScores[a.userId]) {
      userQuizBestScores[a.userId] = {};
    }
    
    // Update if first attempt for this quiz, or better score
    if (!userQuizBestScores[a.userId][a.quizId] || a.score > userQuizBestScores[a.userId][a.quizId]) {
      userQuizBestScores[a.userId][a.quizId] = a.score;
    }
  });

  // 3. Sum up the best scores across all quizzes for a "Global Score" (or Global Points)
  const globalScores: Record<string, any> = {};
  let absoluteHighestGlobalScore = 1; // avoid division by zero
  
  Object.keys(userQuizBestScores).forEach((userId) => {
    const totalScore = Object.values(userQuizBestScores[userId]).reduce((sum, score) => sum + score, 0);
    globalScores[userId] = {
      userId,
      userName: userNames[userId],
      totalPoints: Math.floor(totalScore), // 1 point per 1% on a quiz
    };
    if (totalScore > absoluteHighestGlobalScore) {
      absoluteHighestGlobalScore = totalScore;
    }
  });

  // 4. Sort and rank
  const leaderboard = Object.values(globalScores)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

  // 5. Find user's rank
  let yourRank = null;
  let yourTotalPoints = null;
  const userIndex = leaderboard.findIndex((e) => e.userId === currentUserId);
  if (userIndex !== -1) {
    yourRank = leaderboard[userIndex].rank;
    yourTotalPoints = leaderboard[userIndex].totalPoints;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden">
        <Globe2 className="absolute -top-6 -right-6 w-32 h-32 text-white/10" />
        <h1 className="text-4xl font-bold mb-4">Global Leaderboard</h1>
        <p className="text-xl text-green-100">Overall Points across All Quizzes</p>
      </div>

      {/* Your Rank Widget */}
      {(yourRank !== null && yourTotalPoints !== null) && (
        <div className="bg-white rounded-xl border p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-full text-green-600">
              <UserCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Global Position</p>
              <h2 className="text-2xl font-bold text-gray-900">Rank #{yourRank}</h2>
            </div>
          </div>
          <div className="text-right flex flex-col items-end w-1/3 min-w-[200px]">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Points</p>
            <p className={`text-4xl font-black mb-2 text-green-600`}>
              {yourTotalPoints} <span className="text-lg text-gray-400">pts</span>
            </p>
            {/* Visual Performance Bar relative to current #1 Player */}
            <div className="w-full bg-gray-100 rounded-full h-3 max-w-[250px] shadow-inner overflow-hidden border border-gray-200/50">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r from-green-400 to-green-500`} 
                style={{ width: `${Math.max((yourTotalPoints / absoluteHighestGlobalScore) * 100, 2)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Relative to Global #1</p>
          </div>
        </div>
      )}

      {/* Leaderboard Chart */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-green-600" /> Hall of Fame
        </h2>
        
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-semibold text-gray-600 text-sm tracking-wider uppercase">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-7">Student</div>
            <div className="col-span-3 text-right">Points</div>
          </div>

          {leaderboard.length > 0 ? (
            <div className="divide-y">
              {leaderboard.map((entry: any) => {
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

                // Calculate visual bar percentage relative to #1 player
                const visualPercent = Math.max((entry.totalPoints / absoluteHighestGlobalScore) * 100, 2);

                return (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-12 gap-4 p-4 items-center transition ${
                      isCurrentUser ? "bg-green-50/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="col-span-2 flex justify-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold shadow-sm ${rankStyle}`}>
                        {Icon ? Icon : entry.rank}
                      </div>
                    </div>
                    <div className="col-span-7 flex flex-col py-1">
                      <span
                        className={`font-semibold ${
                          isCurrentUser ? "text-green-700" : "text-gray-900"
                        }`}
                      >
                        {entry.userName}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs text-green-500 font-medium mb-1">This is you</span>
                      )}
                      
                      {/* Visual Peer Comparison Bar Graph */}
                      <div className="mt-2 text-xs flex items-center gap-3">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-sm">
                          <div 
                            className={`h-2 rounded-full ${entry.rank === 1 ? 'bg-yellow-400' : 'bg-green-500'}`} 
                            style={{ width: `${visualPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3 flex justify-end items-center font-bold text-lg text-gray-900">
                      <span className="bg-gray-100 px-3 py-1 rounded-md border text-sm">{entry.totalPoints} <span className="text-xs text-gray-500">pts</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 italic">
              No one has earned any points yet. Be the first to take a quiz!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
