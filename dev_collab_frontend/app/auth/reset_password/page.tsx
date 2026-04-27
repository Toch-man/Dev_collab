"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordPage() {
  const router = useRouter();
  const search_params = useSearchParams();

  const token = search_params.get("token") || "";
  const email = search_params.get("email") || "";

  const [password, set_password] = useState("");
  const [confirm, set_confirm] = useState("");
  const [show_password, set_show_password] = useState(false);
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState("");
  const [success, set_success] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      set_error("Invalid or missing reset link. Please request a new one.");
    }
  }, [token, email]);

  const password_strength = (pwd: string) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6)
      return { label: "Too short", color: "bg-red-400", width: "w-1/4" };
    if (pwd.length < 8)
      return { label: "Weak", color: "bg-orange-400", width: "w-2/4" };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
      return { label: "Medium", color: "bg-yellow-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const strength = password_strength(password);

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      set_error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      set_error("Password must be at least 6 characters");
      return;
    }

    set_loading(true);
    set_error("");
    try {
      const res = await fetch(`${API}/api/auth/reset_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, new_password: password }),
      });
      const data = await res.json();
      if (data.success) {
        set_success(true);
      } else {
        set_error(data.message || "Something went wrong");
      }
    } catch {
      set_error("Network error. Please try again.");
    } finally {
      set_loading(false);
    }
  };

  //  Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-green-600"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            Password reset!
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Your password has been updated successfully. You can now log in with
            your new password.
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  //  Reset form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6">
        <button
          onClick={() => router.push("/auth/forgot_password")}
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
          Back
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
            Set new password
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Must be at least 6 characters. Use uppercase and numbers for a
            stronger password.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
              {error.includes("Invalid") && (
                <button
                  onClick={() => router.push("/auth/forgot_password")}
                  className="block mt-2 text-red-700 font-semibold hover:underline text-xs"
                >
                  Request a new link →
                </button>
              )}
            </div>
          )}

          <form onSubmit={handle_submit} className="flex flex-col gap-5">
            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show_password ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    set_password(e.target.value);
                    set_error("");
                  }}
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => set_show_password(!show_password)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1"
                >
                  {show_password ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Strength bar */}
              {strength && (
                <div className="mt-1.5">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                    />
                  </div>
                  <p
                    className={`text-xs mt-1 font-medium
                    ${
                      strength.label === "Strong"
                        ? "text-green-600"
                        : strength.label === "Medium"
                        ? "text-yellow-600"
                        : "text-red-500"
                    }`}
                  >
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm"
                className="text-sm font-semibold text-gray-700"
              >
                Confirm password
              </label>
              <input
                id="confirm"
                type={show_password ? "text" : "password"}
                required
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => {
                  set_confirm(e.target.value);
                  set_error("");
                }}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm transition-colors
                  ${
                    confirm && confirm !== password
                      ? "border-red-300 focus:border-red-400"
                      : confirm && confirm === password
                      ? "border-green-400 focus:border-green-500"
                      : "border-gray-200 focus:border-green-700"
                  }`}
              />
              {confirm && confirm !== password && (
                <p className="text-xs text-red-500">Passwords don't match</p>
              )}
              {confirm && confirm === password && (
                <p className="text-xs text-green-600">✓ Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token || !email}
              className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
