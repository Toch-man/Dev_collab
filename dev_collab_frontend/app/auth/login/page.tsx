"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

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

const Login = () => {
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const [loading, set_loading] = useState(false);
  const [message, set_message] = useState("");
  const [login_status, set_login_status] = useState<Boolean>();
  const router = useRouter();

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
      localStorage.setItem("access_token", data.access_token);

      router.push("/dashboard");
    } catch (err: any) {
      set_message(err.message);
    } finally {
      set_loading(false);
    }
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
          <p
            className={`text-base ${login_status ? "text-green" : "text-red"}`}
          >
            {message}
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Log in to your account to continue
          </p>

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
                  className="text-xs text-green-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => set_password(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200"
              />
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
              onClick={() => router.push("auth//sign_up")}
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
