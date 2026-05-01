import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const period = request.nextUrl.searchParams.get("period") || "week";

    // Get the last 30 periods of data
    const allTx = await prisma.coinTransaction.findMany({
      where: { amount: { gt: 0 }, isWithdrawal: false },
      select: { amount: true, awardedAt: true },
      orderBy: { awardedAt: "asc" }
    });

    const buckets: Record<string, number> = {};

    allTx.forEach(tx => {
      const d = new Date(tx.awardedAt);
      let key: string;
      if (period === "day") {
        key = d.toISOString().slice(0, 10);
      } else if (period === "month") {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      } else {
        // week — ISO week
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil(
          ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
        );
        key = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
      }
      buckets[key] = (buckets[key] || 0) + tx.amount;
    });

    const graph = Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, totalCoinsAwarded]) => ({ date, totalCoinsAwarded }));

    return NextResponse.json({ success: true, graph });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
