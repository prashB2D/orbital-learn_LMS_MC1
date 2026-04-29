/**
 * Student Layout
 * Wrapper for all student pages (dashboard, courses, etc.)
 */

import Link from "next/link";
import { BookOpen, User, LogOut, LayoutDashboard, Compass, Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import RoleGuard from "@/components/auth/RoleGuard";
import RewardPopup from "@/app/components/student/RewardPopup";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await getCurrentUser();
  if (!student) redirect("/login");

  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Horbiteal LMS</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition flex items-center gap-1.5">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/courses" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition flex items-center gap-1.5">
            <Compass className="w-4 h-4" /> Explore Courses
          </Link>
          <Link href="/rankings/global" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Leaderboards
          </Link>
          <Link href="/profile" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition flex items-center gap-1.5">
            <User className="w-4 h-4" /> Profile
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="hidden text-right md:block">
               <p className="text-sm font-bold text-gray-900 leading-tight">{student.name}</p>
               <p className="text-xs text-gray-500 font-medium">{student.role}</p>
             </div>
             <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border text-blue-700 font-bold">
               {student.name[0]}
             </div>
             <LogoutButton className="hidden md:flex p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-[1400px] w-full mx-auto">{children}</main>

      <RewardPopup />

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold">Dashboard</span>
        </Link>
        <Link href="/courses" className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600">
          <Compass className="w-6 h-6" />
          <span className="text-[10px] font-bold">Explore</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
    </RoleGuard>
  );
}

