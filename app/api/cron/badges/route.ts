import { NextResponse } from "next/server";
import { processAutoBadges } from "@/lib/badge-engine";

export async function GET(request: Request) {
  // In a real production app, ensure this endpoint is protected via an authorization header 
  // checking against a CRON_SECRET, or restricted to Vercel Cron IP ranges.
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processAutoBadges();
    return NextResponse.json({ success: true, awarded: result.awarded });
  } catch (error: any) {
    console.error("Cron auto-badge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
