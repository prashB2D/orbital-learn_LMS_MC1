/**
 * POST /api/payment/webhook
 * Purpose: Razorpay webhook for async payment updates
 * Input: Razorpay webhook payload
 * Output: Status 200
 * Auth Required: No (signature verified by Razorpay)
 */

export async function POST(request: Request) {
  try {
    // TODO: Webhook logic
    // 1. Verify webhook signature from Razorpay headers
    // 2. Extract event + data
    // 3. If event = payment.authorized/captured:
    //    - Find payment by orderId
    //    - Update status = SUCCESS
    //    - Create enrollment
    // 4. Return status 200

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
