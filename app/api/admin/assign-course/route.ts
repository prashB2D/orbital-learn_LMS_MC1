import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

    const assignments = await prisma.courseAssignment.findMany({
      where: { courseId },
      include: { mentor: { select: { id: true, name: true, email: true } } }
    });

    return NextResponse.json({ success: true, assignments }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const { courseId, mentorId } = body;

    if (!courseId || !mentorId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const assignment = await prisma.courseAssignment.create({
      data: {
        courseId,
        mentorId,
        assignedBy: session.user.id
      }
    });

    return NextResponse.json({ success: true, assignment }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Mentor already assigned to this course" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to assign mentor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { courseId, mentorId } = body;

    if (!courseId || !mentorId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await prisma.courseAssignment.deleteMany({
      where: {
        courseId,
        mentorId
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove assignment" }, { status: 500 });
  }
}
