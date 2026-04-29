/**
 * Landing Page
 * Homepage with hero section, featured courses, and footer
 * File: app/page.tsx
 */

import Link from "next/link";
import { CourseCard } from "@/app/components/CourseCard";

interface Course {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  offerPercent: number | null;
  finalPrice: number;
  thumbnail: string;
  slug: string;
  hasFreeTrialContent?: boolean;
}

async function getFeaturedCourses() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/courses?featured=true`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error("Failed to fetch courses");
    const data = await response.json();
    return data.courses || [];
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    return [];
  }
}

export default async function HomePage() {
  const courses = await getFeaturedCourses();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Master Expert-Created Courses
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-blue-100">
            Learn from industry experts through high-quality video lessons, interactive quizzes, and comprehensive notes. Earn certificates on completion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#featured-courses"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Courses
            </Link>
            <Link
              href="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="featured-courses" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Featured Courses
            </h2>
            <p className="text-lg text-gray-600">
              Start learning with our most popular courses
            </p>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: Course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Courses Coming Soon
              </h3>
              <p className="text-gray-600">
                Exciting courses are being prepared. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Why Choose Horbiteal Study?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🎥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Video Lessons</h3>
              <p className="text-gray-600">
                Learn from industry experts through high-quality video content
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Quizzes</h3>
              <p className="text-gray-600">
                Test your knowledge with unlimited quiz attempts and leaderboards
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Earn Certificates</h3>
              <p className="text-gray-600">
                Get professional certificates upon 100% course completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to start learning?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Join thousands of students learning new skills on Horbiteal Study
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Horbiteal Study</h3>
              <p className="text-sm text-gray-400">
                Master expert-created courses and earn certificates
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/courses" className="hover:text-white transition-colors">Courses</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm">
              <p className="text-gray-400">© 2026 Horbiteal Study. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
                <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
