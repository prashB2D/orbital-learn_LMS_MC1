/**
 * Utility functions
 * Common helpers used across the app
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Extract YouTube videoId from URL
export function extractYouTubeId(url: string): string {
  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : url;
}

// Generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

// Format currency
export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);
}

// Parse quiz answers from request
export function parseQuizAnswers(answersJson: string): Record<string, number> {
  try {
    return JSON.parse(answersJson);
  } catch {
    return {};
  }
}

// Calculate progress percentage
export function calculateProgress(
  completedItems: number,
  totalItems: number
): number {
  if (totalItems === 0) return 0;
  return Math.round((completedItems / totalItems) * 100);
}
