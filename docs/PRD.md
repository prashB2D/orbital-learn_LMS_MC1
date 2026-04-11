---
name: Horbiteal Study Complete PRD
description: Full product overview, features, user types, payment, course structure, analytics
type: project
---

# HORBITEAL STUDY — COMPLETE PRD

## Product Goal
- Sell mini-courses (video + notes)
- Deliver video lessons  
- Track learning progress
- Conduct quizzes (MULTIPLE ATTEMPTS allowed)
- Show rankings/leaderboard  
- Generate certificates (on 100% completion)

## User Types

### 👨‍🎓 Student
- Signup/login
- Browse and purchase courses
- Watch video lessons  
- Download notes (Google Drive links)
- Attempt quizzes multiple times
- View rankings (see own rank + top performers)
- Track progress percentage
- Download certificate (when 100% complete)
- View quiz attempt history

### 🧑‍💼 Admin
- Create courses
- Add lessons anytime (with YouTube videos + Drive attachments)
- Add quizzes anytime (MCQ format)
- Add/reorder content manually
- View analytics:
  - Sales (total revenue, revenue per course)
  - Course analytics (best selling, most popular, total students)
  - Quiz analytics (top performers, average scores, total attempts)
  - User list with spending

## Auth System (100% FREE)
- Email + Password (bcryptjs hashing)
- Sessions via JWT (HTTP-only cookie)
- Forgot password: Nodemailer + Gmail SMTP (FREE - 500 emails/day limit)
- No OAuth/third-party auth

## Course Structure
- **NO modules** → Linear system
- Contents in order: Lesson 1 → Lesson 2 → Quiz → Lesson 3 → etc.
- Admin controls order manually

## Content Types
1. **Lesson**: YouTube videoId + optional Drive attachments
2. **Quiz**: MCQ questions with multiple attempts per student

## Video System
- Store: YouTube videoId only (e.g., "dQw4w9WgXcQ")
- Play: `<ReactPlayer url={youtube.com/watch?v=${videoId}} />`
- No right-click (JS disabled)
- Unlisted YouTube videos (not hidden, but not discoverable)

## Quiz System (Updated)
- Students can attempt MULTIPLE times
- Each attempt stored separately with:
  - User ID, Quiz ID, answers, score, attempt number, timestamp
- After submission: show ranking (user's rank among all students for that quiz)
- Admin sees all attempts in analytics

## Progress Tracking
- Formula: `completed / total_contents × 100`
- Each content (lesson or quiz) = 1 unit
- Completion triggered at 90% video watched or quiz submitted

## Attachments
- Google Drive PDF links (admin pastes, no API)
- Students click → open in new tab
- No storage cost

## Certificate
- Trigger: 100% course completion
- Generated as PDF (Name, Course, Date)
- Downloadable from dashboard

## Payment (Razorpay)
- Create order → Payment → Verify → Create enrollment
- Student immediately gets access after successful verification

## Admin Analytics
### Sales
- Total revenue, total transactions
- Revenue per course (breakdown)

### Course Analytics  
- Best selling course (most students)
- Most popular course
- Revenue per course
- Total students on platform

### Quiz Analytics
- Per quiz: Top 5 performers, average score, total attempts
- Per course: Leaderboard visible to all students

### Users
- List all users with email, join date, total spent

### Transactions
- List all payments with order ID, payment ID, amount, status, user, course, date
- Filter by status + search

## Database Collections
- Users (id, email, password, name, role)
- Courses (id, title, description, price, thumbnail, slug)
- Contents (id, courseId, type [LESSON/QUIZ], title, videoId, attachments, order)
- Questions (id, contentId, questionText, options[], correctAnswer)
- Enrollments (id, userId, courseId, createdAt)
- Progress (id, enrollmentId, contentId, completed, completedAt)
- QuizAttempts (id, userId, quizId, attemptNumber, answers, score, createdAt)
- Payments (id, userId, courseId, amount, razorpayOrderId, razorpayPaymentId, status)
- Certificates (id, enrollmentId, pdfUrl, issuedAt)

## Key Rules
- **URL Security**: Never trust URL → Always backend verify (logged in + purchased before allowing access)
- **Video Protection**: videoId in DB only, disable right-click, backend validates enrollment
- **Multiple Quiz Attempts**: Store each as separate record, show all in student dashboard
- **Ranking**: Based on BEST SCORE per student per quiz
- **Free Services**: Supabase (DB), Nodemailer + Gmail (email), YouTube (videos), Google Drive (files), PDFKit (cert generation)
