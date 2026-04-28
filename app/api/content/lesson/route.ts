/**
 * POST /api/content/lesson
 * Add video lesson to a course
 *
 * Input: {courseId, title, videoId, duration, attachments, order}
 * Output: {success: true, contentId}
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCourseAccess } from "@/lib/auth";
import { addLessonSchema } from "@/lib/validations/content";

export async function POST(request: NextRequest) {
  try {

    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const validatedData = addLessonSchema.parse(body);
    const { courseId, moduleId, title, videoId, duration, attachments = [], order, skill, xpReward } = validatedData;

    // Check course access (admin or assigned mentor)
    await requireCourseAccess(courseId);

    // Verify course exists by ID or Slug resiliently natively
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: courseId },
          { slug: courseId }
        ]
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Create lesson content
    const lesson = await prisma.content.create({
      data: {
        courseId: course.id,
        moduleId: moduleId || null,
        type: "LESSON",
        title,
        videoId,
        duration,
        attachments,
        order,
        skill,
        xpReward,
      },
    });

    return NextResponse.json(
      {
        success: true,
        contentId: lesson.id,
        message: "Lesson added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add lesson error:", error);

    // Handle authorization errors
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Handle validation errors from Zod
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid input. Please check your data." },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "Failed to add lesson. Please try again." },
      { status: 500 }
    );
  }
}
