/**
 * GET /api/admin/analytics/courses
 * Purpose: Get course analytics
 * Input: None
 * Output: {totalStudents, bestSellingCourse, coursesWithEnrollments: [{title, enrollments, revenue}]}
 * Auth Required: Yes (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const enrollments = await prisma.enrollment.findMany({
      include: { course: true },
    });

    const totalStudents = new Set(enrollments.map((e) => e.userId)).size;

    const courseStats: Record<string, any> = {};
    enrollments.forEach((e) => {
      if (!courseStats[e.courseId]) {
        courseStats[e.courseId] = {
          title: e.course.title,
          enrollments: 0,
          revenue: 0,
        };
      }
      courseStats[e.courseId].enrollments++;
    });

    // Get revenue via SUCCESS payments directly
    const payments = await prisma.payment.findMany({
      where: { status: "SUCCESS" },
    });
    
    payments.forEach((p) => {
      if (courseStats[p.courseId]) {
        courseStats[p.courseId].revenue += p.amount;
      }
    });

    const sortedCourses = Object.values(courseStats).sort(
      (a, b) => b.enrollments - a.enrollments
    );
    
    const bestSellingCourse = sortedCourses.length > 0 ? sortedCourses[0] : null;

    return NextResponse.json({
      totalStudents,
      bestSellingCourse,
      coursesWithEnrollments: sortedCourses,
    });
  } catch (error: any) {
    console.error("Courses analytics error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
