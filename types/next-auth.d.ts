/**
 * NextAuth type extensions
 * file: types/next-auth.d.ts
 */

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      role: "STUDENT" | "ADMIN" | "MENTOR";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "STUDENT" | "ADMIN" | "MENTOR";
    email: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STUDENT" | "ADMIN" | "MENTOR";
    email: string;
    name: string;
  }
}
