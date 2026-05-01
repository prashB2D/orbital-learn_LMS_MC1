import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail, sendNotification } from "@/lib/notification";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, phoneNumber, notes } = body;

    if (!itemId || !phoneNumber) {
      return NextResponse.json({ error: "Missing item or phone number" }, { status: 400 });
    }

    const phoneRegex = /^\+\d{1,4}\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    const item = await prisma.storeItem.findUnique({ where: { id: itemId } });
    if (!item || !item.isActive) {
      return NextResponse.json({ error: "Item not available" }, { status: 400 });
    }

    if (!item.isUnlimited && item.stockCount <= 0) {
      return NextResponse.json({ error: "Item out of stock" }, { status: 400 });
    }

    const student = await prisma.user.findUnique({ where: { id: user.id } });
    if (!student || student.coinBalance < item.costInCoins) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 400 });
    }

    const redemption = await prisma.$transaction(async (tx) => {
      // Create redemption (PENDING)
      const red = await tx.coinRedemption.create({
        data: {
          userId: user.id,
          itemId,
          coinsRedeemed: item.costInCoins,
          status: "PENDING",
          phoneNumber,
          notes
        }
      });

      // Deduct stock if not unlimited
      if (!item.isUnlimited) {
        await tx.storeItem.update({
          where: { id: itemId },
          data: { stockCount: { decrement: 1 } }
        });
      }

      // NOTE: We do NOT deduct the student's coin balance yet. 
      // It will be deducted when admin marks it COMPLETED.
      // But to prevent double-spending, we should probably deduct it now, 
      // or check pending redemptions against balance. Let's just create it and check balance during VERIFY.
      // Wait, better to deduct now and refund if REJECTED, otherwise they can spam redeem.
      await tx.user.update({
        where: { id: user.id },
        data: { coinBalance: { decrement: item.costInCoins } }
      });

      return red;
    });

    // Send email notification to admin
    await sendEmail({
      to: process.env.EMAIL_FROM || "admin@horbiteal.com",
      subject: "New Coin Redemption Request",
      body: `Student ${student.name} (${student.email}) requested redemption for ${item.name}. Phone: ${phoneNumber}. Request ID: ${redemption.id}\n\nNotes: ${notes || "None"}`
    });

    await sendNotification({
      userId: user.id,
      title: "Redemption Requested",
      message: `Your request for ${item.name} has been submitted and is pending verification.`,
      type: "REDEMPTION"
    });

    return NextResponse.json({ success: true, redemption }, { status: 201 });
  } catch (error: any) {
    console.error("Coin redeem error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
