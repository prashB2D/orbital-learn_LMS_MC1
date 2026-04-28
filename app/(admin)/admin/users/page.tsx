/**
 * Users Management Page (Admin)
 * View all registered students
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Search } from "lucide-react";
import MentorStudentsView from "./MentorStudentsView";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const admin = await getCurrentUser();
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "MENTOR")) {
    redirect("/login");
  }

  if (admin.role === "MENTOR") {
    // Fetch courses assigned to the mentor to populate the dropdown
    const assignments = await prisma.courseAssignment.findMany({
      where: { mentorId: admin.id },
      include: { course: { select: { id: true, title: true } } }
    });
    const mentorCourses = assignments.map(a => a.course);

    return (
      <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600">View and manage students in your assigned courses</p>
        </div>
        <MentorStudentsView mentorCourses={mentorCourses} />
      </div>
    );
  }

  const page = parseInt(searchParams.page || "1", 10);
  const search = searchParams.search || "";
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    skip,
    take: pageSize,
    include: {
      payments: {
        where: { status: "SUCCESS" },
        select: { amount: true },
      },
      enrollments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const usersWithStats = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    totalSpent: u.payments.reduce((sum, p) => sum + p.amount, 0),
    coursesEnrolled: u.enrollments.length,
  }));

  const totalUsers = await prisma.user.count({ where });
  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Directory</h1>
          <p className="text-gray-600">Manage {totalUsers} registered accounts</p>
        </div>
      </div>

      {/* Server-Action Driven Search Form */}
      <form className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Search
        </button>
        {search && (
          <Link
            href="/admin/users"
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center transition font-semibold text-gray-700"
          >
            Clear
          </Link>
        )}
      </form>

      {/* User Table */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Name
                </th>
                <th className="p-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Email
                </th>
                <th className="p-4 text-center font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Role
                </th>
                <th className="p-4 text-center font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Courses Enrolled
                </th>
                <th className="p-4 text-right font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Total Spent
                </th>
                <th className="p-4 text-right font-semibold text-gray-600 uppercase text-xs tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usersWithStats.length > 0 ? (
                usersWithStats.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/50 transition">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{u.name}</p>
                    </td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-gray-900">
                      {u.coursesEnrolled}
                    </td>
                    <td className="p-4 text-right font-black text-gray-900">
                      ₹{u.totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-right text-gray-500 text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 italic">
                    No users matching "{search}" were found.
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
            href={`/admin/users?page=${page > 1 ? page - 1 : 1}${
              search ? `&search=${search}` : ""
            }`}
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
            href={`/admin/users?page=${page < totalPages ? page + 1 : totalPages}${
              search ? `&search=${search}` : ""
            }`}
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

