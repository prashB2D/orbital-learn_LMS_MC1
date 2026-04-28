import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Students cannot access any /admin routes
    if (token.role === "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Mentors have restricted access within /admin
    if (token.role === "MENTOR") {
      const allowedMentorRoutes = ["/admin/courses", "/admin/users", "/admin/badges"];
      const isAllowed = allowedMentorRoutes.some(route => pathname.startsWith(route));
      
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/admin/courses", req.url));
      }
    }
  }

  // Protect student routes (everything that's not /admin, /api, /login, /signup, etc.)
  // Actually, we already have RoleGuard in StudentLayout for that.
  // But let's add redirect for /dashboard
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
