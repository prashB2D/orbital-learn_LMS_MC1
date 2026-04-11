# Horbiteal Study - LMS Platform

A complete Learning Management System (LMS) built with Next.js 14, React 18, and PostgreSQL.

## Features

- 📚 **Course Management**: Create and manage courses with video lessons and quizzes
- 🎥 **Video Lessons**: YouTube integration for seamless video delivery
- 🧠 **Interactive Quizzes**: Multiple-choice questions with multiple attempts support
- 📊 **Progress Tracking**: Real-time course completion percentage
- 🏆 **Leaderboard**: Quiz rankings and performance analytics
- 💳 **Payment Integration**: Razorpay for secure course purchases
- 📜 **Certificates**: Auto-generated PDF certificates on course completion
- 👥 **Student Dashboard**: Track courses, certificates, and quiz performance
- 🔐 **Authentication**: Email/password with JWT sessions
- 📧 **Email Notifications**: Welcome emails and password reset (Nodemailer - FREE)
- 📈 **Admin Analytics**: Sales, course, and quiz analytics

## Tech Stack

- **Frontend**: Next.js 14.2.3, React 18.3.1, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 5.13.0
- **Auth**: NextAuth.js 4.24.7
- **Payment**: Razorpay
- **Email**: Nodemailer + Gmail SMTP (FREE)
- **PDF**: PDFKit
- **Video**: React Player (YouTube)
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 20.12.2 LTS
- PostgreSQL 15 (or Supabase account for FREE database)
- Gmail account for email notifications

### Installation

1. **Clone the repository**

```bash
git clone <repo-url>
cd horbiteal-study
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env.local
```

Fill in the environment variables:
- `DATABASE_URL` - From Supabase
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - From Razorpay dashboard
- `GMAIL_USER` & `GMAIL_APP_PASSWORD` - App-specific password from Gmail

4. **Setup database**

```bash
npx prisma generate
npx prisma db push
```

5. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  api/               # Backend API routes (see API_ENDPOINTS.md)
  components/        # React components
lib/
  validations/       # Zod schemas
  prisma.ts         # Prisma client
  utils.ts          # Utility functions
psisma/
  schema.prisma     # Database schema
public/
  certificates/     # Generated PDF certificates
types/
  index.ts          # TypeScript types
```

## API Endpoints

All API endpoints are documented in `memory/api_endpoints.md`. Key endpoints:

- `POST /api/auth/signup` - Register
- `POST /api/auth/signIn` - Login
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (admin)
- `POST /api/payment/create-order` - Create payment order
- `POST /api/quiz/submit` - Submit quiz
- `GET /api/quiz/leaderboard/[quizId]` - Get rankings

## Database Schema

All models defined in `prisma/schema.prisma`:

- **User** - Students and admins
- **Course** - Course metadata
- **Content** - Lessons and quizzes
- **Question** - MCQ questions
- **Enrollment** - Student course enrollment
- **Progress** - Lesson completion tracking
- **QuizAttempt** - Multiple quiz attempts
- **Payment** - Transaction records
- **Certificate** - PDF certificates

## Cost Breakdown

✅ **100% FREE for MVP:**
- Supabase PostgreSQL: FREE tier (5GB)
- Nodemailer + Gmail SMTP: FREE (500 emails/day)
- YouTube: FREE (unlisted videos)
- Google Drive: FREE (link storage only)
- PDFKit: FREE (NPM package)
- Vercel: FREE tier (100GB bandwidth)
- Razorpay: Commission on payments only

## Development Workflow

1. Each task in `project_flow.md` should be completed in order
2. Check dependencies before starting a task
3. Follow API contract in `api_endpoints.md`
4. Use Prisma schema as source of truth
5. Update status in `project_flow.md` after each task

## Deployment

Deploy to **Vercel** (FREE tier):

```bash
npm install -g vercel
vercel login
vercel
```

Database deployed on **Supabase** (FREE tier).

## Documentation

- PRD: `memory/prd_full.md`
- API Endpoints: `memory/api_endpoints.md`
- Database Schema: `memory/database_schema.md`
- Tech Stack: `memory/tech_stack.md`
- Development Flow: `memory/project_flow.md`

## Support

For implementation guidance, refer to the memory files in `memory/` directory.

---

**Status**: Backend structure complete ✅ Ready for implementation

I am prashu.
