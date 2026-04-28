import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const firstOfMonth = new Date();
    firstOfMonth.setUTCDate(1);
    firstOfMonth.setUTCHours(0, 0, 0, 0);

    const mentors = await prisma.user.findMany({
      where: { role: "MENTOR" },
      select: {
        id: true,
        name: true,
        email: true,
        coinAwardLimit: true,
        awardedCoins: {
          where: { awardedAt: { gte: firstOfMonth } },
          select: { amount: true }
        },
        assignedCourses: {
          include: { course: { select: { title: true, slug: true } } }
        }
      }
    });

    const totalCoinsSystem = await prisma.user.aggregate({
      _sum: { coinBalance: true }
    });

    const totalCoinsTransactions = await prisma.coinTransaction.aggregate({
      _sum: { amount: true }
    });

    const mentorData = mentors.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      limit: m.coinAwardLimit,
      awardedThisMonth: m.awardedCoins.reduce((sum, tx) => sum + tx.amount, 0),
      assignedCourses: m.assignedCourses.map(c => ({ id: c.courseId, title: c.course.title, slug: c.course.slug }))
    }));

    return NextResponse.json({ 
      success: true, 
      mentors: mentorData, 
      platformTotalBalance: totalCoinsSystem._sum.coinBalance || 0,
      platformTotalAwarded: totalCoinsTransactions._sum.amount || 0
    });
  } catch (error: any) {
    console.error("Fetch mentor limits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { mentorId, newLimit } = await request.json();
    if (!mentorId || typeof newLimit !== 'number') {
      return NextResponse.json({ error: "Missing mentorId or newLimit" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: mentorId },
      data: { coinAwardLimit: newLimit }
    });

    return NextResponse.json({ success: true, mentorId: updated.id, newLimit: updated.coinAwardLimit });
  } catch (error: any) {
    console.error("Update mentor limit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
