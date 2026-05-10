import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/**
 * PUBLIC — GET /api/public/testimonials
 * Returns active testimonials with rating >= 4 from website_testimonials table.
 */
export async function GET() {
  try {
    const testimonials = await prisma.websiteTestimonial.findMany({
      where: {
        isActive: true,
        rating: { gte: 4 },
      },
      select: {
        id: true,
        studentName: true,
        role: true,
        text: true,
        rating: true,
        createdAt: true,
      },
      orderBy: [
        { rating: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(
      { success: true, count: testimonials.length, testimonials },
      { headers: { ...CORS, "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Public testimonials error:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500, headers: CORS }
    );
  }
}
