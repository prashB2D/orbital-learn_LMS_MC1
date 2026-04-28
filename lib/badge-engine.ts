import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notification";

export async function processAutoBadges(specificUserId?: string) {
  // 1. Fetch all AUTOMATED badges
  const automatedBadges = await prisma.badge.findMany({
    where: { type: "AUTOMATED" }
  });

  if (automatedBadges.length === 0) return { awarded: 0 };

  // Determine users to process
  let usersToProcess;
  if (specificUserId) {
    usersToProcess = await prisma.user.findMany({ 
      where: { id: specificUserId },
      include: {
        quizAttempts: true,
        enrollments: { include: { course: true, progress: true } }
      }
    });
  } else {
    // In a real big app, we'd batch this or only check active users
    usersToProcess = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        quizAttempts: true,
        enrollments: { include: { course: true, progress: true } }
      }
    });
  }

  let awardedCount = 0;

  for (const user of usersToProcess) {
    for (const badge of automatedBadges) {
      if (!badge.triggerLogic) continue;

      // Check if user already has it
      const hasBadge = await prisma.studentBadge.findUnique({
        where: { userId_badgeId: { userId: user.id, badgeId: badge.id } }
      });

      if (hasBadge) continue;

      let meetsCriteria = false;

      switch (badge.triggerLogic) {
        case "first_100_score":
          meetsCriteria = user.quizAttempts.some(q => q.score === 100);
          break;
        case "quiz_master":
          const highScores = user.quizAttempts.filter(q => q.score >= 80);
          meetsCriteria = highScores.length >= 10;
          break;
        case "30_day_streak":
          meetsCriteria = user.currentStreak >= 30;
          break;
        case "100_day_streak":
          meetsCriteria = user.currentStreak >= 100;
          break;
        case "course_completionist_5":
          // Count fully completed courses
          let completedCoursesCount = 0;
          for (const enroll of user.enrollments) {
            // Very simplified check: assume if they have a certificate, it's completed
            const cert = await prisma.certificate.findUnique({ where: { enrollmentId: enroll.id } });
            if (cert) completedCoursesCount++;
          }
          meetsCriteria = completedCoursesCount >= 5;
          break;
        // Other triggers can be implemented as more data becomes available
        default:
          break;
      }

      if (meetsCriteria) {
        await prisma.studentBadge.create({
          data: {
            userId: user.id,
            badgeId: badge.id,
            comment: "Auto-awarded by system"
          }
        });
        await sendNotification({
          userId: user.id,
          title: "Badge Earned!",
          message: `You earned the ${badge.name} badge!`,
          type: "BADGE"
        });
        awardedCount++;
      }
    }
  }

  return { awarded: awardedCount };
}
