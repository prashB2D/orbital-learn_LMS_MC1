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

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        coinBalance: true,
        coinTransactions: {
          select: { amount: true, awardedAt: true },
          orderBy: { awardedAt: "desc" }
        },
        redemptions: {
          where: { status: { in: ["VERIFIED", "DELIVERED", "COMPLETED"] } },
          select: { coinsRedeemed: true }
        }
      },
      orderBy: { coinBalance: "desc" }
    });

    const formatted = students.map(s => {
      const totalEarned = s.coinTransactions
        .filter(tx => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const totalRedeemed = s.redemptions.reduce((sum, r) => sum + r.coinsRedeemed, 0);
      const lastReceived = s.coinTransactions.length > 0 ? s.coinTransactions[0].awardedAt : null;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        coinBalance: s.coinBalance,
        totalEarned,
        totalRedeemed,
        lastReceived
      };
    });

    return NextResponse.json({ success: true, students: formatted });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
