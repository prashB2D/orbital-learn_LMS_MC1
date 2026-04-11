# DATABASE SCHEMA (PRISMA)

## Collections Overview
- **Users** → Store accounts
- **Courses** → Store course metadata
- **Content** → Store lessons + quizzes
- **Questions** → Store MCQ questions (nested in Content)
- **Enrollments** → Track who bought which course
- **Progress** → Track lesson/quiz completion per student
- **QuizAttempts** → Store multiple quiz attempts per student
- **Payments** → Track all transactions
- **Certificates** → Store generated PDFs

---

## Full Schema

```prisma
// ============== ENUMS ==============

enum UserRole {
  STUDENT
  ADMIN
}

enum ContentType {
  LESSON
  QUIZ
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}

// ============== MODELS ==============

// Users
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  role          UserRole @default(STUDENT)

  // Relations
  enrollments   Enrollment[]
  quizAttempts  QuizAttempt[]
  payments      Payment[]

  // Reset password
  resetToken    String?
  resetTokenExpiry DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Courses
model Course {
  id            String   @id @default(uuid())
  title         String
  description   String
  price         Float
  thumbnail     String
  slug          String   @unique

  // Relations
  contents      Content[]
  enrollments   Enrollment[]
  payments      Payment[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Contents (Lessons & Quizzes)
model Content {
  id            String      @id @default(uuid())
  courseId      String
  course        Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)

  type          ContentType  // LESSON or QUIZ
  title         String
  order         Int

  // Lesson-specific fields
  videoId       String?     // YouTube videoId (e.g., "dQw4w9WgXcQ")
  duration      Int?        // in seconds
  attachments   String[]    // Google Drive links as JSON array

  // Relations
  questions     Question[]  // MCQ questions (only for QUIZ type)
  progress      Progress[]
  quizAttempts  QuizAttempt[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Questions (MCQ for Quizzes only)
model Question {
  id              String   @id @default(uuid())
  contentId       String
  content         Content  @relation(fields: [contentId], references: [id], onDelete: Cascade)

  questionText    String
  options         String[] // ["Option 1", "Option 2", ...]
  correctAnswer   Int      // Index of correct option
  order           Int

  createdAt       DateTime @default(now())
}

// Enrollments (Student purchases course)
model Enrollment {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  courseId      String
  course        Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  // Relations
  progress      Progress[]
  certificate   Certificate?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([userId, courseId]) // One enrollment per student per course
}

// Progress (Track lesson/quiz completion)
model Progress {
  id              String      @id @default(uuid())
  enrollmentId    String
  enrollment      Enrollment  @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)

  contentId       String
  content         Content     @relation(fields: [contentId], references: [id], onDelete: Cascade)

  completed       Boolean     @default(false)
  completedAt     DateTime?   // When marked complete

  createdAt       DateTime @default(now())

  @@unique([enrollmentId, contentId]) // One progress record per content per enrollment
}

// Quiz Attempts (Multiple attempts per student)
model QuizAttempt {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  quizId        String
  quiz          Content  @relation(fields: [quizId], references: [id], onDelete: Cascade)

  attemptNumber Int      // 1, 2, 3, etc.
  answers       Json     // {questionId: selectedOptionIndex}
  score         Float    // Percentage (0-100)

  createdAt     DateTime @default(now())
}

// Payments (All transactions)
model Payment {
  id                  String        @id @default(uuid())
  userId              String
  user                User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  courseId            String
  course              Course        @relation(fields: [courseId], references: [id], onDelete: Cascade)

  amount              Float
  razorpayOrderId     String        @unique
  razorpayPaymentId   String?       @unique

  status              PaymentStatus @default(PENDING)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// Certificates (PDF generated on 100% completion)
model Certificate {
  id            String     @id @default(uuid())
  enrollmentId  String     @unique
  enrollment    Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)

  pdfUrl        String     // Path to PDF in public/certificates/
  issuedAt      DateTime   @default(now())
}
```

---

## Key Relationships

### User → Enrollment → Course
```
User 1 ──→ Many Enrollments
         └─→ Each points to 1 Course
```

### Course → Content → Question
```
Course 1 ──→ Many Contents (Lessons or Quizzes)
         └─→ Each Quiz 1 ──→ Many Questions
```

### User → QuizAttempt → Content
```
User 1 ──→ Many QuizAttempts
       └─→ Each points to 1 Content (quiz)
```

### Enrollment → Progress → Content
```
Enrollment 1 ──→ Many Progress records
            └─→ Each tracks 1 Content (lesson or quiz)
```

---

## Query Examples (for building APIs)

### Get all courses
```typescript
const courses = await prisma.course.findMany({
  select: {id: true, title: true, description: true, price: true, thumbnail: true, slug: true}
});
```

### Get course contents (with progress)
```typescript
const contents = await prisma.content.findMany({
  where: {courseId},
  include: {
    questions: order, // For quizzes
    progress: {
      where: {enrollmentId},
      select: {completed: true}
    }
  },
  orderBy: {order: 'asc'}
});
```

### Get all quiz attempts by user
```typescript
const attempts = await prisma.quizAttempt.findMany({
  where: {userId},
  include: {quiz: {select: {title: true, courseId: true}}},
  orderBy: {createdAt: 'desc'}
});
```

### Calculate course progress
```typescript
const enrollment = await prisma.enrollment.findUnique({
  where: {id: enrollmentId},
  include: {
    course: {
      include: {
        contents: {
          include: {
            progress: {
              where: {enrollmentId},
              select: {completed: true}
            }
          }
        }
      }
    }
  }
});

const total = enrollment.course.contents.length;
const completed = enrollment.course.contents.filter(
  c => c.progress.length > 0 && c.progress[0].completed
).length;
const percentage = (completed / total) * 100;
```

### Get leaderboard for quiz
```typescript
const allAttempts = await prisma.quizAttempt.findMany({
  where: {quizId},
  include: {user: {select: {id: true, name: true}}}
});

// Group by user, get best score
const bestScoresMap = {};
allAttempts.forEach(a => {
  if (!bestScoresMap[a.userId] || a.score > bestScoresMap[a.userId].score) {
    bestScoresMap[a.userId] = {
      userId: a.userId,
      name: a.user.name,
      bestScore: a.score
    };
  }
});

// Sort and rank
const leaderboard = Object.values(bestScoresMap)
  .sort((a, b) => b.bestScore - a.bestScore)
  .map((entry, index) => ({rank: index + 1, ...entry}));
```
