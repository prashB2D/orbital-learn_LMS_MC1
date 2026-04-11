import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { id: userId } = params;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                contents: {
                  include: {
                    progress: {
                      where: { enrollmentId: undefined }, // We will filter post-fetch since Prisma can't easily cross-reference here directly
                    },
                  },
                },
              },
            },
            progress: true,
          },
        },
        payments: {
          where: { status: "SUCCESS" },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format Enrollments mathematically computing completion states
    const enrollments = targetUser.enrollments.map((enr) => {
      const totalContents = enr.course.contents.length;
      const completedContents = enr.progress.filter((p) => p.completed).length;
      const progress = totalContents > 0 ? (completedContents / totalContents) * 100 : 0;

      const matchedPayment = targetUser.payments.find(
        (p) => p.courseId === enr.courseId
      );

      return {
        courseTitle: enr.course.title,
        enrolledAt: enr.createdAt,
        progress: Math.round(progress),
        paymentAmount: matchedPayment?.amount || 0,
        paymentStatus: matchedPayment?.status || "UNKNOWN",
      };
    });

    const totalSpent = targetUser.payments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      createdAt: targetUser.createdAt,
      enrollments,
      totalSpent,
    });
  } catch (error: any) {
    console.error("Fetch single user error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
