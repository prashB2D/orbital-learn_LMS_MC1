import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required
// Returns all active programs for the public landing page
export async function GET() {
  try {
    const programs = await prisma.websiteProgram.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        type: true,
        title: true,
        duration: true,
        description: true,
        startDate: true,
        endDate: true,
        isLocked: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, programs });
  } catch (error) {
    console.error("Public programs fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
