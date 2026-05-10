import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addXP, SKILL_NAMES, getNextLevelThreshold } from "@/lib/skills-engine";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notification";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MENTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, skillName, xpAmount, reason } = body;

    if (!studentId || !skillName || !xpAmount || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!SKILL_NAMES.includes(skillName)) {
      return NextResponse.json({ error: `Invalid skill name. Allowed: ${SKILL_NAMES.join(', ')}` }, { status: 400 });
    }

    // A mentor might only be able to update their own students, but for simplicity we allow if they are mentor
    const result = await addXP(studentId, skillName, Number(xpAmount), "MANUAL", reason, user.id);

    if (!result) {
      return NextResponse.json({ error: `Failed to update skill ${skillName}` }, { status: 400 });
    }

    // Fetch all skills to return the full array
    const allSkills = await prisma.studentSkill.findMany({ where: { userId: studentId } });
    const formattedSkills: Record<string, number> = {};
    allSkills.forEach(s => {
      formattedSkills[s.skillName] = s.currentLevel * 10;
    });
    
    // Add missing skills as 0
    SKILL_NAMES.forEach(name => {
      if (!(name in formattedSkills)) formattedSkills[name] = 0;
    });

    const nextLevelAt = getNextLevelThreshold(result.skill.totalXP);

    await sendNotification({
      userId: studentId,
      title: "XP Awarded!",
      message: `You earned ${xpAmount} XP in ${skillName}!`,
      type: "XP",
      payload: {
        amount: Number(xpAmount),
        skillName,
        reason,
        mentorName: user.name,
        leveledUp: result.leveledUp,
        newLevel: result.skill.currentLevel
      }
    });

    return NextResponse.json({ 
      success: true, 
      skillName,
      previousXP: result.previousXP,
      newXP: result.skill.totalXP,
      previousLevel: result.previousLevel,
      newLevel: result.skill.currentLevel,
      hexagonPoints: Math.min(100, Math.max(0, Math.round((result.skill.totalXP / 5500) * 100))),
      nextLevelAt,
      leveledUp: result.leveledUp,
      fullSkills: formattedSkills
    });
  } catch (error: any) {
    console.error("Mentor update skill error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
