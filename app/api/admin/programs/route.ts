import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const programs = await prisma.websiteProgram.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, programs });
  } catch (error) {
    console.error("Fetch programs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { type, title, duration, description, imageUrl, isActive, startDate, endDate, isLocked, unlockDate, isTimerOnly, highlights, features, nextBatchDate } = body;

    if (!type || !title || !duration || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const program = await prisma.websiteProgram.create({
      data: {
        type,
        title,
        duration,
        description,
        imageUrl: imageUrl || null,
        isActive: isActive ?? true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isLocked: isLocked ?? false,
        unlockDate: unlockDate ? new Date(unlockDate) : null,
        isTimerOnly: isTimerOnly ?? false,
        highlights: highlights ? JSON.stringify(highlights) : null,
        features: features ? JSON.stringify(features) : null,
        nextBatchDate: nextBatchDate || null,
      },
    });

    return NextResponse.json({ success: true, program }, { status: 201 });
  } catch (error) {
    console.error("Create program error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
