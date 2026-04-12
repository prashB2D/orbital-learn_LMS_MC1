/**
 * POST /api/auth/signup
 * Register new student account
 *
 * Input: {name, email, password}
 * Output: {success, userId}
 *
 * Features:
 * - Validate input with Zod
 * - Check if email exists
 * - Hash password with bcryptjs
 * - Create user in database
 * - Send welcome email via Nodemailer (FREE)
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const validatedData = signupSchema.parse(body);
    const { name, password } = validatedData;
    const email = validatedData.email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password with bcryptjs (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT", // New users are always students
      },
    });

    // Send welcome email (Nodemailer + Gmail SMTP - FREE)
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail signup if email fails - user is already created
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        message: "Account created successfully. Check your email for welcome message.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    // Handle validation errors from Zod
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid input. Please check your data." },
        { status: 400 }
      );
    }

    // Handle duplicate email error from database
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
