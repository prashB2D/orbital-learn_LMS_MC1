import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const program = await prisma.websiteProgram.update({
      where: { id: params.id },
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

    return NextResponse.json({ success: true, program });
  } catch (error) {
    console.error("Update program error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.websiteProgram.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete program error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
