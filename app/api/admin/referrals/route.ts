import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const referrals = await prisma.referral.findMany({
      include: {
        referrer: { select: { name: true, email: true } },
        referredUser: { select: { name: true, email: true } },
        verifiedBy: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, referrals });
  } catch (error: any) {
    console.error("Fetch referrals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
