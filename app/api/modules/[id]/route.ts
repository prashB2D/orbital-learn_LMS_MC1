import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

    const moduleToDelete = await prisma.module.findUnique({ where: { id } });
    if (!moduleToDelete) return new NextResponse("Not found", { status: 404 });

    if (session.user.role === "MENTOR") {
      const assignment = await prisma.courseAssignment.findUnique({
        where: { courseId_mentorId: { courseId: moduleToDelete.courseId, mentorId: session.user.id } }
      });
      if (!assignment) return new NextResponse("Forbidden", { status: 403 });
    }

    const module = await prisma.module.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("[MODULE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const values = await req.json();

    const moduleToUpdate = await prisma.module.findUnique({ where: { id } });
    if (!moduleToUpdate) return new NextResponse("Not found", { status: 404 });

    if (session.user.role === "MENTOR") {
      const assignment = await prisma.courseAssignment.findUnique({
        where: { courseId_mentorId: { courseId: moduleToUpdate.courseId, mentorId: session.user.id } }
      });
      if (!assignment) return new NextResponse("Forbidden", { status: 403 });
    }

    const module = await prisma.module.update({
      where: { id },
      data: {
        ...values,
      },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("[MODULE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
