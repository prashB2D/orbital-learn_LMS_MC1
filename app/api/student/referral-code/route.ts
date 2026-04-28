import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        referralsMade: {
          include: { referredUser: { select: { name: true, createdAt: true } } }
        }
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Auto-generate code if they don't have one
    if (!dbUser.referralCode) {
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      dbUser = await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: code },
        include: {
          referralsMade: {
            include: { referredUser: { select: { name: true, createdAt: true } } }
          }
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      referralCode: dbUser.referralCode,
      referrals: dbUser.referralsMade
    });
  } catch (error: any) {
    console.error("Fetch referral code error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
