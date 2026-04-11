import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Search, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; status?: string };
}) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1", 10);
  const search = searchParams.search || "";
  const status = searchParams.status || "ALL";

  const pageSize = 15;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { user: { email: { contains: search, mode: "insensitive" } } },
      { razorpayOrderId: { contains: search, mode: "insensitive" } },
    ];
  }

  const transactions = await prisma.payment.findMany({
    where,
    skip,
    take: pageSize,
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const summary = await prisma.$transaction([
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.count({ where: { status: "SUCCESS" } }),
    prisma.payment.count({ where: { status: "FAILED" } }),
    prisma.payment.count(),
  ]);

  const totalFilteredTransactions = await prisma.payment.count({ where });
  const totalPages = Math.ceil(totalFilteredTransactions / pageSize);

  const stats = {
    totalRevenue: summary[0]._sum.amount || 0,
    totalTransactions: summary[3],
    successfulTransactions: summary[1],
    failedTransactions: summary[2],
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions Ledger</h1>
          <p className="text-gray-600">Track incoming financial settlements globally.</p>
        </div>
      </div>

      {/* Analytics Widget */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase">Total Revenue</p>
          <p className="text-2xl font-black text-green-600">
            ₹{stats.totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase">Transactions</p>
          <p className="text-2xl font-black text-gray-900">{stats.totalTransactions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase">Successful</p>
          <p className="text-2xl font-black text-blue-600">{stats.successfulTransactions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase">Failed</p>
          <p className="text-2xl font-black text-red-600">{stats.failedTransactions}</p>
        </div>
      </div>

      {/* Forms & Filters */}
      <form className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by order ID or user email..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative w-48">
          <select
            name="status"
            defaultValue={status}
            className="w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <button
          type="submit"
          className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Filter
        </button>
        {(search || status !== "ALL") && (
          <Link
            href="/admin/transactions"
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center transition font-semibold text-gray-700"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Transactions Table View */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Date
                </th>
                <th className="p-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Order ID
                </th>
                <th className="p-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Student Name
                </th>
                <th className="p-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Course
                </th>
                <th className="p-4 text-center font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="p-4 text-right font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tx.razorpayOrderId}
                      </span>
                    </td>
                    <td className="p-4 text-gray-900 font-medium">{tx.user.name}</td>
                    <td className="p-4 text-gray-900">{tx.course.title}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          tx.status === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : tx.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-gray-900">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 italic">
                    No transactions matched your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <Link
            href={`/admin/transactions?page=${page > 1 ? page - 1 : 1}${
              search ? `&search=${search}` : ""
            }${status && status !== "ALL" ? `&status=${status}` : ""}`}
            className={`px-4 py-2 rounded-lg font-semibold border ${
              page === 1
                ? "bg-gray-50 text-gray-400 pointer-events-none"
                : "bg-white text-gray-700 hover:bg-gray-50 transition"
            }`}
          >
            Previous
          </Link>
          <span className="text-gray-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/admin/transactions?page=${page < totalPages ? page + 1 : totalPages}${
              search ? `&search=${search}` : ""
            }${status && status !== "ALL" ? `&status=${status}` : ""}`}
            className={`px-4 py-2 rounded-lg font-semibold border ${
              page === totalPages
                ? "bg-gray-50 text-gray-400 pointer-events-none"
                : "bg-white text-gray-700 hover:bg-gray-50 transition"
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
