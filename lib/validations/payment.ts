/**
 * Payment validation schemas
 * Used for: create order, verify payment
 */

import { z } from "zod";

// Create order validation
export const createOrderSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  amount: z.number().positive("Amount must be positive"),
});

// Verify payment validation
export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentId: z.string().min(1, "Payment ID is required"),
  signature: z.string().min(1, "Signature is required"),
  courseId: z.string().uuid("Invalid course ID"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
