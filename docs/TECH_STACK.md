---
name: Horbiteal Study Tech Stack
description: Complete tech stack with versions, dependencies, and setup instructions
type: reference
---

# TECH STACK & DEPENDENCIES

## Core Framework
- Next.js 14.2.3 (App Router)
- React 18.3.1
- TypeScript 5.4.5
- Node.js 20.12.2 LTS

## Database
- PostgreSQL 15 (via Supabase)
- Prisma ORM 5.13.0

## Authentication
- NextAuth.js 4.24.7
- bcryptjs 2.4.3

## Styling
- Tailwind CSS 3.4.3
- Shadcn/ui (latest)
- Lucide React 0.378.0 (icons)

## State Management
- Zustand 4.5.2

## Forms & Validation
- React Hook Form 7.51.3
- Zod 3.23.6
- @hookform/resolvers 3.3.4

## Video
- React Player 2.16.0 (plays YouTube)
- Storage: YouTube unlisted videos (videoId stored in DB)

## File Storage
- Google Drive (manual links, no API)

## Payment
- Razorpay Node SDK 2.9.2

## Email (100% FREE)
- Nodemailer (no setup cost)
- Gmail SMTP (500 emails/day limit)
- Resend 3.2.0 (alternative, optional)
- @react-email/components 0.0.17

## PDF Generation
- PDFKit 0.15.0 (certificate generation)

## Utilities
- clsx 2.1.1
- tailwind-merge 2.3.0
- date-fns 3.6.0
- class-variance-authority 0.7.0

## Deployment
- Vercel (frontend + API routes)
- Supabase (PostgreSQL database)

## Environment Variables Required
```
DATABASE_URL="postgresql://..." (from Supabase)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..." (min 32 chars)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@horbiteal.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GMAIL_USER="your-email@gmail.com" (optional, for Nodemailer)
GMAIL_APP_PASSWORD="..." (optional, app-specific password for Gmail)
```

## Installation Order
1. `npx create-next-app@14.2.3 horbiteal-study --typescript --tailwind --app`
2. Install all dependencies from package.json
3. Setup Supabase account (FREE tier) → get DATABASE_URL
4. Copy .env.example to .env.local → fill values
5. `npx prisma generate` → `npx prisma db push`
6. `npm run dev`

## No Cost Breakdown
✅ Supabase: FREE tier (5GB DB)
✅ Nodemailer: FREE (Node.js built-in email)
✅ Gmail SMTP: FREE (500 emails/day limit)
✅ YouTube: FREE (unlisted videos)
✅ Google Drive: FREE (manual PDF link storage)
✅ PDFKit: FREE (NPM package)
✅ Vercel: FREE tier (100GB bandwidth)
✅ Razorpay: Commission on successful payments only

**Total Deployment Cost for MVP: ₹0 (just Vercel bandwidth)**


