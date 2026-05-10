import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/**
 * PUBLIC — GET /api/public/courses
 * Returns courses where show_on_website = true.
 * Includes modules, lesson count, and unique skills (tech stack).
 */
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { showOnWebsite: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        aboutCourse: true,
        thumbnail: true,
        courseCode: true,
        basePrice: true,
        offerPercent: true,
        finalPrice: true,
        hasFreeTrialContent: true,
        createdAt: true,
        // Modules with lesson count
        modules: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            contents: {
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                order: true,
                skill: true,
                isFreeTrial: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
        // For enrollment count
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Build enriched response — extract unique tech stack tags per course
    const enriched = courses.map((course) => {
      const allContents = course.modules.flatMap((m) => m.contents);
      const techStack = [
        ...new Set(
          allContents
            .map((c) => c.skill)
            .filter((s): s is string => !!s && s.trim() !== "")
        ),
      ];
      const lessonCount = allContents.filter((c) => c.type === "LESSON").length;
      const quizCount   = allContents.filter((c) => c.type === "QUIZ").length;

      return {
        id:                 course.id,
        title:              course.title,
        slug:               course.slug,
        description:        course.description,
        aboutCourse:        course.aboutCourse,
        thumbnail:          course.thumbnail,
        courseCode:         course.courseCode,
        basePrice:          course.basePrice,
        offerPercent:       course.offerPercent,
        finalPrice:         course.finalPrice,
        hasFreeTrialContent: course.hasFreeTrialContent,
        techStack,                        // ["React", "Node.js", "Design"]
        lessonCount,
        quizCount,
        moduleCount:        course.modules.length,
        enrollmentCount:    course._count.enrollments,
        modules:            course.modules,
        createdAt:          course.createdAt,
      };
    });

    return NextResponse.json(
      { success: true, count: enriched.length, courses: enriched },
      { headers: { ...CORS, "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Public courses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500, headers: CORS }
    );
  }
}
