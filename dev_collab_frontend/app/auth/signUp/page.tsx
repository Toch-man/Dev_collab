"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sign_up } from "@/lib/api";
import Link from "next/link";

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

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    className="w-3 h-3"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

type FormState = {
  full_name: string;
  username: string;
  email: string;
  password: string;
  niche: string;
  bio: string;
  skills: string[];
};

const SignUp = () => {
  const [form, set_form] = useState<FormState>({
    full_name: "",
    username: "",
    email: "",
    password: "",
    niche: "",
    bio: "",
    skills: [],
  });
  const [skill_input, set_skill_input] = useState("");
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState("");
  const router = useRouter();

  const handle_change = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    set_error("");
    set_form({ ...form, [e.target.name]: e.target.value });
  };

  const add_skill = () => {
    const trimmed = skill_input.trim().replace(/,$/, "");
    if (!trimmed || form.skills.includes(trimmed)) {
      set_skill_input("");
      return;
    }
    set_form({ ...form, skills: [...form.skills, trimmed] });
    set_skill_input("");
  };

  // user presses Enter or comma to add a skill tag
  const handle_skill_keydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add_skill();
    }
  };

  const remove_skill = (skill: string) => {
    set_form({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    set_loading(true);
    set_error("");
    try {
      const data = await sign_up(form);

      if (data.success) {
        router.push("/dashboard");
      } else {
        set_error(data.message);
      }
    } catch {
      set_error("Something went wrong. Please try again.");
    } finally {
      set_loading(false);
    }
  };

  const handle_google = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  const text_fields: {
    id: keyof FormState;
    label: string;
    type: string;
    placeholder: string;
  }[] = [
    {
      id: "full_name",
      label: "Full name",
      type: "text",
      placeholder: "Tochukwu Okeakpu",
    },
    {
      id: "username",
      label: "Username",
      type: "text",
      placeholder: "tochukwu",
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "you@example.com",
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "••••••••",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition-colors duration-200 w-fit"
        >
          <ArrowLeft /> Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
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
            Create an account
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Join thousands of developers already building together
          </p>

          <button
            type="button"
            onClick={handle_google}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 bg-white py-3 rounded-xl text-sm font-semibold text-gray-700 transition-colors duration-200 mb-5"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>

          <form onSubmit={handle_submit} className="flex flex-col gap-4">
            {text_fields.map(({ id, label, type, placeholder }) => (
              <div key={id} className="flex flex-col gap-1.5">
                <label
                  htmlFor={id}
                  className="text-sm font-semibold text-gray-700"
                >
                  {label}
                </label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  required
                  placeholder={placeholder}
                  value={form[id] as string}
                  onChange={handle_change}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200"
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="niche"
                className="text-sm font-semibold text-gray-700"
              >
                Your niche
              </label>
              <input
                id="niche"
                name="niche"
                required
                value={form.niche}
                onChange={handle_change}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200 bg-white text-gray-700"
              ></input>
            </div>

            {/* skills tag input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="skills"
                className="text-sm font-semibold text-gray-700"
              >
                Skills{" "}
              </label>

              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1 rounded-full"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => remove_skill(skill)}
                        className="hover:text-green-900 transition-colors"
                      >
                        <XIcon />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                id="skills"
                placeholder="e.g. React, Node.js, Python"
                value={skill_input}
                onChange={(e) => set_skill_input(e.target.value)}
                onKeyDown={handle_skill_keydown}
                onBlur={add_skill}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200"
              />
              <p className="text-xs text-gray-400">
                Press Enter or comma after each skill
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="bio"
                className="text-sm font-semibold text-gray-700"
              >
                Bio{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder="Tell the community a bit about yourself..."
                value={form.bio}
                onChange={handle_change}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors duration-200 mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-green-700 font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
