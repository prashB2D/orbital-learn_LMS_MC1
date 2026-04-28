/**
 * Courses Management Page (Admin)
 * List all courses, create, edit, add content
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Users, DollarSign, Settings } from "lucide-react";
import { CourseActions } from "./CourseActions";
import { CourseCodeChip } from "./CourseCodeChip";
import { CourseSearch } from "./CourseSearch";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CoursesManagementPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const user = await getCurrentUser();
  const isMentor = user?.role === "MENTOR";

  let coursesWhereClause = {};
  if (isMentor) {
    const assignments = await prisma.courseAssignment.findMany({
      where: { mentorId: user.id },
      select: { courseId: true }
    });
    coursesWhereClause = { id: { in: assignments.map(a => a.courseId) } };
  }

  const q = searchParams?.q || "";
  if (q) {
    coursesWhereClause = {
      ...coursesWhereClause,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { courseCode: { contains: q, mode: 'insensitive' } }
      ]
    };
  }

  const courses = await prisma.course.findMany({
    where: coursesWhereClause,
    include: {
      _count: {
        select: { enrollments: true, contents: true },
      },
      enrollments: {
        include: { progress: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" /> {isMentor ? "My Assigned Courses" : "Course Catalog"}
          </h1>
          <p className="text-gray-500 mt-1 font-medium">{isMentor ? "Manage content for your assigned courses" : "Manage and publish your educational modules"}</p>
        </div>
        {!isMentor && (
          <Link 
            href="/admin/courses/create" 
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition shadow"
          >
            + New Course
          </Link>
        )}
      </div>

      <CourseSearch />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
              <div 
                className="h-48 w-full bg-cover bg-center border-b"
                style={{ backgroundImage: `url(${course.thumbnail})` }}
              />
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  {!isMentor && (
                    <CourseCodeChip code={course.courseCode} />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{course.title}</h3>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-sm font-medium text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg flex-wrap">
                  {!isMentor && <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-green-600"/> ₹{course.finalPrice}</span>}
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-600"/> {course._count.enrollments} Students</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-purple-600"/> {course._count.contents}</span>
                  {isMentor && (
                    <span className="flex items-center gap-1.5 text-orange-600 font-bold ml-auto">
                      {course._count.contents > 0 && course.enrollments.length > 0
                        ? `${Math.round((course.enrollments.reduce((acc, e) => acc + e.progress.filter(p => p.completed).length, 0) / (course.enrollments.length * course._count.contents)) * 100)}% Comp.`
                        : "0% Comp."}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2 mt-auto">
                  <Link href={`/admin/courses/${course.slug}/content`} className="text-center py-2 bg-blue-50 text-blue-700 font-semibold rounded hover:bg-blue-100 transition text-sm flex items-center justify-center">
                    Manage Modules & Content
                  </Link>
                  {!isMentor && <CourseActions courseId={course.id} courseSlug={course.slug} courseTitle={course.title} />}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white border border-dashed rounded-xl">
             <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <h3 className="text-xl font-bold text-gray-500">No courses yet</h3>
             <p className="text-gray-400">Click '+ New Course' above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
