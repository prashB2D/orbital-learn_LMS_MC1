import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required
// Returns all courses flagged showOnWebsite=true for the public landing page
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { showOnWebsite: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        courseCode: true,
        description: true,
        thumbnail: true,
        basePrice: true,
        offerPercent: true,
        finalPrice: true,
        aboutCourse: true,
        hasFreeTrialContent: true,
        _count: {
          select: { enrollments: true },
        },
      },
    });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Public showcase courses fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
