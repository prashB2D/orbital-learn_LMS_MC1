import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        seen: false,
        type: { in: ["XP", "BADGE", "COIN"] }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error("Get unseen notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
