"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, set_email] = useState("");
  const [loading, set_loading] = useState(false);
  const [sent, set_sent] = useState(false);
  const [error, set_error] = useState("");

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    set_loading(true);
    set_error("");
    try {
      const res = await fetch(`${API}/api/auth/forgot_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        set_sent(true);
      } else {
        set_error(data.message || "Something went wrong");
      }
    } catch {
      set_error("Network error. Please try again.");
    } finally {
      set_loading(false);
    }
  };

  // Email sent confirmation screen
  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-green-600"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 9.81a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            Check your email
          </h1>
          <p className="text-gray-500 text-sm mb-2">
            We sent a password reset link to
          </p>
          <p className="text-green-700 font-semibold text-sm mb-6">{email}</p>
          <p className="text-gray-400 text-xs mb-8">
            Didn't receive it? Check your spam folder. The link expires in 30
            minutes.
          </p>
          <button
            onClick={() => {
              set_sent(false);
              set_email("");
            }}
            className="text-sm text-green-700 hover:underline font-medium"
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  // Forgot password form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6">
        <button
          onClick={() => router.push("/auth/login")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to login
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-black flex items-center justify-center rounded-lg">
              <span className="text-white font-extrabold text-xl">D</span>
            </div>
            <span className="font-extrabold text-xl text-gray-900">
              Dev_collab
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            Forgot password?
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter your email and we'll send you a reset link.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handle_submit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => set_email(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Remembered it?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-green-700 font-semibold hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
