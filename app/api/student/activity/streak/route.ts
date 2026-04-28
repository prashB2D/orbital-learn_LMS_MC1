import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { currentStreak: true, longestStreak: true }
    });

    const daysAgo = new Date();
    daysAgo.setUTCDate(daysAgo.getUTCDate() - 365);
    daysAgo.setUTCHours(0, 0, 0, 0);

    const activities = await prisma.dailyActivity.findMany({
      where: {
        userId: user.id,
        date: { gte: daysAgo }
      },
      orderBy: { date: "asc" }
    });

    // Create a continuous array of the last 365 days
    const heatmap = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      d.setUTCHours(0, 0, 0, 0);
      
      const activity = activities.find(a => new Date(a.date).getTime() === d.getTime());
      
      let intensity = 0; // 0=gray, 1=light green, 2=medium, 3=dark green
      const totalAct = activity?.totalActivities || 0;
      
      if (totalAct >= 6) intensity = 3;
      else if (totalAct >= 3) intensity = 2;
      else if (totalAct >= 1) intensity = 1;

      heatmap.push({
        date: d.toISOString().split("T")[0],
        totalActivities: totalAct,
        videosWatched: activity?.videosWatched || 0,
        quizzesTaken: activity?.quizzesTaken || 0,
        notesDownloaded: activity?.notesDownloaded || 0,
        timeSpentMinutes: activity?.timeSpentMinutes || 0,
        intensity
      });
    }

    return NextResponse.json({ 
      success: true, 
      currentStreak: userData?.currentStreak || 0,
      longestStreak: userData?.longestStreak || 0,
      heatmap 
    });
  } catch (error: any) {
    console.error("Fetch streak error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
