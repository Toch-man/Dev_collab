"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { submit_task } from "@/lib/api";
import {
  StatusBadge,
  PriorityBadge,
  status_label,
  type TaskStatus,
  type TaskPriority,
} from "@/app/components/TaskCard";

const API = process.env.NEXT_PUBLIC_API_URL;
const get_token = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

type Task = {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: { _id: string; project_name: string; owner: { _id: string } };
  assignedTo: { _id: string; username: string };
  due_date?: string;
  proof?: string;
  createdAt: string;
};

const owner_transitions: Record<TaskStatus, TaskStatus[]> = {
  todo: ["in_progress"],
  in_progress: ["todo"],
  under_review: ["done", "in_progress"],
  done: ["in_progress"],
};

// ── status → numeric id your backend expects ──────────────────────────────────
const status_to_id: Record<string, number> = {
  in_progress: 1,
  done: 3,
};

// ── priority → numeric id ─────────────────────────────────────────────────────
const priority_to_id: Record<string, number> = {
  low: 0,
  medium: 1,
  high: 2,
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
  const { user } = useAuth();
  const file_ref = useRef<HTMLInputElement>(null);

  const [task, set_task] = useState<Task | null>(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState("");

  const [selected_file, set_selected_file] = useState<File | null>(null);
  const [uploading, set_uploading] = useState(false);
  const [upload_msg, set_upload_msg] = useState("");

  const [status_loading, set_status_loading] = useState(false);
  const [status_msg, set_status_msg] = useState("");

  const [priority_loading, set_priority_loading] = useState(false);
  const [priority_msg, set_priority_msg] = useState("");

  useEffect(() => {
    if (!get_token()) {
      router.push("/auth/login");
      return;
    }
    fetch_task();
  }, [id]);

  const fetch_task = async () => {
    set_loading(true);
    try {
      const res = await fetch(`${API}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${get_token()}` },
        credentials: "include",
      });
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

  // ── status update — sends numeric id to backend
  const handle_status_change = async (new_status: TaskStatus) => {
    if (!task) return;
    set_status_loading(true);
    set_status_msg("");
    try {
      const res = await fetch(
        `${API}/api/tasks/update_task_data/${task._id}/${task.project._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${get_token()}`,
          },
          credentials: "include",
          body: JSON.stringify({
            data_to_update: "status",
            update_to_id: status_to_id[new_status],
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        set_task(data.updated_task);
        set_status_msg("Status updated successfully");
      } else {
        set_status_msg(data.message);
      }
    } catch {
      set_status_msg("Failed to update status");
    } finally {
      set_status_loading(false);
    }
  };

  // priority update
  const handle_priority_change = async (new_priority: TaskPriority) => {
    if (!task) return;
    set_priority_loading(true);
    set_priority_msg("");
    try {
      const res = await fetch(
        `${API}/api/tasks/update_task_data/${task._id}/${task.project._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${get_token()}`,
          },
          credentials: "include",
          body: JSON.stringify({
            data_to_update: "priority",
            update_to_id: priority_to_id[new_priority],
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        set_task(data.updated_task);
        set_priority_msg(`Priority updated to ${new_priority}`);
      } else {
        set_priority_msg(data.message);
      }
    } catch {
      set_priority_msg("Failed to update priority");
    } finally {
      set_priority_loading(false);
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

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error || !task)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-sm">{error || "Task not found"}</p>
        <Link
          href="/task"
          className="text-green-700 text-sm font-semibold hover:underline"
        >
          Back to tasks
        </Link>
      </div>
    );

  const is_owner =
    user?.id === task.project?.owner?._id ||
    user?.id === task.project?.owner?._id;
  const is_assigned =
    user?.id === task.assignedTo?._id || user?.id === task.assignedTo?._id;
  const can_submit =
    is_assigned && (task.status === "todo" || task.status === "in_progress");
  const available_transitions = is_owner
    ? owner_transitions[task.status] || []
    : [];
  const is_overdue =
    task.due_date &&
    task.status !== "done" &&
    new Date(task.due_date) < new Date();

  const priorities: TaskPriority[] = ["low", "medium", "high"];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/task"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors mb-6 w-fit"
        >
          ← Tasks
        </Link>

        {/* Task header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-extrabold text-gray-900">
              {task.title}
            </h1>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <StatusBadge status={task.status} />
              {task.priority && <PriorityBadge priority={task.priority} />}
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
                  href={`/project/${task.project._id}`}
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
                  @{task.assignedTo.username}
                </span>
              </span>
            )}
            {task.due_date && (
              <span className={is_overdue ? "text-red-500 font-semibold" : ""}>
                Due:{" "}
                {new Date(task.due_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {is_overdue && " · Overdue"}
              </span>
            )}
          </div>
        </div>

        {/*  OWNER CONTROLS  */}
        {is_owner && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 space-y-6">
            {/* Status update */}
            {available_transitions.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 mb-1">Update status</h2>
                <p className="text-gray-500 text-sm mb-4">
                  {task.status === "under_review"
                    ? "Review the submitted work and approve or send it back."
                    : "Move this task to a different stage."}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {available_transitions.map((next_status) => {
                    const is_approve = next_status === "done";
                    const is_sendback =
                      next_status === "in_progress" &&
                      task.status === "under_review";
                    return (
                      <button
                        key={next_status}
                        onClick={() => handle_status_change(next_status)}
                        disabled={status_loading}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50
                          ${
                            is_approve
                              ? "bg-green-700 hover:bg-green-800 text-white"
                              : is_sendback
                              ? "border-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                              : "border-2 border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                      >
                        {status_loading
                          ? "Updating..."
                          : is_approve
                          ? "✓ Approve & mark done"
                          : is_sendback
                          ? "↩ Send back for revision"
                          : `Move to "${status_label[next_status]}"`}
                      </button>
                    );
                  })}
                </div>
                {status_msg && (
                  <p
                    className={`text-sm mt-3 ${
                      status_msg.includes("successfully")
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {status_msg}
                  </p>
                )}
              </div>
            )}

            {/* Priority update */}
            <div>
              <h2 className="font-bold text-gray-900 mb-1">Update priority</h2>
              <p className="text-gray-500 text-sm mb-4">
                Current:{" "}
                <span className="font-medium capitalize">{task.priority}</span>
              </p>
              <div className="flex gap-3">
                {priorities.map((p) => (
                  <button
                    key={p}
                    onClick={() => handle_priority_change(p)}
                    disabled={priority_loading || task.priority === p}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 capitalize
                      ${
                        task.priority === p
                          ? p === "high"
                            ? "bg-red-50 text-red-600 border-2 border-red-300"
                            : p === "medium"
                            ? "bg-orange-50 text-orange-600 border-2 border-orange-300"
                            : "bg-gray-100 text-gray-500 border-2 border-gray-300"
                          : "border-2 border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                  >
                    {priority_loading ? "..." : p}
                  </button>
                ))}
              </div>
              {priority_msg && (
                <p
                  className={`text-sm mt-3 ${
                    priority_msg.includes("updated")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {priority_msg}
                </p>
              )}
            </div>
          </div>
        )}

        {/*  SUBMITTED PROOF */}
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

        {/*  MEMBER SUBMIT*/}
        {can_submit && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-1">Submit your work</h2>
            <p className="text-gray-500 text-sm mb-5">
              Upload a file as proof of completion.
            </p>

            <div
              onDrop={handle_drop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => file_ref.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
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
                className="w-full mt-4 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {uploading ? "Uploading..." : "Submit task"}
              </button>
            )}

            {upload_msg && (
              <p
                className={`text-sm mt-3 text-center ${
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

        {/* Status banners */}
        {!can_submit && task.status === "under_review" && !is_owner && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
            <p className="text-yellow-700 text-sm font-medium">
              Your work is under review — waiting for approval.
            </p>
          </div>
        )}

        {task.status === "done" && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <p className="text-green-700 text-sm font-medium">
              ✓ This task is complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
