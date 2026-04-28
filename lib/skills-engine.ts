import { prisma } from "@/lib/prisma";
import { processAutoBadges } from "@/lib/badge-engine";

import { VALID_SKILLS } from "@/lib/constants";

export const SKILL_NAMES = VALID_SKILLS;

export const MAX_LEVEL = 10;

// Calculate Level from XP
// Level 0: 0 XP
// Level 1: 100 XP
// Level 2: 300 XP
// Level 3: 600 XP
// Level 4: 1000 XP
// Level 5: 1500 XP
// Level 6: 2100 XP
// Level 7: 2800 XP
// Level 8: 3600 XP
// Level 9: 4500 XP
// Level 10: 5500+ XP
export function calculateLevelFromXP(xp: number): number {
  if (xp >= 5500) return 10;
  if (xp >= 4500) return 9;
  if (xp >= 3600) return 8;
  if (xp >= 2800) return 7;
  if (xp >= 2100) return 6;
  if (xp >= 1500) return 5;
  if (xp >= 1000) return 4;
  if (xp >= 600) return 3;
  if (xp >= 300) return 2;
  if (xp >= 100) return 1;
  return 0;
}

export function calculateHexagonPoints(xp: number): number {
  // Maps 0-5500 to 0-100 for graph display
  return Math.min(100, Math.max(0, Math.round((xp / 5500) * 100)));
}

export async function addXP(userId: string, skillName: string, xpGained: number, source: "AUTO" | "MANUAL", reason: string, grantedById?: string) {
  if (!SKILL_NAMES.includes(skillName) || xpGained === 0) return null;

  // Find or create skill
  let skill = await prisma.studentSkill.findUnique({
    where: { userId_skillName: { userId, skillName } }
  });

  if (!skill) {
    skill = await prisma.studentSkill.create({
      data: {
        userId,
        skillName,
        isUnlocked: true,
        unlockedAt: new Date(),
        totalXP: 0,
        currentLevel: 0
      }
    });
  } else if (!skill.isUnlocked) {
    skill = await prisma.studentSkill.update({
      where: { id: skill.id },
      data: { isUnlocked: true, unlockedAt: new Date() }
    });
  }

  const previousXP = skill.totalXP;
  const previousLevel = skill.currentLevel;

  const newXP = skill.totalXP + xpGained;
  const newLevel = calculateLevelFromXP(newXP);

  // Update skill
  const updatedSkill = await prisma.studentSkill.update({
    where: { id: skill.id },
    data: {
      totalXP: newXP,
      currentLevel: newLevel
    }
  });

  // Log XP
  await prisma.skillXPLog.create({
    data: {
      userId,
      skillName,
      xpGained,
      source,
      reason,
      grantedById
    }
  });

  const leveledUp = newLevel > skill.currentLevel;

  if (leveledUp) {
    // Trigger auto badge evaluation for this user
    await processAutoBadges(userId);
  }

  return { skill: updatedSkill, leveledUp, previousXP, previousLevel };
}
