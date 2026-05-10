import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { studentName, role, text, rating, isActive } = body;

    if (!studentName || !role || !text || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const testimonial = await prisma.websiteTestimonial.update({
      where: { id: params.id },
      data: {
        studentName,
        role,
        text,
        rating: Number(rating),
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, testimonial });
  } catch (error) {
    console.error("Update testimonial error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.websiteTestimonial.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
