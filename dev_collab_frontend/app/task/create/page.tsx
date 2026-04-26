"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { assign_task, get_projects } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

const get_token = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

interface Member {
  _id: string;
  username: string;
  full_name: string;
  niche: string;
}

interface Project {
  _id: string;
  project_name: string;
  members: Member[];
  owner: { _id: string };
}

type FormState = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignedTo: string;
  due_date: string;
};

export default function CreateTaskPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [projects, set_projects] = useState<Project[]>([]);
  const [selected_project_id, set_selected_project_id] = useState<string>();
  const [members, set_members] = useState<Member[]>([]);
  const [loading, set_loading] = useState(false);
  const [projects_loading, set_projects_loading] = useState(true);
  const [error, set_error] = useState("");

  const [form, set_form] = useState<FormState>({
    title: "",
    description: "",
    assignedTo: "", // user_id
    priority: "medium",
    due_date: "",
  });

  // fetch all projects owned by this user
  useEffect(() => {
    const token = get_token();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetch_projects();
  }, []);

  // when project changes, load its members
  useEffect(() => {
    if (!selected_project_id) {
      set_members([]);
      return;
    }
    const project = projects.find((p) => p._id === selected_project_id);
    if (project) set_members(project.members || []);
  }, [selected_project_id, projects]);

  const fetch_projects = async () => {
    try {
      const data = await get_projects();

      if (data.success) {
        // only show projects the user owns
        const owned = data.project.filter(
          (p: Project) => p.owner?._id === user?.id
        );
        set_projects(owned);
        if (selected_project_id) set_selected_project_id(selected_project_id);
      }
    } catch {
      set_error("Failed to load projepreselected_projectcts");
    } finally {
      set_projects_loading(false);
    }
  };

  const handle_change = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    set_error("");
    set_form({ ...form, [e.target.name]: e.target.value });
  };

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected_project_id) {
      set_error("Select a project");
      return;
    }
    if (!form.assignedTo) {
      set_error("Assign this task to a member");
      return;
    }

    set_loading(true);
    set_error("");
    try {
      const data = await assign_task(selected_project_id, form);

      if (data.success) {
        router.push(`/task/${data.task._id}`);
      } else {
        set_error(data.message || "Failed to create task");
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
          href="/task"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors mb-6 w-fit"
        >
          ← Tasks
        </Link>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
          Create a task
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Assign a task to a project member
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handle_submit} className="flex flex-col gap-5">
          {/* Project selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Project
            </label>
            {projects_loading ? (
              <p className="text-sm text-gray-400">Loading projects...</p>
            ) : (
              <select
                value={selected_project_id}
                onChange={(e) => {
                  set_selected_project_id(e.target.value);
                  set_form({ ...form, assignedTo: "" });
                }}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors bg-white"
              >
                <option value="">Select a project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.project_name}
                  </option>
                ))}
              </select>
            )}
            {projects.length === 0 && !projects_loading && (
              <p className="text-xs text-gray-400">
                You don't own any projects yet.{" "}
                <Link
                  href="/project/create"
                  className="text-green-700 hover:underline"
                >
                  Create one
                </Link>
              </p>
            )}
          </div>

          {/* Assign to member */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Assign to
            </label>
            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handle_change}
              required
              disabled={!selected_project_id || members.length === 0}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors bg-white disabled:opacity-50"
            >
              <option value="">
                {!selected_project_id
                  ? "Select a project first"
                  : members.length === 0
                  ? "No members in this project yet"
                  : "Select a member"}
              </option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.full_name} (@{m.username}){m.niche ? ` · ${m.niche}` : ""}
                </option>
              ))}
            </select>
            {selected_project_id && members.length === 0 && (
              <p className="text-xs text-gray-400">
                Add members to this project first.{" "}
                <Link
                  href={`/users?project_id=${selected_project_id}`}
                  className="text-green-700 hover:underline"
                >
                  Invite members
                </Link>
              </p>
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="title"
              className="text-sm font-semibold text-gray-700"
            >
              Task title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Build login page"
              value={form.title}
              onChange={handle_change}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors"
            />
          </div>

          {/* Description */}
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
              placeholder="What needs to be done?"
              value={form.description}
              onChange={handle_change}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors resize-none"
            />
          </div>

          {/* Priority + Due date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handle_change}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="due_date"
                className="text-sm font-semibold text-gray-700"
              >
                Due date{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={handle_change}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors mt-2"
          >
            {loading ? "Creating..." : "Create task"}
          </button>
        </form>
      </div>
    </div>
  );
}
