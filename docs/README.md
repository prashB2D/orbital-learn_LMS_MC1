# HORBITEAL STUDY - PROJECT DOCUMENTATION

## 📚 PROJECT INFORMATION

**Project Name**: Horbiteal Study  
**Type**: Learning Management System (LMS)  
**Status**: Under Development  
**Date Created**: 2026-04-11

---

## 📖 DOCUMENTATION FILES

All project specifications are documented in the `/docs` folder:

### 1. **PRD.md** - Product Requirements Document
Contains:
- Product goal and user types (Student, Admin)
- All features (courses, quizzes, certificates, analytics)
- Business logic (rankings, progress tracking, multiple quiz attempts)
- Database structure
- Key rules and constraints

### 2. **TECH_STACK.md** - Technology Stack
Contains:
- All dependencies with exact versions
- Framework choices (Next.js, React, TypeScript)
- Database setup (PostgreSQL via Supabase)
- Free services (Nodemailer, YouTube, Google Drive, PDFKit)
- Environment variables needed
- Cost breakdown

### 3. **API_ENDPOINTS.md** - Complete API Reference
Contains:
- All 30+ API endpoints
- For each endpoint: purpose, input format, output format, auth requirements
- Organized by feature (auth, courses, payment, analytics, etc.)
- Common response formats

### 4. **DATABASE_SCHEMA.md** - Database Structure
Contains:
- All 9 Prisma models with fields and relationships
- Enums (roles, content types, payment status)
- Query examples for common operations
- Relationship diagrams

### 5. **PROJECT_FLOW.md** - Development Roadmap
Contains:
- 23 atomic tasks in execution order
- 9 development phases
- Dependencies between tasks (what must be done first)
- Completion checklist

---

## 🚀 QUICK START

### Project Structure
```
horbiteal-study/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup, forgot-password)
│   ├── (student)/         # Student pages (dashboard, courses, learn, etc.)
│   ├── (admin)/           # Admin pages (dashboard, analytics, management)
│   └── api/               # Backend API routes (30+ endpoints)
│
├── lib/                   # Utilities & helpers
│   ├── validations/       # Zod validation schemas
│   ├── prisma.ts         # Database client
│   ├── email.ts          # Email (Nodemailer + Gmail)
│   ├── pdf-generator.ts  # Certificate generation
│   └── utils.ts          # Helper functions
│
├── prisma/               # Database
│   └── schema.prisma     # All 9 models
│
├── types/                # TypeScript types
├── hooks/                # Custom React hooks
├── store/                # Zustand state management
├── components/           # React components
├── public/               # Static files
│   └── certificates/     # Generated PDFs
│
├── docs/                 # ⭐ PROJECT DOCUMENTATION
│   ├── PRD.md           # Product requirements
│   ├── TECH_STACK.md    # Technology stack
│   ├── API_ENDPOINTS.md # API reference
│   ├── DATABASE_SCHEMA.md # Database structure
│   └── PROJECT_FLOW.md  # Development roadmap
│
└── .env.example          # Environment variables template
```

---

## 📋 DEVELOPMENT TASKS

23 atomic tasks organized in 9 phases:

**Phase 1**: Project Setup (Tasks 1-3)  
**Phase 2**: Authentication (Tasks 4-6)  
**Phase 3**: Frontend Core (Task 7)  
**Phase 4**: Course Management (Tasks 8-10)  
**Phase 5**: Student Access (Tasks 11-15)  
**Phase 6**: Quiz & Rankings (Tasks 16-17)  
**Phase 7**: Progress & Certificates (Tasks 18-19)  
**Phase 8**: Analytics (Task 20)  
**Phase 9**: Dashboards (Tasks 21-23)

See `PROJECT_FLOW.md` for details on each task and dependencies.

---

## 🔧 TECH STACK SUMMARY

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14.2.3, React 18.3.1, TypeScript 5.4.5 |
| **Styling** | Tailwind CSS 3.4.3, Shadcn/ui |
| **Database** | PostgreSQL 15 (Supabase) |
| **ORM** | Prisma 5.13.0 |
| **Auth** | NextAuth.js 4.24.7, bcryptjs |
| **Forms** | React Hook Form 7.51.3, Zod 3.23.6 |
| **Payment** | Razorpay |
| **Email** | Nodemailer + Gmail SMTP (FREE) |
| **Video** | React Player 2.16.0 + YouTube |
| **Files** | Google Drive (manual links) |
| **PDF** | PDFKit 0.15.0 |
| **Deployment** | Vercel + Supabase |

**Total Cost**: ₹0 for MVP (all services are free tier)

---

## 🌟 KEY FEATURES

### Student Features
- ✅ Email/password authentication
- ✅ Browse and purchase courses
- ✅ Watch video lessons with attachments
- ✅ Attempt quizzes multiple times
- ✅ Track course progress
- ✅ View rankings/leaderboard
- ✅ Download certificates on 100% completion
- ✅ Dashboard with stats

### Admin Features
- ✅ Create courses with lessons and quizzes
- ✅ Add content anytime (lessons, quizzes, attachments)
- ✅ Manage student accounts
- ✅ View analytics (sales, courses, quizzes, users)
- ✅ Download transaction reports

---

## 📊 API ENDPOINTS (30+)

### Core APIs
- Auth (signup, login, forgot password)
- Courses (CRUD, list, get details)
- Content (add lessons, add quizzes)
- Quiz (submit, get attempts, leaderboard)
- Payment (Razorpay integration)
- Certificates (generate, download)
- Progress (track completion)
- Analytics (sales, courses, quizzes, users)

See `API_ENDPOINTS.md` for complete reference.

---

## 💾 DATABASE STRUCTURE

9 Prisma models:

| Model | Purpose |
|-------|---------|
| **User** | Store accounts (Student, Admin) |
| **Course** | Store course metadata |
| **Content** | Lessons and quizzes |
| **Question** | MCQ questions for quizzes |
| **Enrollment** | Student course ownership |
| **Progress** | Lesson/quiz completion tracking |
| **QuizAttempt** | Multiple quiz attempts per student |
| **Payment** | Transaction records |
| **Certificate** | PDF certificates on completion |

See `DATABASE_SCHEMA.md` for schema details and query examples.

---

## 🔐 SECURITY

- ✅ Password hashing (bcryptjs)
- ✅ JWT sessions (HTTP-only cookies)
- ✅ Backend enrollment verification (never trust URL)
- ✅ Payment signature verification (Razorpay)
- ✅ Role-based access (STUDENT, ADMIN)

---

## 📝 HOW TO USE THIS DOCUMENTATION

1. **New to the project?** → Start with `PRD.md` for overview
2. **Setting up tech?** → Refer to `TECH_STACK.md`
3. **Building APIs?** → Check `API_ENDPOINTS.md`
4. **Working with database?** → See `DATABASE_SCHEMA.md`
5. **Planning tasks?** → Follow `PROJECT_FLOW.md`

---

## 🚦 NEXT STEPS

1. Follow `PROJECT_FLOW.md` to understand task order
2. Start with Task 1 (Project Setup)
3. Check dependencies before each task
4. Refer to documentation for specifications

---

## 📞 NOTES

- All documentation is in `/docs` folder
- Each task has detailed implementation in corresponding docs
- All endpoints, database models, and features are documented
- No ambiguity - everything is specified clearly

**Ready to start building!** 🚀
