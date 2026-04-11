/**
 * GET /api/content/[contentId]
 * Purpose: Get lesson/quiz details with questions (for students)
 * Input: URL param: contentId
 * Output: {id, title, type, videoId, duration, attachments[], questions[] (if quiz, answers hidden)}
 * Auth Required: Yes (verify enrollment)
 */

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: GET content logic
    // 1. Get contentId from params
    // 2. Check session
    // 3. Verify enrollment in the course
    // 4. Fetch content + questions
    // 5. If quiz: hide correct answers before returning
    // 6. Return content details

    return Response.json({ error: "Not implemented yet" }, { status: 501 });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
