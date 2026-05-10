/**
 * POST /api/admin/push-to-website
 *
 * Admin-only endpoint that reads active content from the LMS database and
 * upserts it into the website's separate Supabase project.
 *
 * Tables written to on the website:
 *   - website_courses
 *   - website_testimonials
 *   - website_programs
 *   - website_program_courses
 *   - website_program_workshops
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { websiteSupabase } from "@/lib/websiteSupabase";

// ---------------------------------------------------------------------------
// Helper: safe JSON parse - returns [] on any failure
// ---------------------------------------------------------------------------
function safeParseArray(raw: string | null | undefined): unknown[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Helper: map program type to icon name
// ---------------------------------------------------------------------------
function getProgramIcon(type: string): string {
  switch (type) {
    case "SUMMER":
      return "Sun";
    case "WINTER":
      return "Snowflake";
    case "WORKSHOP":
      return "Wrench";
    default:
      return "Layers";
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST() {
  console.log("ENV CHECK:", {
    url: process.env.WEBSITE_SUPABASE_URL,
    keyExists: !!process.env.WEBSITE_SUPABASE_SERVICE_KEY,
    keyLength: process.env.WEBSITE_SUPABASE_SERVICE_KEY?.length,
  });
  console.log("Push triggered");


  // 1. Auth guard
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized - admin access required" },
      { status: 401 }
    );
  }

  try {
    // 2. Read from LMS database
    const [programs, testimonials, courses, settings] = await Promise.all([
      prisma.websiteProgram.findMany({ where: { isActive: true } }),
      prisma.websiteTestimonial.findMany({ where: { isActive: true } }),
      prisma.course.findMany({ where: { showOnWebsite: true } }),
      prisma.websiteSetting.findMany(),
    ]);

    console.log("LMS data:", {
      courses: courses.length,
      testimonials: testimonials.length,
      programs: programs.length,
    });

    // 3. Transform: Courses -> website_courses
    const websiteCourses = courses.map((c) => ({
      id: c.id,
      icon: c.category ?? "Code2",
      title: c.title,
      description: c.description,
      image_url: c.thumbnail ?? null,
      skills: [] as string[],   // Course model has no skills field; website expects array
      duration: "",             // Course model has no duration field; website expects string
      hook: c.badgeText ?? "",
      level: "",
      tags: [] as string[],
      is_active: true,
    }));

    // 4. Transform: Testimonials -> website_testimonials
    // NOTE: Prisma field is "studentName" (not "name"), and "text" (not "content")
    const websiteTestimonials = testimonials.map((t) => ({
      id: t.id,
      name: t.studentName,        // Prisma field: studentName (mapped to website column: name)
      role: t.role,
      text: t.text,               // Prisma field: text
      rating: t.rating ?? null,
      is_active: t.isActive,
    }));

    // 5. Transform: Programs -> website_programs
    // NOTE: website column "label" maps to Prisma "title"; "content" maps to Prisma "description"
    // NOTE: "icon" uses program.type (SUMMER, WINTER, WORKSHOP) mapped to icon name
    const websitePrograms = programs.map((p) => ({
      id: p.id,
      icon: getProgramIcon(p.type),
      label: p.title,
      duration: p.duration ?? "",
      content: p.description ?? "",
      image_url: p.imageUrl ?? null,
      is_active: p.isActive,
      is_timer_only: p.isTimerOnly ?? false,
      is_locked: p.isLocked ?? false,
      unlock_date: p.unlockDate ? p.unlockDate.toISOString().split("T")[0] : null,
      highlights: safeParseArray(p.highlights), // [{time, text}] — aside/hover panel
      features: p.highlights ?? null,
      next_batch_date: p.startDate ? p.startDate.toISOString().split("T")[0] : null,
    }));

    // 6. Build junction rows
    // website_program_courses: one row per course entry in program.courses JSON
    const programCourseRows: { program_id: string; [key: string]: unknown }[] = [];
    // website_program_workshops: one row per workshop entry in program.workshops JSON
    const programWorkshopRows: { program_id: string; [key: string]: unknown }[] = [];

    for (const p of programs) {
      const courseItems = safeParseArray(p.courses);
      const workshopItems = safeParseArray(p.workshops);

      for (const item of courseItems) {
        if (item && typeof item === "object") {
          programCourseRows.push({ program_id: p.id, ...(item as object) });
        } else if (typeof item === "string") {
          programCourseRows.push({ program_id: p.id, id: item });
        }
      }

      for (const item of workshopItems) {
        if (item && typeof item === "object") {
          programWorkshopRows.push({ program_id: p.id, ...(item as object) });
        } else if (typeof item === "string") {
          programWorkshopRows.push({ program_id: p.id, id: item });
        }
      }
    }

    // 7. Delete existing data from Website Supabase (order matters for FK)
    const errors: string[] = [];
    
    await websiteSupabase.from("website_program_courses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await websiteSupabase.from("website_program_workshops").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await websiteSupabase.from("website_programs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await websiteSupabase.from("website_courses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await websiteSupabase.from("website_testimonials").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await websiteSupabase.from("website_settings").delete().neq("key", "xyz123_never_match");

    // 8. Insert fresh data into website Supabase

    // Settings
    const websiteSettings = settings.map(s => ({ key: s.key, value: s.value }));
    let settingsResult: unknown = null;
    if (websiteSettings.length > 0) {
      const result = await websiteSupabase
        .from("website_settings")
        .insert(websiteSettings);
      settingsResult = result;
      if (result.error) errors.push(`website_settings: ${result.error.message}`);
    }
    console.log("Inserted settings:", settingsResult);

    // Courses
    let coursesResult: unknown = null;
    if (websiteCourses.length > 0) {
      const result = await websiteSupabase
        .from("website_courses")
        .insert(websiteCourses);
      coursesResult = result;
      if (result.error) errors.push(`website_courses: ${result.error.message}`);
    }
    console.log("Inserted courses:", coursesResult);

    // Testimonials
    let testimonialsResult: unknown = null;
    if (websiteTestimonials.length > 0) {
      const result = await websiteSupabase
        .from("website_testimonials")
        .insert(websiteTestimonials);
      testimonialsResult = result;
      if (result.error) errors.push(`website_testimonials: ${result.error.message}`);
    }
    console.log("Inserted testimonials:", testimonialsResult);

    // Programs
    let programsResult: unknown = null;
    if (websitePrograms.length > 0) {
      const result = await websiteSupabase
        .from("website_programs")
        .insert(websitePrograms);
      programsResult = result;
      if (result.error) errors.push(`website_programs: ${result.error.message}`);
    }
    console.log("Inserted programs:", programsResult);

    // Program courses junction
    if (programCourseRows.length > 0) {
      const { error } = await websiteSupabase
        .from("website_program_courses")
        .insert(programCourseRows);
      if (error) errors.push(`website_program_courses: ${error.message}`);
    }

    // Program workshops junction
    if (programWorkshopRows.length > 0) {
      const { error } = await websiteSupabase
        .from("website_program_workshops")
        .insert(programWorkshopRows);
      if (error) errors.push(`website_program_workshops: ${error.message}`);
    }

    // 8. Return result
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join("; ") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pushed: {
        courses: websiteCourses.length,
        testimonials: websiteTestimonials.length,
        programs: websitePrograms.length,
        settings: websiteSettings.length,
      },
    });
  } catch (err) {
    console.error("Push error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
