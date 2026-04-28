import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const redemptionId = params.id;
    const redemption = await prisma.coinRedemption.findUnique({
      where: { id: redemptionId },
      include: { user: true }
    });

    if (!redemption) {
      return NextResponse.json({ error: "Redemption not found" }, { status: 404 });
    }

    const userId = redemption.userId;

    // Get all transactions
    const transactions = await prisma.coinTransaction.findMany({
      where: { userId },
      include: {
        awardedBy: { select: { name: true } }
      },
      orderBy: { awardedAt: "desc" }
    });

    // Calculate totals
    const totalEarned = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    const allRedemptions = await prisma.coinRedemption.findMany({
      where: { userId, status: { in: ["VERIFIED", "DELIVERED", "COMPLETED"] } }
    });

    const previouslyRedeemed = allRedemptions.reduce((sum, r) => sum + r.coinsRedeemed, 0);

    return NextResponse.json({
      success: true,
      report: {
        studentName: redemption.user.name,
        studentId: redemption.user.studentId,
        coinsRequested: redemption.coinsRedeemed,
        currentBalance: redemption.user.coinBalance,
        totalEarned,
        previouslyRedeemed,
        transactions
      }
    });

  } catch (error: any) {
    console.error("Fetch report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
