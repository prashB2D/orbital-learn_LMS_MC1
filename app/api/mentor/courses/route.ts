import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user || session.user.role !== "MENTOR") {
      return NextResponse.json({ error: "Unauthorized - mentor access required" }, { status: 403 });
    }

    const assignedCourses = await prisma.courseAssignment.findMany({
      where: { mentorId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            _count: {
              select: { enrollments: true }
            }
          }
        }
      },
      orderBy: { assignedAt: "desc" }
    });

    const courses = assignedCourses.map(a => ({
      ...a.course,
      assignedAt: a.assignedAt
    }));

    return NextResponse.json({ success: true, courses });
  } catch (error: any) {
    console.error("Fetch mentor courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
