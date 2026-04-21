"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { submit_task } from "@/lib/api";

type Task = {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "under_review" | "done";
  priority: "low" | "medium" | "high";
  project: { _id: string; project_name: string };
  assignedTo: { _id: string; username: string };
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

const UploadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 text-gray-400"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function TaskPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const file_ref = useRef<HTMLInputElement>(null);

  const [task, set_task] = useState<Task | null>(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState("");

  const [selected_file, set_selected_file] = useState<File | null>(null);
  const [uploading, set_uploading] = useState(false);
  const [upload_msg, set_upload_msg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch_task();
  }, [id]);

  const fetch_task = async () => {
    set_loading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!data.success) {
        set_error(data.message);
        return;
      }
      set_task(data.task);
    } catch {
      set_error("Failed to load task");
    } finally {
      set_loading(false);
    }
  };

  const handle_file_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) set_selected_file(file);
  };

  const handle_drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) set_selected_file(file);
  };

  const handle_submit = async () => {
    if (!selected_file || !task) return;
    set_uploading(true);
    set_upload_msg("");
    try {
      const data = await submit_task(task._id, selected_file);
      if (data.success) {
        set_upload_msg("Task submitted successfully");
        set_task({ ...task, status: "under_review", proof: data.task.proof });
        set_selected_file(null);
      } else {
        set_upload_msg(data.message);
      }
    } catch {
      set_upload_msg("Upload failed. Please try again.");
    } finally {
      set_uploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading task...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-sm">{error || "Task not found"}</p>
        <Link
          href="/tasks"
          className="text-green-700 text-sm font-semibold hover:underline"
        >
          Back to tasks
        </Link>
      </div>
    );
  }

  const can_submit = task.status === "todo" || task.status === "in_progress";

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/tasks"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors duration-200 mb-6 w-fit"
        >
          ← Tasks
        </Link>

        {/* task header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-extrabold text-gray-900">
              {task.title}
            </h1>
            <div className="flex flex-col items-end gap-2 shrink-0">
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

          <p className="text-gray-500 text-sm leading-relaxed mb-5">
            {task.description}
          </p>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
            {task.project && (
              <span>
                Project:{" "}
                <Link
                  href={`/projects/${task.project._id}`}
                  className="text-green-700 font-medium hover:underline"
                >
                  {task.project.project_name}
                </Link>
              </span>
            )}
            {task.assignedTo && (
              <span>
                Assigned to:{" "}
                <span className="text-gray-600 font-medium">
                  {task.assignedTo.username}
                </span>
              </span>
            )}
            <span>
              Created:{" "}
              {new Date(task.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* proof already submitted */}
        {task.proof && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
            <h2 className="font-bold text-gray-900 mb-3">Submitted proof</h2>
            <a
              href={task.proof}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-700 font-medium hover:underline"
            >
              View submitted file ↗
            </a>
          </div>
        )}

        {/* submit task section */}
        {can_submit && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-1">Submit your work</h2>
            <p className="text-gray-500 text-sm mb-5">
              Upload a file as proof of completion. Accepted: images, PDF, ZIP.
            </p>

            {/* drag and drop area */}
            <div
              onDrop={handle_drop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => file_ref.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200
                ${
                  selected_file
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 hover:border-green-400 hover:bg-gray-50"
                }`}
            >
              <input
                ref={file_ref}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.zip"
                className="hidden"
                onChange={handle_file_change}
              />

              <div className="flex flex-col items-center gap-2">
                <UploadIcon />
                {selected_file ? (
                  <>
                    <p className="text-sm font-semibold text-green-700">
                      {selected_file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(selected_file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">
                      Drag and drop or{" "}
                      <span className="text-green-700 font-medium">browse</span>
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG, PDF, ZIP</p>
                  </>
                )}
              </div>
            </div>

            {selected_file && (
              <button
                onClick={handle_submit}
                disabled={uploading}
                className="w-full mt-4 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors duration-200"
              >
                {uploading ? "Uploading..." : "Submit task"}
              </button>
            )}

            {upload_msg && (
              <p
                className={`text-sm mt-3 text-center
                ${
                  upload_msg.includes("success")
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {upload_msg}
              </p>
            )}
          </div>
        )}

        {/* task under review or done — no submit */}
        {!can_submit && task.status !== "done" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
            <p className="text-yellow-700 text-sm font-medium">
              This task is under review — waiting for approval.
            </p>
          </div>
        )}

        {task.status === "done" && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <p className="text-green-700 text-sm font-medium">
              This task is complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
