/**
 * Courses Page
 * Browse all available courses (student view)
 */

import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/app/components/CourseCard";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      thumbnail: true,
      slug: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold">All Courses</h1>
        <p className="text-gray-600 mt-2">Find and purchase the best courses.</p>
      </div>

      {courses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available</h3>
          <p className="text-gray-600">Check back soon for exciting new content!</p>
        </div>
      )}
    </div>
  );
}
