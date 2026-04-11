/**
 * GET /api/courses/[courseId]/content
 * Purpose: Get all contents of a course (lessons + quizzes)
 * Input: URL param: courseId, Query: enrollmentId
 * Output: {contents: [{id, type, title, videoId, duration, attachments, completed, order}]}
 * Auth Required: Yes (must verify enrollment)
 */

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: GET contents logic
    // 1. Get courseId from params
    // 2. Get enrollmentId from query
    // 3. Check session + verify enrollment (never trust URL)
    // 4. Fetch contents ordered by order ASC
    // 5. Include progress for each content
    // 6. Return contents array

    return Response.json({ error: "Not implemented yet" }, { status: 501 });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
