import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail, sendNotification } from "@/lib/notification";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const redemptions = await prisma.coinRedemption.findMany({
      include: {
        user: { select: { name: true, email: true, coinBalance: true } },
        item: { select: { name: true, costInCoins: true } },
        verifiedBy: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, redemptions });
  } catch (error: any) {
    console.error("Fetch redemptions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { redemptionId, status } = body;

    if (!redemptionId || !["VERIFIED", "DELIVERED", "REJECTED", "COMPLETED"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const redemption = await prisma.coinRedemption.findUnique({
      where: { id: redemptionId },
      include: { item: true, user: true }
    });

    if (!redemption) {
      return NextResponse.json({ error: "Redemption not found" }, { status: 404 });
    }

    if (redemption.status === "DELIVERED" || redemption.status === "REJECTED" || redemption.status === "COMPLETED") {
      return NextResponse.json({ error: "Redemption is already finalized" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const updateData: any = { 
        status,
        verifiedById: admin.id
      };
      
      if (status === "VERIFIED") {
        updateData.verifiedAt = new Date();
      }

      await tx.coinRedemption.update({
        where: { id: redemptionId },
        data: updateData
      });

      if (status === "REJECTED") {
        // Refund coins
        await tx.user.update({
          where: { id: redemption.userId },
          data: { coinBalance: { increment: redemption.coinsRedeemed } }
        });
        
        // Restore stock
        if (!redemption.item.isUnlimited) {
          await tx.storeItem.update({
            where: { id: redemption.itemId },
            data: { stockCount: { increment: 1 } }
          });
        }
      }
    });

    if (status === "VERIFIED") {
      await sendEmail({
        to: redemption.user.email,
        subject: "Redemption Verified!",
        body: `Your redemption for ${redemption.item.name} has been verified. You will receive it shortly.`
      });
      await sendNotification({
        userId: redemption.userId,
        title: "Redemption Verified",
        message: `Your redemption for ${redemption.item.name} has been verified and is processing.`,
        type: "REDEMPTION"
      });
    } else if (status === "REJECTED") {
      await sendEmail({
        to: redemption.user.email,
        subject: "Redemption Rejected",
        body: `Your redemption request for ${redemption.item.name} was reviewed and could not be processed. Contact support.`
      });
      await sendNotification({
        userId: redemption.userId,
        title: "Redemption Rejected",
        message: `Your redemption for ${redemption.item.name} was rejected. ${redemption.coinsRedeemed} coins have been refunded.`,
        type: "REDEMPTION"
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update redemption error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
