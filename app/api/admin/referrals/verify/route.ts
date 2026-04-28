import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail, sendNotification } from "@/lib/notification";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { referralId, status, rewardAmount } = await request.json();
    if (!referralId || !["VERIFIED", "REWARDED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { referrer: true }
    });

    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    if (referral.status === "REWARDED" || referral.status === "REJECTED") {
      return NextResponse.json({ error: "Referral is already finalized" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      let dataToUpdate: any = { 
        status,
        verifiedById: admin.id
      };

      if (status === "REWARDED") {
        const amount = rewardAmount || 500; // Default 500 coins
        dataToUpdate.rewardGiven = true;
        dataToUpdate.rewardType = "COINS";
        dataToUpdate.rewardValue = amount;

        // Reward referrer
        await tx.user.update({
          where: { id: referral.referrerId },
          data: { coinBalance: { increment: amount } }
        });
        
        // Optional: Also reward referred user? Usually both get something.
        await tx.user.update({
          where: { id: referral.referredId },
          data: { coinBalance: { increment: amount } }
        });
      }

      await tx.referral.update({
        where: { id: referralId },
        data: dataToUpdate
      });
    });

    if (status === "REWARDED") {
      await sendEmail({
        to: referral.referrer.email,
        subject: "Referral Reward Earned!",
        body: `Your friend has joined and you earned ${rewardAmount || 500} coins!`
      });
      await sendNotification({
        userId: referral.referrerId,
        title: "Referral Reward!",
        message: `You earned ${rewardAmount || 500} coins for your successful referral!`,
        type: "REFERRAL"
      });
      await sendNotification({
        userId: referral.referredId,
        title: "Welcome Reward!",
        message: `You earned ${rewardAmount || 500} coins for joining via a referral!`,
        type: "REFERRAL"
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Verify referral error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
