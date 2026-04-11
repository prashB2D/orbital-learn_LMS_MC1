/**
 * GET /api/dashboard/my-courses
 * Purpose: Get courses for student dashboard
 * Input: None (uses session)
 * Output: {courses: [{id, title, thumbnail, progressPercentage, certificateUrl, lastAccessedContentId}]}
 * Auth Required: Yes
 */

export async function GET(request: Request) {
  try {
    // TODO: Get my-courses logic
    // 1. Check session
    // 2. Fetch all enrollments for user
    // 3. For each enrollment:
    //    - Calculate progress %
    //    - Get certificateUrl (if exists)
    //    - Get last accessed content
    // 4. Return courses array with details

    return Response.json({ error: "Not implemented yet" }, { status: 501 });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
