import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentUser();
    let items;
    if (admin && admin.role === "ADMIN") {
      items = await prisma.storeItem.findMany({ orderBy: { costInCoins: "asc" } });
    } else {
      items = await prisma.storeItem.findMany({
        where: { isActive: true },
        orderBy: { costInCoins: "asc" }
      });
    }
    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, costInCoins, imageUrl, isUnlimited, stockCount } = body;

    const item = await prisma.storeItem.create({
      data: {
        name,
        description,
        costInCoins: Number(costInCoins),
        imageUrl,
        isUnlimited: Boolean(isUnlimited),
        stockCount: Number(stockCount || 0)
      }
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Create store item error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const { id, isActive } = await request.json();
    await prisma.storeItem.update({ where: { id }, data: { isActive } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    await prisma.storeItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
