import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { sendIssueNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { url, error } = body;

    if (!url || !error) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userInfo = session?.user?.email
      ? `${session.user.email} (${session.user.role || "user"})`
      : "Anonymous";

    // Save issue to DB
    const issue = await prisma.systemIssue.create({
      data: {
        url,
        error: String(error),
        userInfo,
      },
    });

    // Notify admin with issue details
    try {
      await sendIssueNotificationEmail(url, String(error), userInfo);
    } catch (notificationError) {
      console.error("Issue notification warning:", notificationError);
    }

    return NextResponse.json({ success: true, issueId: issue.id }, { status: 201 });
  } catch (err: any) {
    console.error("Failed to log issue:", err);
    return NextResponse.json({ error: "Failed to log system issue" }, { status: 500 });
  }
}
