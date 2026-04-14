/**
 * Courses Management Page (Admin)
 * List all courses, create, edit, add content
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Users, DollarSign, Settings } from "lucide-react";
import { CourseActions } from "./CourseActions";

export const dynamic = "force-dynamic";

export default async function CoursesManagementPage() {
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: { enrollments: true, contents: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" /> Course Catalog
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Manage and publish your educational modules</p>
        </div>
        <Link 
          href="/admin/courses/create" 
          className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition shadow"
        >
          + New Course
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
              <div 
                className="h-48 w-full bg-cover bg-center border-b"
                style={{ backgroundImage: `url(${course.thumbnail})` }}
              />
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-sm font-medium text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                  <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-green-600"/> ₹{course.price}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-600"/> {course._count.enrollments}</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-purple-600"/> {course._count.contents}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-auto">
                  <Link href={`/admin/courses/${course.slug}/content`} className="text-center py-2 bg-blue-50 text-blue-700 font-semibold rounded hover:bg-blue-100 transition text-sm flex items-center justify-center">
                    Manage Modules & Content
                  </Link>
                  <CourseActions courseId={course.id} courseSlug={course.slug} />
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
