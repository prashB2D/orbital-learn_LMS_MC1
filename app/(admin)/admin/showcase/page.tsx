"use client";

import { useState, useEffect } from "react";
import { Globe, BookOpen, Users, Eye, EyeOff, Search } from "lucide-react";

interface Course {
  id: string;
  title: string;
  courseCode: string;
  description: string;
  thumbnail: string;
  showOnWebsite: boolean;
  _count: { enrollments: number };
}

export default function CourseShowcasePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses/showcase/list");
      const data = await res.json();
      if (data.success && data.courses) {
        setCourses(data.courses);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  async function toggleShowcase(courseId: string, current: boolean) {
    setToggling(courseId);
    try {
      const res = await fetch("/api/admin/courses/showcase", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, showOnWebsite: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId ? { ...c, showOnWebsite: !current } : c
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(null);
    }
  }

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.courseCode.toLowerCase().includes(search.toLowerCase())
  );

  const visibleCount = courses.filter((c) => c.showOnWebsite).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-7 h-7 text-teal-600" />
              <h1 className="text-3xl font-bold text-gray-900">Course Showcase</h1>
            </div>
            <p className="text-gray-500 font-medium">
              Control which courses appear on the public website
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center bg-teal-50 border border-teal-200 rounded-xl px-5 py-3">
              <p className="text-2xl font-black text-teal-700">{visibleCount}</p>
              <p className="text-xs text-teal-600 font-semibold">Visible on Site</p>
            </div>
            <div className="text-center bg-gray-50 border rounded-xl px-5 py-3">
              <p className="text-2xl font-black text-gray-700">{courses.length - visibleCount}</p>
              <p className="text-xs text-gray-500 font-semibold">Hidden</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <Globe className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-800">How this works</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Toggle the switch next to any course to show or hide it on the website. Changes take effect immediately. The course data (title, description, etc.) is pulled from the LMS course table.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          id="showcase-search"
          type="text"
          placeholder="Search courses by title or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none shadow-sm"
        />
      </div>

      {/* Courses Table */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed rounded-xl py-20 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-500">No courses found</h3>
          <p className="text-gray-400 mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-0 text-xs font-black text-gray-500 uppercase tracking-wider px-6 py-3 bg-gray-50 border-b">
            <span className="w-14">Thumb</span>
            <span className="pl-4">Course</span>
            <span className="text-center w-24">Students</span>
            <span className="text-center w-28">Status</span>
            <span className="text-center w-24">Show on Site</span>
          </div>

          <div className="divide-y">
            {filtered.map((course) => (
              <div
                key={course.id}
                className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-0 px-6 py-4 hover:bg-gray-50 transition"
              >
                {/* Thumbnail */}
                <div
                  className="w-14 h-10 rounded-lg bg-cover bg-center border shrink-0"
                  style={{
                    backgroundImage: course.thumbnail
                      ? `url(${course.thumbnail})`
                      : undefined,
                    backgroundColor: course.thumbnail ? undefined : "#e5e7eb",
                  }}
                />

                {/* Title + Code */}
                <div className="pl-4 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{course.title}</p>
                  <p className="text-xs text-gray-400 font-semibold">{course.courseCode}</p>
                </div>

                {/* Enrollment count */}
                <div className="w-24 text-center">
                  <span className="flex items-center justify-center gap-1 text-sm font-semibold text-gray-600">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    {course._count?.enrollments ?? 0}
                  </span>
                </div>

                {/* Status badge */}
                <div className="w-28 flex justify-center">
                  {course.showOnWebsite ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
                      <Eye className="w-3 h-3" /> Visible
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                      <EyeOff className="w-3 h-3" /> Hidden
                    </span>
                  )}
                </div>

                {/* Toggle */}
                <div className="w-24 flex justify-center">
                  <button
                    id={`showcase-toggle-${course.id}`}
                    onClick={() => toggleShowcase(course.id, course.showOnWebsite)}
                    disabled={toggling === course.id}
                    title={course.showOnWebsite ? "Click to hide" : "Click to show on website"}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50 ${
                      course.showOnWebsite ? "bg-teal-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        course.showOnWebsite ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
