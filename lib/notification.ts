import { prisma } from "./prisma";
import nodemailer from "nodemailer";

export async function sendNotification({ userId, title, message, type }: { userId: string, title: string, message: string, type: string }) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function sendEmail({ to, subject, body }: { to: string, subject: string, body: string }) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to,
      subject,
      text: body,
      html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${body}</div>`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    // Fallback to console log if email fails
    console.log(`\n================= EMAIL FALLBACK =================\nTO: ${to}\nSUBJECT: ${subject}\n\n${body}\n==================================================\n`);
  }
}
