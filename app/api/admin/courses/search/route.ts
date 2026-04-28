import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || "";

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { courseCode: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        courseCode: true
      },
      take: 20
    });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to search courses" }, { status: 500 });
  }
}
