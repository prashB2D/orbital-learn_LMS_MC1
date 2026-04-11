/**
 * Rankings Page
 * Show leaderboard for a specific quiz
 */

export default function RankingsPage({
  params,
}: {
  params: { quizId: string };
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Quiz Rankings</h1>
        <p className="text-gray-600">See how you rank against other students</p>
      </div>

      {/* TODO: Fetch from GET /api/quiz/leaderboard/[quizId] */}
      {/* TODO: Display leaderboard table */}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Your Score Box */}
        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
          <p className="text-sm text-gray-600">Your Rank</p>
          <p className="text-3xl font-bold text-blue-600">TODO: Your Rank</p>
          <p className="text-sm text-gray-600 mt-2">Best Score: TODO</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Rank</th>
              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Map leaderboard data */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
