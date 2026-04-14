import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId, title } = await req.json();

    if (!courseId || !title) {
      return new NextResponse("Missing fields", { status: 400 });
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
