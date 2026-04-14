/**
 * Course Details Page
 * Show course info, lessons list, and buy button
 */

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { RazorpayButton } from "@/app/components/payment/razorpay-button";
import { FreeButton } from "@/app/components/payment/free-button";

export const dynamic = "force-dynamic";

export default async function CourseDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  // 1. Fetch course details
  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          contents: {
            orderBy: { order: "asc" },
          },
        },
      },
      contents: { // Fallback for legacy items without modules
        where: { moduleId: null },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // 2. Check enrollment
  const user = await getCurrentUser();
  let isEnrolled = false;

  if (user) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
      },
    });
    isEnrolled = !!enrollment;
  }

  // 3. Render
  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-4">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Course Details Header */}
          <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
            {/* Thumbnail */}
            <div className="relative w-full h-64 sm:h-80 bg-gray-100">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
            </div>
            {/* Title & Description */}
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4 text-gray-900">{course.title}</h1>
              <div className="prose max-w-none text-gray-600">
                <p>{course.description}</p>
              </div>
            </div>
          </div>

          {/* About Course */}
          {course.aboutCourse && (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div 
                className="prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: course.aboutCourse }} 
              />
            </div>
          )}

          {/* Module-based Contents List */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            <div className="space-y-6">
              {course.modules.length > 0 ? (
                course.modules.map((module) => (
                  <details key={module.id} className="border rounded-lg overflow-hidden group">
                    <summary className="bg-gray-50 px-4 py-3 font-bold text-gray-900 cursor-pointer list-none flex justify-between items-center hover:bg-gray-100 transition [&::-webkit-details-marker]:hidden">
                      {module.title}
                      <span className="transition duration-200 group-open:-rotate-180 text-gray-500">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </span>
                    </summary>
                    <div className="divide-y border-t bg-white">
                      {module.contents.length > 0 ? (
                        module.contents.map((content, index) => (
                          <div key={content.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{content.title}</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">
                                  {content.type === "LESSON" ? "Video Lesson" : "Quiz"}
                                </p>
                              </div>
                            </div>
                            {content.type === "LESSON" && content.duration && (
                              <div className="text-sm text-gray-500 font-mono">
                                {Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, "0")} MIN
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-sm text-gray-500 italic">No classes in this module yet.</p>
                      )}
                    </div>
                  </details>
                ))
              ) : course.contents.length > 0 ? (
                // Fallback for flat structure 
                <div className="divide-y border rounded-lg">
                  {course.contents.map((content, index) => (
                    <div key={content.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{content.title}</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">
                            {content.type === "LESSON" ? "Video Lesson" : "Quiz"}
                          </p>
                        </div>
                      </div>
                      {content.type === "LESSON" && content.duration && (
                        <div className="text-sm text-gray-500 font-mono">
                          {Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, "0")} MIN
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No content available for this course yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white p-6 rounded-lg border shadow-sm sticky top-8">
            <p className="text-4xl font-bold text-gray-900 mb-6">
              ₹{course.price.toLocaleString("en-IN")}
            </p>
            
            {isEnrolled ? (
              <Link 
                href={`/courses/${course.slug}/learn`}
                className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Start Learning
              </Link>
            ) : (
              <div className="space-y-4">
                {course.price === 0 ? (
                    <FreeButton courseId={course.id} />
                ) : (
                    <RazorpayButton courseId={course.id} amount={course.price} />
                )}
                <p className="text-xs text-center text-gray-400">
                  Full lifetime access • Certificate of completion
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
