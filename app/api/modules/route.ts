import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId, title } = await req.json();

    if (!courseId || !title) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    if (session.user.role === "MENTOR") {
      const course = await prisma.course.findFirst({
        where: { OR: [{ id: courseId }, { slug: courseId }] }
      });
      if (!course) return new NextResponse("Course not found", { status: 404 });
      const assignment = await prisma.courseAssignment.findUnique({
        where: { courseId_mentorId: { courseId: course.id, mentorId: session.user.id } }
      });
      if (!assignment) return new NextResponse("Forbidden", { status: 403 });
    }

    // Find the max order to append the new module at the end
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastModule ? lastModule.order + 1 : 1;

    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        order: newOrder,
      },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("[MODULES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
