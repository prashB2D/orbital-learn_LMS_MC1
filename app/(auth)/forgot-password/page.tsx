/**
 * Forgot Password Page
 * Request password reset email
 */

"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // TODO: Implement forgot password logic
    // 1. Call POST /api/auth/forgot-password
    // 2. Send {email}
    // 3. On success: show success message
    // 4. On error: show error message

    try {
      console.log("Forgot password:", { email });
      setSuccess(true);
    } catch (err) {
      setError("Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-600 text-4xl">✓</div>
        <h2 className="text-xl font-bold">Check your email!</h2>
        <p className="text-gray-600">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500">Link expires in 1 hour</p>
        <Link href="/login" className="text-blue-600 hover:underline">
          Back to login →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-gray-600 mt-2">Enter your email to get a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <Link href="/login" className="text-center text-blue-600 hover:underline text-sm">
        Back to login
      </Link>
    </div>
  );
}
