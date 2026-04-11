# PROJECT FLOW & TASK SEQUENCE

## Development Order (MUST FOLLOW THIS SEQUENCE)

### Phase 1: Project Setup (Tasks 1-3)
**Dependency**: None  
**Outputs**: Project skeleton, database ready

- **Task 1**: Setup project structure (Next.js + Tailwind + all deps)
- **Task 2**: Setup PostgreSQL database (Supabase FREE)
- **Task 3**: Create Prisma schema (all 8 collections)

### Phase 2: Authentication (Tasks 4-6)
**Dependency**: Task 3 (schema must exist)  
**Outputs**: Users can signup, login, reset password

- **Task 4**: Setup NextAuth.js (JWT + bcrypt)
- **Task 5**: Signup API (hash password, validate, send email via Nodemailer)
- **Task 6**: Forgot Password (email + reset link via Nodemailer)

### Phase 3: Frontend Core (Task 7)
**Dependency**: Task 5 (auth working)  
**Outputs**: Landing page live

- **Task 7**: Landing page (hero + featured courses + footer)

### Phase 4: Admin Course Management (Tasks 8-10)
**Dependency**: Task 4 (admin auth)  
**Outputs**: Admin can create courses + add lessons + add quizzes

- **Task 8**: Admin - Create course
- **Task 9**: Admin - Add lesson (YouTube videoId + Drive attachments)
- **Task 10**: Admin - Add quiz (MCQ with multiple questions)

### Phase 5: Student Course Access (Tasks 11-15)
**Dependency**: Tasks 8, 9, 10 (courses exist)  
**Outputs**: Student can browse, buy, and learn

- **Task 11**: Course listing page (student view)
- **Task 12**: Course details page
- **Task 13**: Payment integration (Razorpay)
- **Task 14**: Video player component (React Player)
- **Task 15**: Learning page (video + content list + progress)

### Phase 6: Quiz & Ranking (Tasks 16-17)
**Dependency**: Task 15 (learning page done)  
**Outputs**: Students can take quizzes multiple times, see rankings

- **Task 16**: Quiz attempt API (multiple attempts support)
- **Task 17**: Leaderboard (ranking per quiz)

### Phase 7: Progress & Certificates (Tasks 18-19)
**Dependency**: Task 15 (progress tracking)  
**Outputs**: Progress % calculated, certificates auto-generated

- **Task 18**: Progress tracking (formula: completed/total*100)
- **Task 19**: Certificate generation (PDF on 100% completion)

### Phase 8: Admin Analytics (Task 20)
**Dependency**: Tasks 13, 16 (payments + quizzes exist)  
**Outputs**: Admin sees sales, course, quiz analytics

- **Task 20**: Admin analytics (sales, courses, quizzes)

### Phase 9: Dashboard & Admin Views (Tasks 21-23)
**Dependency**: Task 20 (analytics done)  
**Outputs**: Student dashboard + Admin users + Admin transactions views

- **Task 21**: Student dashboard (my courses, certificates, quiz perf)
- **Task 22**: Admin - View all users
- **Task 23**: Admin - View transactions

## Completion Status
- [ ] Task 1: Setup project structure
- [ ] Task 2: Setup database
- [ ] Task 3: Prisma schema
- [ ] Task 4: NextAuth
- [ ] Task 5: Signup API
- [ ] Task 6: Forgot password
- [ ] Task 7: Landing page
- [ ] Task 8: Create course
- [ ] Task 9: Add lesson
- [ ] Task 10: Add quiz
- [ ] Task 11: Course listing
- [ ] Task 12: Course details
- [ ] Task 13: Payment
- [ ] Task 14: Video player
- [ ] Task 15: Learning page
- [ ] Task 16: Quiz attempt
- [ ] Task 17: Leaderboard
- [ ] Task 18: Progress tracking
- [ ] Task 19: Certificates
- [ ] Task 20: Admin analytics
- [ ] Task 21: Student dashboard
- [ ] Task 22: Admin - Users
- [ ] Task 23: Admin - Transactions

## Key Dependencies
| Task | Depends On | Why |
|------|-----------|-----|
| 4 | 3 | Need user schema to create auth |
| 5 | 4 | Need auth to signup |
| 7 | 5 | Need auth working for navbar |
| 8 | 4 | Admin role check |
| 11 | 8 | Need courses to list |
| 12 | 11 | Need course details page |
| 13 | 12 | Payment button on course details |
| 15 | 13 | Enrollment created by payment |
| 16 | 15 | Quiz content exists in learning page |
| 17 | 16 | Need quiz attempts to rank |
| 19 | 18 | Progress % needed to award certificate |
| 20 | 13, 16 | Need payments + quiz attempts |
| 21 | 19 | Dashboard shows all student data |
| 22 | 4 | Admin route |
| 23 | 13 | Admin route to list payments |

## Entry Point Checklist Before Each Task
When starting a new task, verify:
1. ✅ All dependencies from table above are completed
2. ✅ Previous task outputs are ready (check Prisma schema, APIs working)
3. ✅ You understand the task description from atomic breakdown
4. ✅ You know what endpoints/data format will be used
5. ✅ File paths match the PRD structure

## After Each Task
- Update status checkbox above
- Verify no breaking changes to previous tasks
- Test API endpoints if created
- Document any environment variable changes
