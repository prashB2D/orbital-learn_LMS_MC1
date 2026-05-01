import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { mentorId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mentorId } = params;

    const transactions = await prisma.coinTransaction.findMany({
      where: { awardedById: mentorId, isWithdrawal: false, amount: { gt: 0 } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { title: true } },
        quiz: { select: { title: true } }
      },
      orderBy: { awardedAt: "desc" }
    });

    return NextResponse.json({ success: true, transactions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
