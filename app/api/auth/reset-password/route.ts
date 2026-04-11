/**
 * POST /api/auth/reset-password
 * Reset password with token
 *
 * Input: {token, newPassword}
 * Output: {success, message}
 *
 * Features:
 * - Validate input with Zod
 * - Find user with reset token
 * - Check token expiry
 * - Hash new password with bcryptjs
 * - Update user password and clear reset token
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const validatedData = resetPasswordSchema.parse(body);
    const { token, newPassword } = validatedData;

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token has expired (1 hour)
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password with bcryptjs (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Your password has been reset successfully. You can now login with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);

    // Handle validation errors from Zod
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid input. Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
