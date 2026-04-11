/**
 * POST /api/certificates/generate
 * Purpose: Generate certificate (triggered on 100% completion)
 * Input: {enrollmentId}
 * Output: {success, certificateId, pdfUrl}
 * Auth Required: Yes (backend auto-trigger)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateCertificate } from "@/lib/pdf-generator";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) throw new Error("User not found");

    const { enrollmentId } = await request.json();
    if (!enrollmentId) {
      return NextResponse.json({ error: "Missing enrollmentId" }, { status: 400 });
    }

    // 1. Fetch deep enrollment state
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        course: {
          include: {
            contents: {
              include: {
                progress: {
                  where: { enrollmentId },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // 2. Validate explicit 100% passing threshold
    const totalContents = enrollment.course.contents.length;
    const completedContents = enrollment.course.contents.filter(
      (c) => c.progress.length > 0 && c.progress[0].completed
    ).length;

    const progressPercentage = totalContents > 0 ? (completedContents / totalContents) * 100 : 0;

    if (progressPercentage < 100) {
      return NextResponse.json({ error: "Course not 100% completed" }, { status: 403 });
    }

    // 3. Prevent duplicate certificate generation
    const existingCert = await prisma.certificate.findUnique({
      where: { enrollmentId },
    });

    if (existingCert) {
      return NextResponse.json({
        success: true,
        certificateId: existingCert.id,
        pdfUrl: existingCert.pdfUrl,
      });
    }

    // 4. Generate Certificate natively
    const certificateId = uuidv4();
    const pdfUrl = await generateCertificate(
      enrollment.user.name,
      enrollment.course.title,
      certificateId
    );

    // 5. Store Prisma representation
    const certificate = await prisma.certificate.create({
      data: {
        id: certificateId,
        enrollmentId,
        pdfUrl,
      },
    });

    return NextResponse.json({
      success: true,
      certificateId: certificate.id,
      pdfUrl: certificate.pdfUrl,
    });
  } catch (error: any) {
    console.error("Certificate generation error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
