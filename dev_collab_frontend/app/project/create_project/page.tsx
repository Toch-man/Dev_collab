"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { create_project } from "@/lib/api";

const BackIcon = () => (
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
  project_name: string;
  description: string;
  isPublic: boolean;
  techStack: string[];
};

export default function CreateProject() {
  const [form, set_form] = useState<FormState>({
    project_name: "",
    description: "",
    isPublic: true,
    techStack: [],
  });
  const [stack_input, set_stack_input] = useState("");
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState("");
  const router = useRouter();

  const handle_change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    set_error("");
    set_form({ ...form, [e.target.name]: e.target.value });
  };

  const add_stack = () => {
    const trimmed = stack_input.trim().replace(/,$/, "");
    if (!trimmed || form.techStack.includes(trimmed)) {
      set_stack_input("");
      return;
    }
    set_form({ ...form, techStack: [...form.techStack, trimmed] });
    set_stack_input("");
  };

  const handle_stack_keydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add_stack();
    }
  };

  const remove_stack = (item: string) => {
    set_form({ ...form, techStack: form.techStack.filter((s) => s !== item) });
  };

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.techStack.length === 0) {
      set_error("Add at least one tech stack");
      return;
    }
    set_loading(true);
    set_error("");
    try {
      const data = await create_project(form);
      if (data.success) {
        router.push(`/project/${data.project._id}`);
      } else {
        set_error(data.message);
      }
    } catch {
      set_error("Something went wrong. Please try again.");
    } finally {
      set_loading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-lg mx-auto">
        <Link
          href="/project"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors duration-200 mb-6 w-fit"
        >
          <BackIcon /> Projects
        </Link>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
          Create a project
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Fill in the details below to start your project
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handle_submit} className="flex flex-col gap-5">
          {/* project name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="project_name"
              className="text-sm font-semibold text-gray-700"
            >
              Project name
            </label>
            <input
              id="project_name"
              name="project_name"
              type="text"
              required
              placeholder="e.g. Agromarket"
              value={form.project_name}
              onChange={handle_change}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200"
            />
          </div>

          {/* description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-sm font-semibold text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="What is this project about?"
              value={form.description}
              onChange={handle_change}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200 resize-none"
            />
          </div>

          {/* tech stack tag input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="techStack"
              className="text-sm font-semibold text-gray-700"
            >
              Tech stack
            </label>

            {form.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => remove_stack(tech)}
                      className="hover:text-green-900 transition-colors"
                    >
                      <XIcon />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              id="techStack"
              placeholder="e.g. React, Node.js, MongoDB"
              value={stack_input}
              onChange={(e) => set_stack_input(e.target.value)}
              onKeyDown={handle_stack_keydown}
              onBlur={add_stack}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200"
            />
            <p className="text-xs text-gray-400">
              Press Enter or comma after each technology
            </p>
          </div>

          {/* visibility toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Visibility
            </label>
            <div className="flex gap-3">
              {[
                {
                  value: true,
                  label: "Public",
                  desc: "Anyone can request to join",
                },
                { value: false, label: "Private", desc: "Invite only" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => set_form({ ...form, isPublic: opt.value })}
                  className={`flex-1 p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${
                      form.isPublic === opt.value
                        ? "border-green-700 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      form.isPublic === opt.value
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors duration-200 mt-2"
          >
            {loading ? "Creating..." : "Create project"}
          </button>
        </form>
      </div>
    </div>
  );
}
