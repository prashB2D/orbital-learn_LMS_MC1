import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const skillName = searchParams.get("skillName");
    const requestedUserId = searchParams.get("userId");

    // Only allow querying another user's logs if the requester is an admin/mentor
    let targetUserId = user.id;
    if (requestedUserId && requestedUserId !== user.id) {
      if (user.role !== "ADMIN" && user.role !== "MENTOR") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      targetUserId = requestedUserId;
    }

    if (!skillName) {
      return NextResponse.json({ error: "skillName is required" }, { status: 400 });
    }

    const logs = await prisma.skillXPLog.findMany({
      where: { userId: targetUserId, skillName },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("Fetch skill logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
