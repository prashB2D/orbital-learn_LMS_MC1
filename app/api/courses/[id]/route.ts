/**
 * GET /api/courses/[courseId]
 * Purpose: Get single course details
 * Input: URL param: courseId
 * Output: {id, title, description, price, thumbnail, slug, isEnrolled}
 * Auth Required: No (isEnrolled requires session check)
 *
 * PUT /api/courses/[courseId]
 * Purpose: Update course details (admin only)
 * Input: Course fields to update
 * Output: {success, courseId}
 * Auth Required: Yes (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const course = await prisma.course.findFirst({ 
      where: { 
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      } 
    });
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, course }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await request.json();
    
    const courseToUpdate = await prisma.course.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] }
    });

    if (!courseToUpdate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Partial update
    const course = await prisma.course.update({
      where: { id: courseToUpdate.id },
      data: {
        title: body.title,
        description: body.description,
        aboutCourse: body.aboutCourse,
        price: body.price ? Number(body.price) : undefined,
        thumbnail: body.thumbnail,
      },
    });

    return NextResponse.json({ success: true, course }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const courseToDelete = await prisma.course.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] }
    });
    
    if (!courseToDelete) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.course.delete({ where: { id: courseToDelete.id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
