import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.coinRedemption.findMany({
      where: { userId: user.id },
      include: {
        item: { select: { name: true, costInCoins: true, imageUrl: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
