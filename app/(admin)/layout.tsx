/**
 * Admin Layout
 * Wrapper for all admin pages
 */

import { LogOut, BookOpen, Users, DollarSign, BarChart, Settings, Search, Award, GraduationCap, ShoppingBag, Share2, Tag, Coins } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton"; // We will create this
import RoleGuard from "@/components/auth/RoleGuard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentUser();
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "MENTOR")) {
    redirect("/login");
  }

  const isMentor = admin.role === "MENTOR";

  return (
    <RoleGuard allowedRoles={["ADMIN", "MENTOR"]}>
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0">
        <div className="p-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">LMS Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-1">
          {!isMentor && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition font-medium"
            >
              <BarChart className="w-5 h-5" /> Analytics
            </Link>
          )}
          <Link
            href="/admin/courses"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition font-medium"
          >
            <BookOpen className="w-5 h-5" /> {isMentor ? "My Courses" : "Courses"}
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition font-medium"
          >
            <Users className="w-5 h-5" /> Students
          </Link>
          {!isMentor && (
            <Link
              href="/admin/mentors"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition font-medium"
            >
              <GraduationCap className="w-5 h-5" /> Mentors
            </Link>
          )}
          {!isMentor && (
            <Link
              href="/admin/transactions"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition font-medium"
            >
              <DollarSign className="w-5 h-5" /> Transactions
            </Link>
          )}
          <Link
            href="/admin/badges"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition font-medium"
          >
            <Award className="w-5 h-5" /> Badges
          </Link>
          {!isMentor && (
            <Link
              href="/admin/store"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition font-medium"
            >
              <ShoppingBag className="w-5 h-5" /> Store
            </Link>
          )}
          {!isMentor && (
            <Link
              href="/admin/referrals"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition font-medium"
            >
              <Share2 className="w-5 h-5" /> Referrals
            </Link>
          )}
          {!isMentor && (
            <Link
              href="/admin/coupons"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition font-medium"
            >
              <Tag className="w-5 h-5" /> Coupons
            </Link>
          )}
          {!isMentor && (
            <Link
              href="/admin/coins"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition font-medium"
            >
              <Coins className="w-5 h-5" /> Coin Oversight
            </Link>
          )}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white uppercase flex-shrink-0">
              {admin.name[0]}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-sm font-medium text-white truncate">{admin.name}</p>
              <p className="text-xs text-gray-400 truncate">{admin.email}</p>
            </div>
          </div>
          <div className="mt-2 text-center pb-2">
           <LogoutButton className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white/5 hover:bg-white/10 text-red-400 hover:text-red-300 rounded-lg transition text-sm font-semibold" />
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="relative w-96 hidden md:block">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search administration..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-blue-500 focus:bg-white transition text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-4 flex-1 justify-end">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
    </RoleGuard>
  );
}

