# API ENDPOINTS REFERENCE

## Authentication APIs

### POST /api/auth/signup
**Purpose**: Register new student  
**Input**: `{name, email, password}`  
**Output**: `{success, userId}` + welcome email  
**Auth Required**: No

### POST /api/auth/signIn
**Purpose**: Login with email + password  
**Input**: `{email, password}`  
**Output**: JWT in HTTP-only cookie + `{user: {...}}`  
**Auth Required**: No

### POST /api/auth/signOut
**Purpose**: Logout  
**Input**: None  
**Output**: Clear cookie  
**Auth Required**: Yes

### GET /api/auth/session
**Purpose**: Get current session  
**Input**: Cookie  
**Output**: `{user: {...}}` or null  
**Auth Required**: No

### POST /api/auth/forgot-password
**Purpose**: Request password reset  
**Input**: `{email}`  
**Output**: `{success, message}` + email with reset link  
**Auth Required**: No

### POST /api/auth/reset-password
**Purpose**: Reset password with token  
**Input**: `{token, newPassword}`  
**Output**: `{success, message}`  
**Auth Required**: No

---

## Course APIs (Student)

### GET /api/courses
**Purpose**: List all courses (landing page + browse)  
**Input**: Query params: `featured=true` (optional)  
**Output**: `{courses: [{id, title, description, price, thumbnail, slug}]}`  
**Auth Required**: No

### GET /api/courses/[courseId]
**Purpose**: Get single course details  
**Input**: URL param: courseId  
**Output**: `{id, title, description, price, thumbnail, slug, isEnrolled}`  
**Auth Required**: No (but isEnrolled requires session)

### GET /api/courses/[courseId]/content
**Purpose**: Get all contents of a course (lessons + quizzes)  
**Input**: URL param: courseId, Query: enrollmentId  
**Output**: `{contents: [{id, type, title, videoId, duration, attachments, completed, order}]}`  
**Auth Required**: Yes (must verify enrollment)

---

## Course APIs (Admin)

### POST /api/courses
**Purpose**: Create new course  
**Input**: `{title, description, price, thumbnail}`  
**Output**: `{success, courseId, slug}`  
**Auth Required**: Yes (admin only)

### PUT /api/courses/[courseId]
**Purpose**: Update course details  
**Input**: Course fields to update  
**Output**: `{success, courseId}`  
**Auth Required**: Yes (admin only)

---

## Content APIs (Lessons)

### POST /api/content/lesson
**Purpose**: Add lesson to course  
**Input**: `{courseId, title, videoId, duration, attachments[], order}`  
**Output**: `{success, contentId}`  
**Auth Required**: Yes (admin only)

### GET /api/content/[contentId]
**Purpose**: Get lesson details (videos + attachments)  
**Input**: URL param: contentId, Query: enrollmentId  
**Output**: `{id, title, videoId, duration, attachments[], order}`  
**Auth Required**: Yes (verify enrollment)

### POST /api/content/[contentId]/complete
**Purpose**: Mark lesson as complete  
**Input**: `{enrollmentId, contentId}`  
**Output**: `{success, progressPercentage}`  
**Auth Required**: Yes

---

## Content APIs (Quizzes)

### POST /api/content/quiz
**Purpose**: Create quiz (with questions)  
**Input**: `{courseId, title, order, questions: [{questionText, options[], correctAnswer}]}`  
**Output**: `{success, quizId}`  
**Auth Required**: Yes (admin only)

### GET /api/content/[quizId]/questions
**Purpose**: Get quiz questions (student view - answers hidden)  
**Input**: URL param: quizId  
**Output**: `{questions: [{id, questionText, options[], order}]}`  
**Auth Required**: Yes (verify enrollment)

---

## Quiz APIs (Student)

### POST /api/quiz/submit
**Purpose**: Submit quiz attempt  
**Input**: `{quizId, userId, answers: {questionId: selectedOptionIndex}}`  
**Output**: `{success, score, attemptNumber, rank, totalAttempts}`  
**Auth Required**: Yes

### GET /api/quiz/attempts/[quizId]
**Purpose**: Get all attempts by current user for a quiz  
**Input**: URL param: quizId  
**Output**: `{attempts: [{attemptNumber, score, createdAt}], bestScore}`  
**Auth Required**: Yes

### GET /api/quiz/leaderboard/[quizId]
**Purpose**: Get ranking for a quiz  
**Input**: URL param: quizId  
**Output**: `{leaderboard: [{rank, userId, userName, bestScore}], yourRank, yourBestScore}`  
**Auth Required**: Yes

---

## Enrollment APIs

### POST /api/courses/[courseId]/enroll
**Purpose**: Create enrollment after successful payment  
**Input**: `{userId, courseId}`  
**Output**: `{success, enrollmentId}`  
**Auth Required**: Yes (backend verification required)

