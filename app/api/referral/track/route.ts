import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // Fraud prevention 1: self-referral
    const referrer = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
    }
    if (referrer.id === user.id) {
      return NextResponse.json({ error: "Cannot use your own referral code" }, { status: 400 });
    }

    // Fraud prevention 2: already referred
    const existing = await prisma.referral.findUnique({ where: { referredId: user.id } });
    if (existing) {
      return NextResponse.json({ error: "You have already used a referral code" }, { status: 400 });
    }

    // Fraud prevention 3: domain matching
    const referrerDomain = referrer.email.split("@")[1];
    const referredDomain = user.email.split("@")[1];
    
    // We don't block domain matches (like gmail.com), but we could flag them in a real system.
    // For now, if they are identical non-standard domains (like company.com), we might flag it, 
    // but we'll let Admin verify it manually as requested.

    const referral = await prisma.$transaction(async (tx) => {
      // Create referral
      const ref = await tx.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: user.id,
          status: "PENDING"
        }
      });

      // Update user
      await tx.user.update({
        where: { id: user.id },
        data: { referredBy: code }
      });

      return ref;
    });

    return NextResponse.json({ success: true, referral });
  } catch (error: any) {
    console.error("Track referral error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
