import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    const [transactions, redemptions] = await Promise.all([
      prisma.coinTransaction.findMany({
        where: { userId },
        include: {
          awardedBy: { select: { id: true, name: true } },
          course: { select: { title: true } },
          quiz: { select: { title: true } }
        },
        orderBy: { awardedAt: "desc" }
      }),
      prisma.coinRedemption.findMany({
        where: { userId },
        include: { item: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return NextResponse.json({ success: true, transactions, redemptions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
