import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { courseCode } = body;

    if (!courseCode) {
      return NextResponse.json({ error: "courseCode required" }, { status: 400 });
    }

    const courseToUpdate = await prisma.course.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] }
    });

    if (!courseToUpdate) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = await prisma.course.update({
      where: { id: courseToUpdate.id },
      data: { courseCode }
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Course code must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update course code" }, { status: 500 });
  }
}
