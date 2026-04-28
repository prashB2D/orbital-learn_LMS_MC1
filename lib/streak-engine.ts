import { prisma } from "@/lib/prisma";

export async function logDailyActivity(userId: string, actionType: "video" | "quiz" | "note" | "time", amount: number = 1) {
  // Normalize date to UTC midnight
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Upsert DailyActivity
  const activity = await prisma.dailyActivity.upsert({
    where: {
      userId_date: {
        userId,
        date: today
      }
    },
    update: {
      videosWatched: actionType === "video" ? { increment: amount } : undefined,
      quizzesTaken: actionType === "quiz" ? { increment: amount } : undefined,
      notesDownloaded: actionType === "note" ? { increment: amount } : undefined,
      timeSpentMinutes: actionType === "time" ? { increment: amount } : undefined,
      totalActivities: { increment: 1 }
    },
    create: {
      userId,
      date: today,
      videosWatched: actionType === "video" ? amount : 0,
      quizzesTaken: actionType === "quiz" ? amount : 0,
      notesDownloaded: actionType === "note" ? amount : 0,
      timeSpentMinutes: actionType === "time" ? amount : 0,
      totalActivities: 1
    }
  });

  // Calculate Streak
  // For true streak calculation, we'd look back days. But an easy optimization is:
  // If we just created the activity (meaning first action today), we check yesterday's activity.
  // Wait, upsert doesn't tell us easily if it was created or updated without comparing `totalActivities === 1`.
  if (activity.totalActivities === 1) {
    // This is the first activity for today.
    // Check if there was an activity yesterday.
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const yesterdayActivity = await prisma.dailyActivity.findUnique({
      where: { userId_date: { userId, date: yesterday } }
    });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { currentStreak: true, longestStreak: true } });
    if (!user) return activity;

    let newCurrentStreak = 1;
    if (yesterdayActivity && yesterdayActivity.totalActivities > 0) {
      newCurrentStreak = user.currentStreak + 1;
    }

    let newLongestStreak = Math.max(user.longestStreak, newCurrentStreak);

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak
      }
    });
  }

  return activity;
}
