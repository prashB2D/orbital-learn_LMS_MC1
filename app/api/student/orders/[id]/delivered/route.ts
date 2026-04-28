import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const order = await prisma.coinRedemption.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (order.status !== "VERIFIED") {
      return NextResponse.json({ error: "Order is not in VERIFIED state" }, { status: 400 });
    }

    const updatedOrder = await prisma.coinRedemption.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date()
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Mark delivered error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
