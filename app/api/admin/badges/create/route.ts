import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, icon, type, rarity, triggerLogic } = body;

    if (!name || !description || !icon) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const badge = await prisma.badge.create({
      data: {
        name,
        description,
        icon,
        type: type || "MANUAL",
        rarity: rarity || "COMMON",
        triggerLogic,
        createdById: admin.id
      }
    });

    return NextResponse.json({ success: true, badge }, { status: 201 });
  } catch (error: any) {
    console.error("Create badge error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Badge name already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
