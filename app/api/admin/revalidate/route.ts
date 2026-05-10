import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Bust the website-data cache — Next.js will re-fetch from DB
    // on the very next public page request, then cache again.
    revalidateTag("website-data");

    return NextResponse.json({
      success: true,
      message: "Website cache cleared. Public pages will reload fresh data on next visit.",
      publishedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidate error:", error);
    return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 });
  }
}
