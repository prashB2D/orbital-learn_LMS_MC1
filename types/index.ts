/**
 * TypeScript types for the application
 */

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "ADMIN";
  createdAt: Date;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  slug: string;
  createdAt: Date;
}

// Content types
export interface Lesson {
  id: string;
  courseId: string;
  type: "LESSON";
  title: string;
  order: number;
  videoId: string;
  duration: number;
  attachments: string[];
}

export interface Quiz {
  id: string;
  courseId: string;
  type: "QUIZ";
  title: string;
  order: number;
  questions: Question[];
}

export interface Question {
  id: string;
  contentId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  order: number;
}

// Enrollment types
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  createdAt: Date;
}

// Progress types
export interface Progress {
  id: string;
  enrollmentId: string;
  contentId: string;
  completed: boolean;
  completedAt?: Date;
}

// Quiz Attempt types
export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  attemptNumber: number;
  answers: Record<string, number>;
  score: number;
  createdAt: Date;
}

// Payment types
export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: Date;
}

// Certificate types
export interface Certificate {
  id: string;
  enrollmentId: string;
  pdfUrl: string;
  issuedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}
