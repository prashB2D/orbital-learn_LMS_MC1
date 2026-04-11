/**
 * Admin Dashboard
 * Overview of sales, courses, and users
 */

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your LMS platform</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* TODO: Fetch analytics data */}
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold">TODO</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-3xl font-bold">TODO</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-600">Total Courses</p>
          <p className="text-3xl font-bold">TODO</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-3xl font-bold">TODO</p>
        </div>
      </div>

      {/* Links to Management Pages */}
      <div className="grid md:grid-cols-3 gap-6">
        <a href="/admin/courses" className="p-6 bg-white rounded-lg border hover:shadow">
          <h3 className="font-bold mb-2">Manage Courses</h3>
          <p className="text-gray-600">Create and edit courses</p>
        </a>
        <a href="/admin/users" className="p-6 bg-white rounded-lg border hover:shadow">
          <h3 className="font-bold mb-2">View Users</h3>
          <p className="text-gray-600">See all registered students</p>
        </a>
        <a href="/admin/analytics" className="p-6 bg-white rounded-lg border hover:shadow">
          <h3 className="font-bold mb-2">Analytics</h3>
          <p className="text-gray-600">View detailed reports</p>
        </a>
      </div>
    </div>
  );
}
