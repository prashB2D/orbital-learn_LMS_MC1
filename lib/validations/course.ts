/**
 * Course validation schemas
 * Used for: create course, update course
 */

import { z } from "zod";

// Create course validation
export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price cannot be negative"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
});

// Update course validation
export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
