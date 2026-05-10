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
 * PUBLIC — GET /api/public/programs
 * Returns active programs from website_programs table.
 * Optional: ?type=SUMMER_INTERNSHIP | WINTER_INTERNSHIP | WORKSHOP
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const programs = await prisma.websiteProgram.findMany({
      where: {
        isActive: true,
        ...(type ? { type: type as any } : {}),
      },
      select: {
        id: true,
        type: true,
        title: true,
        duration: true,
        description: true,
        isLocked: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json(
      { success: true, count: programs.length, programs },
      { headers: { ...CORS, "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Public programs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500, headers: CORS }
    );
  }
}
