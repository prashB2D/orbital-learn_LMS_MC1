import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "MENTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = user.coinAwardLimit;
    
    // Get start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // coinAwardLimit of 0 means "no limit set by admin"
    const limitIsSet = limit !== null && limit > 0;

    // Sum positive (non-withdrawal) transactions this month awarded by this mentor
    const result = await prisma.coinTransaction.aggregate({
      where: {
        awardedById: user.id,
        isWithdrawal: false,
        amount: { gt: 0 },
        awardedAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });

    const usedThisPeriod = result._sum.amount || 0;

    return NextResponse.json({
      success: true,
      limit: limitIsSet ? limit : null,
      usedThisPeriod: usedThisPeriod,
      remaining: limitIsSet ? Math.max(0, limit - usedThisPeriod) : null
    }, { status: 200 });

  } catch (error) {
    console.error("Coin budget error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
