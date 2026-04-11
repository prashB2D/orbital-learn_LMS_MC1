/**
 * Analytics Page (Admin)
 * Overview of sales, courses, and quizzes
 */

import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600">View detailed reports and statistics</p>
      </div>

      {/* Analytics Links */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/admin/analytics/sales" className="p-6 bg-white rounded-lg border hover:shadow">
          <h3 className="font-bold mb-2">Sales Analytics</h3>
          <p className="text-gray-600">Revenue and transactions</p>
        </Link>
        <Link href="/admin/analytics/courses" className="p-6 bg-white rounded-lg border hover:shadow">
          <h3 className="font-bold mb-2">Course Analytics</h3>
          <p className="text-gray-600">Enrollments and performance</p>
        </Link>
        <Link href="/admin/analytics/quizzes" className="p-6 bg-white rounded-lg border hover:shadow">
          <h3 className="font-bold mb-2">Quiz Analytics</h3>
          <p className="text-gray-600">Student scores and rankings</p>
        </Link>
      </div>
    </div>
  );
}
