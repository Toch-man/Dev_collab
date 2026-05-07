"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const ArrowLeft = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Login = () => {
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const [loading, set_loading] = useState(false);
  const [message, set_message] = useState("");
  const [show_pw, set_show_pw] = useState(false);
  const [login_status, set_login_status] = useState<Boolean>();
  const router = useRouter();
  const { log_in } = useAuth();

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    set_loading(true);
    try {
      const data = await login(email, password);
      if (!data.success) {
        set_login_status(false);
        set_message(data.message);
        return;
      }
      set_login_status(true);
      set_message(data.message);
      log_in(data.user, data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      set_login_status(false);
      if (err.message === "Failed to fetch") {
        set_message("Network error. Please check your connection.");
      } else {
        set_message(err.message);
      }
    } finally {
      set_loading(false);
    }
  };

  const handle_google = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition-colors duration-200"
        >
          <ArrowLeft />
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

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            Welcome back
          </h1>

          {message && (
            <p
              className={`text-base ${
                login_status ? "text-green-600" : "text-red-500"
              } mb-3`}
            >
              {message}
            </p>
          )}

          <p className="text-gray-500 text-sm mb-8">
            Log in to your account to continue
          </p>

          {/* Google login */}
          <button
            type="button"
            onClick={handle_google}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 bg-white py-3 rounded-xl text-sm font-semibold text-gray-700 transition-colors duration-200 mb-5"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or log in with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handle_submit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => set_email(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/auth/forgot_password")}
                  className="text-xs text-green-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={show_pw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => set_password(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => set_show_pw(!show_pw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1"
                >
                  {show_pw ? (
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors duration-200 mt-2"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => router.push("/auth/sign_up")}
              className="text-green-700 font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
