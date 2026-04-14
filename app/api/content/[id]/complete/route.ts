/**
 * POST /api/content/[contentId]/complete
 * Purpose: Mark lesson as complete (triggered at 90% video watched or quiz submitted)
 * Input: {enrollmentId, contentId}
 * Output: {success, progressPercentage}
 * Auth Required: Yes
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth check
    const session = await requireAuth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    // 2. Parse payload
    const { contentId, enrollmentId } = await request.json();

    if (!contentId || !enrollmentId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (params.id !== contentId) {
      return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
    }

    // 3. Upsert Progress
    await prisma.progress.upsert({
      where: {
        enrollmentId_contentId: {
          enrollmentId,
          contentId,
        },
      },
      create: {
        enrollmentId,
        contentId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Mark complete error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
