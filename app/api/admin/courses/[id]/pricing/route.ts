import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await request.json();
    
    const courseToUpdate = await prisma.course.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] }
    });

    if (!courseToUpdate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const bp = body.basePrice !== undefined ? Number(body.basePrice) : courseToUpdate.basePrice;
    const op = body.offerPercent !== undefined ? (body.offerPercent ? Number(body.offerPercent) : null) : courseToUpdate.offerPercent;
    const finalPrice = bp - (bp * (op || 0) / 100);

    const course = await prisma.course.update({
      where: { id: courseToUpdate.id },
      data: {
        basePrice: bp,
        offerPercent: op,
        finalPrice,
      },
    });

    return NextResponse.json({ success: true, course }, { status: 200 });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 });
  }
}
