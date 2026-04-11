/**
 * Quiz Analytics Page
 * Top performers, average scores, attempts
 */

export default function QuizAnalyticsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Quiz Analytics</h1>

      {/* TODO: Fetch from GET /api/admin/analytics/quizzes */}
      {/* TODO: Display per-quiz analytics */}

      <div className="space-y-6">
        {/* Sample Quiz Analytics Card */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-bold text-lg mb-4">React Basics Quiz</h3>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold">TODO %</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Attempts</p>
              <p className="text-2xl font-bold">TODO</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Score</p>
              <p className="text-2xl font-bold">TODO %</p>
            </div>
          </div>

          {/* Top Performers */}
          <div>
            <h4 className="font-semibold mb-3">Top Performers</h4>
            <div className="space-y-2">
              {/* TODO: Map top performers */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
