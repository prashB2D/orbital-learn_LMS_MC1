import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const mentors = await prisma.user.findMany({
      where: { role: "MENTOR" },
      select: {
        id: true,
        name: true,
        email: true,
        coinAwardLimit: true,
        awardedCoins: {
          select: { amount: true, awardedAt: true },
          where: { isWithdrawal: false, amount: { gt: 0 } }
        }
      }
    });

    const formatted = mentors.map(m => {
      const allTime = m.awardedCoins.reduce((s, tx) => s + tx.amount, 0);
      const thisMonth = m.awardedCoins
        .filter(tx => new Date(tx.awardedAt) >= startOfMonth)
        .reduce((s, tx) => s + tx.amount, 0);
      const sorted = [...m.awardedCoins].sort(
        (a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime()
      );
      const lastAward = sorted.length > 0 ? sorted[0].awardedAt : null;
      const inactive = lastAward
        ? new Date(lastAward) < thirtyDaysAgo
        : m.awardedCoins.length === 0;

      return {
        id: m.id,
        name: m.name,
        email: m.email,
        coinAwardLimit: m.coinAwardLimit,
        coinsThisMonth: thisMonth,
        coinsAllTime: allTime,
        lastAward,
        inactive
      };
    });

    return NextResponse.json({ success: true, mentors: formatted });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
