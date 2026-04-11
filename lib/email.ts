/**
 * Email utilities using Nodemailer + Gmail SMTP
 * 100% FREE - 500 emails/day limit from Gmail
 *
 * file: lib/email.ts
 */

import nodemailer from "nodemailer";

// Create transporter using Gmail SMTP (FREE)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // App-specific password from Gmail
    },
  });
};

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: email,
      subject: "Welcome to Horbiteal Study! 🎓",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Horbiteal Study! 🎓</h1>

          <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>

          <p style="font-size: 16px; color: #333;">
            Your account has been created successfully! You can now start learning with our expert-created courses.
          </p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2563eb;">Get Started:</h3>
            <ul style="font-size: 15px; color: #333;">
              <li>Browse our courses</li>
              <li>Watch video lessons</li>
              <li>Take interactive quizzes</li>
              <li>Earn certificates</li>
            </ul>
          </div>

          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses"
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Browse Courses
            </a>
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="font-size: 13px; color: #666;">
            Questions? Contact us at support@horbiteal.com
          </p>
        </div>
      `,
    });

    console.log("Welcome email sent to:", email);
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: email,
      subject: "Reset Your Password - Horbiteal Study",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Password Reset Request</h1>

          <p style="font-size: 16px; color: #333;">
            We received a request to reset your password. Click the link below to proceed:
          </p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>

          <p style="font-size: 14px; color: #666;">
            Or copy this link: <br>
            <code style="background-color: #f3f4f6; padding: 10px; display: inline-block;">${resetUrl}</code>
          </p>

          <p style="font-size: 13px; color: #dc2626; margin-top: 20px;">
            ⚠️ This link expires in 1 hour for security purposes.
          </p>

          <p style="font-size: 13px; color: #666;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Password reset email sent to:", email);
    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}

/**
 * Send enrollment confirmation email
 */
export async function sendEnrollmentConfirmationEmail(
  email: string,
  userName: string,
  courseName: string
) {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: email,
      subject: `You're enrolled in ${courseName}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Enrollment Confirmed! 🎉</h1>

          <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>

          <p style="font-size: 16px; color: #333;">
            Congratulations! You've been enrolled in <strong>${courseName}</strong>.
          </p>

          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-courses"
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Learning
            </a>
          </p>
        </div>
      `,
    });

    console.log("Enrollment confirmation sent to:", email);
    return true;
  } catch (error) {
    console.error("Failed to send enrollment confirmation email:", error);
    throw error;
  }
}
