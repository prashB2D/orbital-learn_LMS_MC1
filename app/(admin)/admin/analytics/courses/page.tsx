/**
 * Course Analytics Page
 * Best selling, most popular, revenue per course
 */

export default function CourseAnalyticsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Course Analytics</h1>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-600">Total Courses</p>
          <p className="text-3xl font-bold">TODO</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-3xl font-bold">TODO</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-600">Best Selling</p>
          <p className="text-lg font-bold">TODO</p>
        </div>
      </div>

      {/* TODO: Fetch from GET /api/admin/analytics/courses */}
      {/* TODO: Display courses table with enrollments */}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Course</th>
              <th className="p-4 text-right">Enrollments</th>
              <th className="p-4 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Map course data */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
