/**
 * Course Details Page
 * Show course info, lessons list, and buy button
 */

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutSidebar } from "@/app/components/payment/CheckoutSidebar";

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
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold">Course Content</h2>
              {!isEnrolled && course.hasFreeTrialContent && (
                <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  {course.modules.reduce((acc, m) => acc + m.contents.filter((c: any) => c.isFreeTrial).length, 0) + course.contents.filter((c: any) => c.isFreeTrial).length} Free Lesson(s) Available
                </div>
              )}
            </div>
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
                        module.contents.map((content, index) => {
                          const Wrapper = (isEnrolled || course.hasFreeTrialContent) ? Link : "div";
                          const hrefProps = (isEnrolled || course.hasFreeTrialContent) ? { href: `/courses/${course.slug}/learn?lessonId=${content.id}` } : {};
                          return (
                            <Wrapper key={content.id} {...hrefProps} className="flex items-center justify-between p-4 hover:bg-gray-50 transition border-b last:border-b-0 block w-full">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900">{content.title}</h3>
                                    {!isEnrolled && content.isFreeTrial && (
                                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Free Trial</span>
                                    )}
                                    {!isEnrolled && !content.isFreeTrial && (
                                      <span className="text-gray-400 text-xs">🔒</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">
                                    {content.type === "LESSON" ? "Video Lesson" : "Quiz"}
                                  </p>
                                </div>
                              </div>
                              {content.type === "LESSON" && content.duration && (
                                <div className="text-sm text-gray-500 font-mono shrink-0">
                                  {Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, "0")} MIN
                                </div>
                              )}
                            </Wrapper>
                          );
                        })
                      ) : (
                        <p className="p-4 text-sm text-gray-500 italic">No classes in this module yet.</p>
                      )}
                    </div>
                  </details>
                ))
              ) : course.contents.length > 0 ? (
                // Fallback for flat structure 
                <div className="divide-y border rounded-lg">
                  {course.contents.map((content, index) => {
                    const Wrapper = (isEnrolled || course.hasFreeTrialContent) ? Link : "div";
                    const hrefProps = (isEnrolled || course.hasFreeTrialContent) ? { href: `/courses/${course.slug}/learn?lessonId=${content.id}` } : {};
                    return (
                      <Wrapper key={content.id} {...hrefProps} className="flex items-center justify-between p-4 hover:bg-gray-50 transition block w-full">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{content.title}</h3>
                              {!isEnrolled && content.isFreeTrial && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Free Trial</span>
                              )}
                              {!isEnrolled && !content.isFreeTrial && (
                                <span className="text-gray-400 text-xs">🔒</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">
                              {content.type === "LESSON" ? "Video Lesson" : "Quiz"}
                            </p>
                          </div>
                        </div>
                        {content.type === "LESSON" && content.duration && (
                          <div className="text-sm text-gray-500 font-mono shrink-0">
                            {Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, "0")} MIN
                          </div>
                        )}
                      </Wrapper>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">No content available for this course yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {isEnrolled ? (
            <div className="bg-white p-6 rounded-lg border shadow-sm sticky top-8">
              <Link 
                href={`/courses/${course.slug}/learn`}
                className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Start Learning
              </Link>
            </div>
          ) : (
            <CheckoutSidebar course={course} />
          )}
        </div>
      </div>
    </div>
  );
}
