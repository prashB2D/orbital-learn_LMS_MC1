import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, showOnWebsite } = body;

    if (!courseId || typeof showOnWebsite !== "boolean") {
      return NextResponse.json({ error: "courseId and showOnWebsite (boolean) are required" }, { status: 400 });
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { showOnWebsite },
      select: { id: true, title: true, showOnWebsite: true },
    });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error("Toggle showcase error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
