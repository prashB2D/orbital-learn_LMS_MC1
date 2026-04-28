/**
 * POST /api/content/quiz
 * Purpose: Create quiz (with questions)
 * Input: {courseId, title, order, questions: [{questionText, options[], correctAnswer}]}
 * Output: {success, quizId}
 * Auth Required: Yes (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCourseAccess } from "@/lib/auth";
import { addQuizSchema } from "@/lib/validations/content";

export async function POST(request: NextRequest) {
  try {

    // 2. Parse request body
    const body = await request.json();

    // 3. Validate input with Zod
    const validatedData = addQuizSchema.parse(body);
    const { courseId, moduleId, title, order, questions } = validatedData;

    // 1. Check session (course access)
    await requireCourseAccess(courseId);

    // Verify course exists
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

    // 4. Create content with type: 'QUIZ' & Create questions (nested create in Prisma)
    const quiz = await prisma.content.create({
      data: {
        courseId: course.id,
        moduleId: moduleId || null,
        type: "QUIZ",
        title,
        order,
        questions: {
          create: questions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            optionType: q.optionType,
            correctAnswer: q.correctAnswer,
            order: q.order,
          })),
        },
      },
    });

    // 5. Return success + quizId
    return NextResponse.json(
      {
        success: true,
        quizId: quiz.id,
        message: "Quiz created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add quiz error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid input. Please check your data." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add quiz. Please try again." },
      { status: 500 }
    );
  }
}
