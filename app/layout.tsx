/**
 * Root Layout
 * Global layout wrapper for entire app
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Horbiteal Study - Online Learning Platform",
  description: "Learn from expert-created courses with video lessons and quizzes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased text-gray-900 bg-gray-50 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
