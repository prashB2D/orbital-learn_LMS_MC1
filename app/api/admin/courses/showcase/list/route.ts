import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        courseCode: true,
        description: true,
        thumbnail: true,
        showOnWebsite: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Fetch showcase courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
