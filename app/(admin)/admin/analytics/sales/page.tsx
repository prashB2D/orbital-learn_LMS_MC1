/**
 * Sales Analytics Page
 * Revenue, transactions, revenue per course
 */

export default function SalesAnalyticsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Sales Analytics</h1>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold">₹TODO</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-3xl font-bold">TODO</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-600">Avg Transaction</p>
          <p className="text-3xl font-bold">₹TODO</p>
        </div>
      </div>

      {/* TODO: Fetch from GET /api/admin/analytics/sales */}
      {/* TODO: Display revenue chart */}
      {/* TODO: Display revenue per course table */}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Course</th>
              <th className="p-4 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Map revenue data */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
