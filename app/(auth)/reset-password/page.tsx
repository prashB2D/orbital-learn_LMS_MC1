"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordVisibilityTimer = useRef<NodeJS.Timeout | null>(null);
  const confirmPasswordVisibilityTimer = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (pass: string) => {
    return {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass),
    };
  };

  const pVals = validatePassword(password);
  const isPasswordStrong = pVals.length && pVals.upper && pVals.lower && pVals.number && pVals.special;

  const handleTogglePassword = () => {
    setShowPassword((current) => {
      const next = !current;
      if (passwordVisibilityTimer.current) {
        clearTimeout(passwordVisibilityTimer.current);
      }
      if (next) {
        passwordVisibilityTimer.current = setTimeout(() => {
          setShowPassword(false);
        }, 1100);
      }
      return next;
    });
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((current) => {
      const next = !current;
      if (confirmPasswordVisibilityTimer.current) {
        clearTimeout(confirmPasswordVisibilityTimer.current);
      }
      if (next) {
        confirmPasswordVisibilityTimer.current = setTimeout(() => {
          setShowConfirmPassword(false);
        }, 1100);
      }
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (passwordVisibilityTimer.current) {
        clearTimeout(passwordVisibilityTimer.current);
      }
      if (confirmPasswordVisibilityTimer.current) {
        clearTimeout(confirmPasswordVisibilityTimer.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isPasswordStrong) {
      setError("Please ensure your password meets all security requirements.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-600 text-4xl">✓</div>
        <h2 className="text-xl font-bold">Password Reset Successful!</h2>
        <p className="text-gray-600">
          Your password has been changed. Redirecting to login...
        </p>
        <Link href="/login" className="text-blue-600 hover:underline inline-block mt-4">
          Click here if you aren't redirected
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="text-red-500 text-4xl">!</div>
        <h2 className="text-xl font-bold">Invalid Reset Link</h2>
        <p className="text-gray-600">The password reset link is missing a valid token.</p>
        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Set New Password</h1>
        <p className="text-gray-600 mt-2">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pr-12 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={handleTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-medium">
            <span className={pVals.length ? "text-green-600" : "text-gray-400"}>{pVals.length ? "✓" : "○"} Min 8 chars</span>
            <span className={pVals.upper ? "text-green-600" : "text-gray-400"}>{pVals.upper ? "✓" : "○"} 1 Uppercase</span>
            <span className={pVals.lower ? "text-green-600" : "text-gray-400"}>{pVals.lower ? "✓" : "○"} 1 Lowercase</span>
            <span className={pVals.number ? "text-green-600" : "text-gray-400"}>{pVals.number ? "✓" : "○"} 1 Number</span>
            <span className={pVals.special ? "text-green-600" : "text-gray-400"}>{pVals.special ? "✓" : "○"} 1 Special Char</span>
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium mb-2">Confirm New Password</label>
           <div className="relative">
             <input
               type={showConfirmPassword ? "text" : "password"}
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               className={`w-full pr-12 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
               placeholder="••••••••"
               required
             />
             <button
               type="button"
               onClick={handleToggleConfirmPassword}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
               aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
             >
               {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
             </button>
           </div>
           {confirmPassword && password !== confirmPassword && (
             <p className="text-red-500 text-xs mt-1 font-medium">Passwords do not match</p>
           )}
        </div>

        <button
          type="submit"
          disabled={loading || !isPasswordStrong || password !== confirmPassword}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