### GET /api/enrollments
**Purpose**: Get student's all enrollments  
**Input**: None (uses session userId)  
**Output**: `{enrollments: [{courseId, title, thumbnail, progressPercentage, certificateUrl}]}`  
**Auth Required**: Yes

---

## Payment APIs

### POST /api/payment/create-order
**Purpose**: Create Razorpay order  
**Input**: `{courseId, amount}`  
**Output**: `{orderId, amount, currency, key}`  
**Auth Required**: Yes

### POST /api/payment/verify
**Purpose**: Verify payment signature + create enrollment  
**Input**: `{orderId, paymentId, signature, courseId}`  
**Output**: `{success, enrollmentId}`  
**Auth Required**: Yes

### POST /api/payment/webhook
**Purpose**: Razorpay webhook for async payment updates  
**Input**: Razorpay webhook payload  
**Output**: Status 200  
**Auth Required**: No (signature verified by Razorpay)

### GET /api/payments
**Purpose**: Get payment history (student view)  
**Input**: None  
**Output**: `{payments: [{courseId, courseTitle, amount, status, date}]}`  
**Auth Required**: Yes

---

## Progress APIs

### GET /api/progress/[enrollmentId]
**Purpose**: Get course progress percentage  
**Input**: URL param: enrollmentId  
**Output**: `{totalContents, completedContents, progressPercentage}`  
**Auth Required**: Yes (verify ownership)

### PUT /api/progress/[enrollmentId]
**Purpose**: Update progress (after content completion)  
**Input**: `{contentId, completed: true}`  
**Output**: `{success, progressPercentage}`  
**Auth Required**: Yes

---

## Certificate APIs

### GET /api/certificates
**Purpose**: Get student's certificates  
**Input**: None (uses session)  
**Output**: `{certificates: [{courseTitle, pdfUrl, issuedAt}]}`  
**Auth Required**: Yes

### POST /api/certificates/generate
**Purpose**: Generate certificate (triggered on 100% completion)  
**Input**: `{enrollmentId}`  
**Output**: `{success, certificateId, pdfUrl}`  
**Auth Required**: Yes (backend auto-trigger)

### GET /api/certificates/[certificateId]
**Purpose**: Download certificate PDF  
**Input**: URL param: certificateId  
**Output**: File stream (PDF)  
**Auth Required**: Yes

---

## Admin Analytics APIs

### GET /api/admin/analytics/sales
**Purpose**: Get sales analytics  
**Input**: Query: `{startDate?, endDate?}` (optional filters)  
**Output**: `{totalRevenue, totalTransactions, revenuePerCourse: [{courseTitle, revenue}]}`  
**Auth Required**: Yes (admin only)

### GET /api/admin/analytics/courses
**Purpose**: Get course analytics  
**Input**: None  
**Output**: `{totalStudents, bestSellingCourse, coursesWithEnrollments: [{title, enrollments, revenue}]}`  
**Auth Required**: Yes (admin only)

### GET /api/admin/analytics/quizzes
**Purpose**: Get quiz analytics  
**Input**: None  
**Output**: `{quizzes: [{quizTitle, topPerformers: [{userName, score}], averageScore, totalAttempts}]}`  
**Auth Required**: Yes (admin only)

---

## Admin Users APIs

### GET /api/admin/users
**Purpose**: List all users  
**Input**: Query: `{page, search}`  
**Output**: `{users: [{id, name, email, role, createdAt, totalSpent, coursesEnrolled}], totalPages, currentPage, totalUsers}`  
**Auth Required**: Yes (admin only)

### GET /api/admin/users/[userId]
**Purpose**: Get single user details  
**Input**: URL param: userId  
**Output**: `{id, name, email, enrollments: [{courseTitle, enrolledAt, progress, paymentAmount, status}], totalSpent}`  
**Auth Required**: Yes (admin only)

---

## Admin Transactions APIs

### GET /api/admin/transactions
**Purpose**: List all payments  
**Input**: Query: `{page, status?, search?}`  
**Output**: `{transactions: [{id, razorpayOrderId, razorpayPaymentId, amount, status, createdAt, user: {}, course: {}}], summary: {totalRevenue, totalTransactions}, totalPages}`  
**Auth Required**: Yes (admin only)

---

## Dashboard APIs

### GET /api/dashboard/my-courses
**Purpose**: Get courses for student dashboard  
**Input**: None (uses session)  
**Output**: `{courses: [{id, title, thumbnail, progressPercentage, certificateUrl, lastAccessedContentId}]}`  
**Auth Required**: Yes

### GET /api/dashboard/quiz-performance
**Purpose**: Get quiz performance for student dashboard  
**Input**: None (uses session)  
**Output**: `{quizzes: [{quizId, quizTitle, bestScore, yourRank, totalAttempts, attempts: [{attemptNumber, score, date}]}]}`  
**Auth Required**: Yes

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed",
  "data": {...}
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Pagination Response
```json
{
  "data": [...],
  "totalPages": 5,
  "currentPage": 1,
  "totalItems": 50
}
```
version 8 15/4/26