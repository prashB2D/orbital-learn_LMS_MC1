/**
 * POST /api/auth/signIn
 * Sign in with email and password
 *
 * Input: {email, password}
 * Output: {user: {...}, token}
 */

import { signIn } from "next-auth/react";

// This is handled by NextAuth's built-in signIn function
// Use on frontend: await signIn("credentials", {email, password, redirect: false})
// NextAuth will automatically:
// 1. Validate credentials
// 2. Create JWT token
// 3. Set HTTP-only cookie
// 4. Return user session
