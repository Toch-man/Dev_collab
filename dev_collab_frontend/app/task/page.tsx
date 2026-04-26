"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get_tasks } from "@/lib/api";
import { TaskCard, status_label, type Task } from "@/app/components/TaskCard";

type StatusFilter = "all" | "todo" | "in_progress" | "under_review" | "done";

const filters: StatusFilter[] = [
  "all",
  "todo",
  "in_progress",
  "under_review",
  "done",
];

export default function TasksPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [project, set_project] = useState();
  const [tasks, set_tasks] = useState<Task[]>([]);
  const [status_filter, set_status_filter] = useState<StatusFilter>("all");
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetch_tasks();
  }, [token]);

  const fetch_tasks = async () => {
    try {
      const data = await get_tasks();
      if (!data.success) {
        set_error(data.message);
        return;
      }
      set_tasks(data.tasks ?? []);
    } catch {
      set_error("Failed to load tasks");
    } finally {
      set_loading(false);
    }
  };

  const filtered =
    status_filter === "all"
      ? tasks
      : tasks.filter((t) => t.status === status_filter);

  // count per status for badges
  const counts = filters.reduce((acc, f) => {
    acc[f] =
      f === "all" ? tasks.length : tasks.filter((t) => t.status === f).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Tasks</h1>
            <p className="text-gray-500 text-sm mt-1">
              {tasks.length} total ·{" "}
              {tasks.filter((t) => t.status === "under_review").length} under
              review
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/task/create`}
              className="bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              + Create task
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-green-700 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => set_status_filter(f)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-200
                ${
                  status_filter === f
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
            >
              {f === "all" ? "All" : status_label[f]}
              {counts[f] > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${
                    status_filter === f
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
            <p className="text-gray-400 text-sm">
              {status_filter === "all"
                ? "No tasks yet"
                : `No ${status_label[status_filter]} tasks`}
            </p>
            {status_filter === "all" && (
              <Link
                href={`/task/create`}
                className="inline-block mt-4 text-sm text-green-700 font-semibold hover:underline"
              >
                Create your first task →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
