import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP
    await prisma.otpVerification.upsert({
      where: { email: normalizedEmail },
      update: { otp, expiresAt, createdAt: new Date() },
      create: { email: normalizedEmail, otp, expiresAt },
    });

    // Send the email
    await sendOtpEmail(normalizedEmail, otp);

    return NextResponse.json({ success: true, message: "OTP sent" }, { status: 200 });
  } catch (error) {
    console.error("OTP generation error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
