import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SKILL_NAMES, calculateHexagonPoints } from "@/lib/skills-engine";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MENTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    const skills = await prisma.studentSkill.findMany({
      where: { userId: userId }
    });

    // Format for hexagon graph
    const hexagonData: Record<string, number> = {};
    const skillList = [];

    for (const name of SKILL_NAMES) {
      const skill = skills.find(s => s.skillName === name);
      if (skill && skill.isUnlocked) {
        hexagonData[name] = calculateHexagonPoints(skill.totalXP);
        skillList.push(skill);
      } else {
        hexagonData[name] = 0;
        skillList.push({
          skillName: name,
          totalXP: 0,
          currentLevel: 0,
          isUnlocked: false
        });
      }
    }

    return NextResponse.json({ success: true, hexagonData, skills: skillList });
  } catch (error: any) {
    console.error("Fetch admin student skills error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
