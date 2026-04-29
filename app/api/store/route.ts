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
    const { name, description, baseCoinPrice, offerPercent, imageUrl, isUnlimited, stockCount, detailHtmlTop, detailHtmlBottom } = body;

    const basePrice = Number(baseCoinPrice) || 0;
    const offer = Number(offerPercent) || 0;
    const costInCoins = basePrice - Math.floor((basePrice * offer) / 100);

    const item = await prisma.storeItem.create({
      data: {
        name,
        description,
        baseCoinPrice: basePrice,
        offerPercent: offer,
        costInCoins,
        imageUrl,
        isUnlimited: Boolean(isUnlimited),
        stockCount: Number(stockCount || 0),
        detailHtmlTop,
        detailHtmlBottom
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
    
    const body = await request.json();
    const { id, isActive, name, description, baseCoinPrice, offerPercent, imageUrl, isUnlimited, stockCount, detailHtmlTop, detailHtmlBottom } = body;
    
    // If we are just toggling isActive
    if (Object.keys(body).length === 2 && isActive !== undefined) {
      await prisma.storeItem.update({ where: { id }, data: { isActive } });
      return NextResponse.json({ success: true });
    }

    const basePrice = Number(baseCoinPrice) || 0;
    const offer = Number(offerPercent) || 0;
    const costInCoins = basePrice - Math.floor((basePrice * offer) / 100);

    await prisma.storeItem.update({
      where: { id },
      data: {
        name,
        description,
        baseCoinPrice: basePrice,
        offerPercent: offer,
        costInCoins,
        imageUrl,
        isUnlimited: Boolean(isUnlimited),
        stockCount: Number(stockCount || 0),
        detailHtmlTop,
        detailHtmlBottom
      }
    });
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
