import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { enrollmentId, lastWatchedTime } = await request.json();

    if (!enrollmentId || lastWatchedTime === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const normalizedTime = Math.floor(lastWatchedTime);
    const existingProgress = await prisma.progress.findUnique({
      where: {
        enrollmentId_contentId: {
          enrollmentId,
          contentId: params.id,
        },
      },
    });

    // Avoid redundant writes if progress did not increase
    if (existingProgress && existingProgress.lastWatchedTime >= normalizedTime) {
      return NextResponse.json({ success: true });
    }

    await prisma.progress.upsert({
      where: {
        enrollmentId_contentId: {
          enrollmentId,
          contentId: params.id,
        },
      },
      create: {
        enrollmentId,
        contentId: params.id,
        lastWatchedTime: normalizedTime,
      },
      update: {
        lastWatchedTime: normalizedTime,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
