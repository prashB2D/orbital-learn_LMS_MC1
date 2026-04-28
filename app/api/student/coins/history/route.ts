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
    const requestedUserId = searchParams.get("userId");

    let targetUserId = user.id;
    if (requestedUserId && requestedUserId !== user.id) {
      if (user.role !== "ADMIN" && user.role !== "MENTOR") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      targetUserId = requestedUserId;
    }

    // Only Admin can see platform-wide transactions if no specific user is passed (and maybe targetUserId is empty? 
    // actually, if it's admin asking for all, we need a different approach. Let's handle admin all via a separate param
    const all = searchParams.get("all") === "true";
    if (all && user.role === "ADMIN") {
      const transactions = await prisma.coinTransaction.findMany({
        include: {
          user: { select: { name: true } },
          quiz: { select: { title: true } },
          awardedBy: { select: { name: true } }
        },
        orderBy: { awardedAt: "desc" }
      });
      return NextResponse.json({ success: true, transactions });
    }

    const transactions = await prisma.coinTransaction.findMany({
      where: { userId: targetUserId },
      include: {
        quiz: { select: { title: true } },
        course: { select: { title: true } },
        awardedBy: { select: { name: true } }
      },
      orderBy: { awardedAt: "desc" }
    });

    const formattedHistory = transactions.map(tx => ({
      id: tx.id,
      date: tx.awardedAt,
      source: `${tx.course?.title || 'Unknown Course'} - ${tx.quiz?.title || 'Unknown Quiz'}`,
      amount: tx.amount,
      rank: tx.rank,
      awardedBy: tx.awardedBy?.name || 'System',
      type: 'EARNED',
      reason: tx.reason
    }));

    return NextResponse.json({ success: true, transactions: formattedHistory });
  } catch (error: any) {
    console.error("Fetch coin history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
