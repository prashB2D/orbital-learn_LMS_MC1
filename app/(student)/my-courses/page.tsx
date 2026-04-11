/**
 * My Courses Page
 * Shows enrolled courses with progress bars
 */

export default function MyCoursesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-gray-600">Continue your learning journey</p>
      </div>

      {/* TODO: Fetch from GET /api/dashboard/my-courses */}
      {/* TODO: Display courses with progress */}

      <div className="grid md:grid-cols-2 gap-6">
        {/* TODO: CourseCard components with:
            - Thumbnail
            - Title
            - Progress bar
            - "Continue Learning" button
            - Course completion status
        */}
      </div>
    </div>
  );
}
