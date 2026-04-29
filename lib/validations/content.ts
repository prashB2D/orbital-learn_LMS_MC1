/**
 * Content validation schemas
 * Used for: add lesson, add quiz
 */

import { z } from "zod";

// Add lesson validation
export const addLessonSchema = z.object({
  courseId: z.string(),
  moduleId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  videoId: z.string().min(1, "Video ID is required"),
  duration: z.number().int().positive("Duration must be positive"),
  attachments: z.array(z.string()).optional(),
  order: z.number().int().positive("Order must be positive"),
  skill: z.string().optional(),
  xpReward: z.number().int().min(0).default(0),
  isFreeTrial: z.boolean().default(false),
});

// Add quiz validation
export const addQuizSchema = z.object({
  courseId: z.string(),
  moduleId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  order: z.number().int().positive("Order must be positive"),
  questions: z.array(
    z.object({
      questionText: z.string().min(1, "Question is required"),
      options: z.array(z.string()).min(2, "At least 2 options required"),
      optionType: z.enum(["2_options", "4_options"]).default("4_options"),
      correctAnswer: z.number().int().min(0),
      order: z.number().int().positive(),
    })
  ),
});

export type AddLessonInput = z.infer<typeof addLessonSchema>;
export type AddQuizInput = z.infer<typeof addQuizSchema>;
