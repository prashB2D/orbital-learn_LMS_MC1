import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addXP } from "@/lib/skills-engine";
import { logDailyActivity } from "@/lib/streak-engine";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { skillName, xpGained, reason, actionType, amount } = body;

    // Handle streak activity logging
    if (actionType) {
      const activity = await logDailyActivity(user.id, actionType, amount || 1);
      return NextResponse.json({ success: true, activity });
    }

    // Handle XP logging
    if (!skillName || !xpGained || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await addXP(user.id, skillName, Number(xpGained), "AUTO", reason);

    if (!result) {
      return NextResponse.json({ error: "Invalid skill name" }, { status: 400 });
    }

    return NextResponse.json({ success: true, skill: result.skill, leveledUp: result.leveledUp });
  } catch (error: any) {
    console.error("Log activity error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
