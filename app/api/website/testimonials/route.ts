import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required
// Returns all active testimonials for the public landing page
export async function GET() {
  try {
    const testimonials = await prisma.websiteTestimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        studentName: true,
        role: true,
        text: true,
        rating: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, testimonials });
  } catch (error) {
    console.error("Public testimonials fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
