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

    const student = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { coinBalance: true }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const earnedAgg = await prisma.coinTransaction.aggregate({
      where: { userId: targetUserId },
      _sum: { amount: true }
    });
    
    // Check if StorePurchase exists in schema for redemptions
    let totalRedeemed = 0;
    try {
      const redeemedAgg = await (prisma as any).storePurchase.aggregate({
        where: { userId: targetUserId, status: "COMPLETED" },
        _sum: { pricePaid: true }
      });
      totalRedeemed = redeemedAgg._sum.pricePaid || 0;
    } catch(e) {}

    return NextResponse.json({ 
      success: true, 
      coinBalance: student.coinBalance || 0,
      totalEarned: earnedAgg._sum.amount || 0,
      totalRedeemed
    });
  } catch (error: any) {
    console.error("Fetch coin balance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
