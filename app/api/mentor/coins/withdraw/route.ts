import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "MENTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { originalTransactionId, reason } = await request.json();

    if (!originalTransactionId || !reason || reason.length < 10) {
      return NextResponse.json({ error: "Transaction ID and reason (min 10 chars) are required" }, { status: 400 });
    }

    const originalTx = await prisma.coinTransaction.findUnique({
      where: { id: originalTransactionId }
    });

    if (!originalTx) {
      return NextResponse.json({ error: "Original transaction not found" }, { status: 404 });
    }

    if (originalTx.awardedById !== user.id) {
      return NextResponse.json({ error: "You can only withdraw coins you awarded" }, { status: 403 });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if withdrawal already exists
      const existingWithdrawal = await tx.coinTransaction.findFirst({
        where: {
          userId: originalTx.userId,
          awardedById: user.id,
          amount: -originalTx.amount,
          isWithdrawal: true,
          reason: `Withdrawn: ${reason}`
        }
      });
      // A more robust check would be linking withdrawals to original tx, but we don't have that schema relation.

      const withdrawalTx = await tx.coinTransaction.create({
        data: {
          userId: originalTx.userId,
          courseId: originalTx.courseId,
          externalCourseName: originalTx.externalCourseName,
          quizId: originalTx.quizId,
          externalQuizRef: originalTx.externalQuizRef,
          amount: -originalTx.amount,
          reason: `Withdrawn: ${reason}`,
          awardedById: user.id,
          isWithdrawal: true
        }
      });

      await tx.user.update({
        where: { id: originalTx.userId },
        data: {
          coinBalance: {
            decrement: originalTx.amount
          }
        }
      });

      await tx.notification.create({
        data: {
          userId: originalTx.userId,
          title: "Coins Withdrawn",
          message: `${originalTx.amount} coins have been withdrawn by Mentor ${user.name}: ${reason}`,
          type: "COIN",
          payload: { originalTransactionId, withdrawalTxId: withdrawalTx.id }
        }
      });

      return withdrawalTx;
    });

    return NextResponse.json({ success: true, transaction: result }, { status: 200 });

  } catch (error) {
    console.error("Coin withdrawal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
