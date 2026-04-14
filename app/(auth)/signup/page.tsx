"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [step, setStep] = useState<"DETAILS" | "OTP">("DETAILS");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password validation regex map
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!isPasswordStrong) {
      setError("Please ensure your password meets all security requirements.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setStep("OTP");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email: email.toLowerCase().trim(), 
          password, 
          otp 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Account created!</h2>
        <p className="text-gray-600">Your email has been verified successfully.</p>
        <Link href="/login" className="inline-block mt-4 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black transition font-semibold">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-gray-600 mt-2">Join Horbiteal Study today</p>
      </div>

      <form onSubmit={step === "DETAILS" ? handleSendOTP : handleSignup} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm font-semibold">
            {error}
          </div>
        )}

        {step === "DETAILS" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-semibold mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter your full name" required />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" required />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter your password" required />
              
              {/* Password Strength Indicators */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-medium">
                <span className={pVals.length ? "text-green-600" : "text-gray-400"}>{pVals.length ? "✓" : "○"} Min 8 chars</span>
                <span className={pVals.upper ? "text-green-600" : "text-gray-400"}>{pVals.upper ? "✓" : "○"} 1 Uppercase</span>
                <span className={pVals.lower ? "text-green-600" : "text-gray-400"}>{pVals.lower ? "✓" : "○"} 1 Lowercase</span>
                <span className={pVals.number ? "text-green-600" : "text-gray-400"}>{pVals.number ? "✓" : "○"} 1 Number</span>
                <span className={pVals.special ? "text-green-600" : "text-gray-400"}>{pVals.special ? "✓" : "○"} 1 Special Char</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Confirm your password" required />
            </div>

            <button type="submit" disabled={loading || !isPasswordStrong} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition flex justify-center items-center gap-2">
              {loading ? "Sending..." : "Continue & Verify Email"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === "OTP" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
             <div className="bg-blue-50 text-blue-800 p-4 rounded-lg font-medium text-sm mb-6 border border-blue-100">
               We sent a 6-digit code to <strong>{email}</strong>
             </div>
             
             <div>
              <label className="block text-sm font-bold mb-2">Enter Verification Code</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} maxLength={6} className="w-full px-4 py-4 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono" placeholder="000000" required autoFocus />
            </div>

            <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>
            <button type="button" onClick={() => setStep("DETAILS")} className="text-sm font-semibold text-gray-500 hover:text-gray-800 mt-4 underline">
               Change Email Address
            </button>
          </div>
        )}
      </form>

      <div className="text-center text-sm flex flex-col gap-3 pt-4 border-t">
        <div>
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Login
          </Link>
        </div>
        <div>
          <Link href="/" className="text-gray-500 font-semibold hover:text-gray-700 underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
