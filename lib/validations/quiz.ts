/**
 * Quiz validation schemas
 * Used for: submit quiz
 */

import { z } from "zod";

// Submit quiz validation
export const submitQuizSchema = z.object({
  quizId: z.string().uuid("Invalid quiz ID"),
  answers: z.record(z.string(), z.number({ invalid_type_error: "Answers must be option indices" })),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
