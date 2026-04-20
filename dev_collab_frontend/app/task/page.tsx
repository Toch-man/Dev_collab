"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { get_tasks } from "@/lib/api";

type Task = {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "under_review" | "done";
  priority: "low" | "medium" | "high";
  project: { _id: string; project_name: string } | string;
  assignedTo: { _id: string; username: string } | string;
  proof?: string;
  createdAt: string;
};

const status_styles: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600 border-gray-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-yellow-50 text-yellow-700 border-yellow-200",
  done: "bg-green-50 text-green-700 border-green-200",
};

const priority_styles: Record<string, string> = {
  low: "bg-gray-100 text-gray-500",
  medium: "bg-orange-50 text-orange-600",
  high: "bg-red-50 text-red-600",
};

const status_label: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  under_review: "Under review",
  done: "Done",
};

export default function Tasks() {
  const [tasks, set_tasks] = useState<Task[]>([]);
  const [filtered, set_filtered] = useState<Task[]>([]);
  const [status_filter, set_status_filter] = useState("all");
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch_tasks();
  }, []);

  useEffect(() => {
    if (status_filter === "all") {
      set_filtered(tasks);
    } else {
      set_filtered(tasks.filter((t) => t.status === status_filter));
    }
  }, [status_filter, tasks]);

  const fetch_tasks = async () => {
    try {
      const data = await get_tasks();
      if (!data.success) {
        set_error(data.message);
        return;
      }
      set_tasks(data.tasks ?? []);
      set_filtered(data.tasks ?? []);
    } catch {
      set_error("Failed to load tasks");
    } finally {
      set_loading(false);
    }
  };

  const filters = ["all", "todo", "in_progress", "under_review", "done"];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Tasks</h1>
            <p className="text-gray-500 text-sm mt-1">{tasks.length} total</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-green-700 transition-colors duration-200"
          >
            ← Dashboard
          </Link>
        </div>

        {/* status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => set_status_filter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-200
                ${
                  status_filter === f
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
            >
              {f === "all" ? "All" : status_label[f]}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-20">
            Loading tasks...
          </p>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
            <p className="text-gray-400 text-sm">No tasks found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((task) => (
              <Link
                key={task._id}
                href={`/tasks/${task._id}`}
                className="block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 truncate">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {task.description}
                    </p>
                    {typeof task.project === "object" && task.project && (
                      <p className="text-xs text-gray-400">
                        Project:{" "}
                        <span className="text-gray-600 font-medium">
                          {task.project.project_name}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        status_styles[task.status]
                      }`}
                    >
                      {status_label[task.status]}
                    </span>
                    {task.priority && (
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          priority_styles[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
