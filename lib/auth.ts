/**
 * Auth utility functions
 * file: lib/auth.ts
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * Get current user session (server-side only)
 */
export async function getCurrentSession() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

/**
 * Get current user (server-side only)
 */
export async function getCurrentUser() {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    return user;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getCurrentSession();
  return !!session?.user;
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  try {
    const session = await getCurrentSession();
    return session?.user?.role === "ADMIN";
  } catch (error) {
    return false;
  }
}

/**
 * Require authentication middleware
 * Use in API routes to require login
 */
export async function requireAuth() {
  const session = await getCurrentSession();
  if (!session?.user) {
    throw new Error("Unauthorized - please login");
  }
  return session;
}

/**
 * Require admin role middleware
 * Use in API routes to require admin
 */
export async function requireAdmin() {
  const session = await getCurrentSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized - admin access required");
  }
  return session;
}

/**
 * Check if user is mentor
 */
export async function isMentor() {
  try {
    const session = await getCurrentSession();
    return session?.user?.role === "MENTOR";
  } catch (error) {
    return false;
  }
}

/**
 * Check if user (mentor) has access to course
 */
export async function hasCourseAccess(courseId: string) {
  try {
    const session = await getCurrentSession();
    if (!session?.user) return false;
    
    // Admins have access to all courses
    if (session.user.role === "ADMIN") return true;
    
    // Mentors only have access to assigned courses
    if (session.user.role === "MENTOR") {
      const course = await prisma.course.findFirst({
        where: {
          OR: [{ id: courseId }, { slug: courseId }]
        }
      });
      if (!course) return false;
      const assignment = await prisma.courseAssignment.findUnique({
        where: {
          courseId_mentorId: {
            courseId: course.id,
            mentorId: session.user.id
          }
        }
      });
      return !!assignment;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Require mentor/admin course access middleware
 */
export async function requireCourseAccess(courseId: string) {
  const hasAccess = await hasCourseAccess(courseId);
  if (!hasAccess) {
    throw new Error("Unauthorized - you do not have access to this course");
  }
  return await getCurrentSession();
}
