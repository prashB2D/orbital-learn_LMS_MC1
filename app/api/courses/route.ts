/**
 * GET /api/courses - List all courses or featured courses
 * POST /api/courses - Create new course (admin only)
 *
 * GET Query Params:
 * - featured=true: Get only featured courses (default: all courses)
 *
 * POST Input: {title, description, price, thumbnail}
 * Response: {success, courses} or {success, courseId, slug}
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createCourseSchema } from "@/lib/validations/course";

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featured = searchParams.get("featured") === "true";

    // Fetch courses from database
    let courses;

    if (featured) {
      // For now, just return first 6 courses as "featured"
      // In future, can add a "featured" boolean field to Course model
      courses = await prisma.course.findMany({
        take: 6,
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
    } else {
      // Get all courses
      courses = await prisma.course.findMany({
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
    }

    return NextResponse.json(
      {
        success: true,
        courses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch courses error:", error);

    return NextResponse.json(
      { error: "Failed to fetch courses. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    await requireAdmin();

    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const validatedData = createCourseSchema.parse(body);
    const { title, description, price, thumbnail, aboutCourse } = validatedData;
    
    // Generate slug from title
    let slug = generateSlug(title);

    // Check if slug already exists and ensure uniqueness
    let existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      // If slug exists, append random number to make it unique
      const randomNum = Math.floor(Math.random() * 10000);
      slug = `${slug}-${randomNum}`;
    }

    // Create course in database
    const course = await prisma.course.create({
      data: {
        title,
        description,
        price,
        thumbnail,
        slug,
        aboutCourse,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        courseId: course.id,
        slug: course.slug,
        message: "Course created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create course error:", error);

    // Handle authorization errors
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Handle validation errors from Zod
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input: Please make sure all fields, including the thumbnail image, are provided." },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "Failed to create course. Please try again." },
      { status: 500 }
    );
  }
}
