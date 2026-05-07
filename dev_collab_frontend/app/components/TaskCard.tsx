"use client";

import Link from "next/link";
import { useState } from "react";
import { delete_task, remove_member } from "@/lib/api";

export type TaskStatus = "todo" | "in_progress" | "under_review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: { _id: string; project_name: string } | string;
  assignedTo: { _id: string; username: string } | string;
  due_date?: string;
  proof?: string;
  createdAt: string;
};

export const status_styles: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-600 border-gray-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-yellow-50 text-yellow-700 border-yellow-200",
  done: "bg-green-50 text-green-700 border-green-200",
};

export const priority_styles: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-500",
  medium: "bg-orange-50 text-orange-600",
  high: "bg-red-50 text-red-600",
};

export const status_label: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  under_review: "Under review",
  done: "Done",
};

// ── StatusBadge ───────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }: { status: TaskStatus }) => (
  <span
    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status_styles[status]}`}
  >
    {status_label[status]}
  </span>
);

// ── PriorityBadge ─────────────────────────────────────────────────────────────
export const PriorityBadge = ({ priority }: { priority: TaskPriority }) => (
  <span
    className={`text-xs font-medium px-2.5 py-1 rounded-full ${priority_styles[priority]}`}
  >
    {priority}
  </span>
);

// ── Trash icon ────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// ── ConfirmModal — small reusable inline modal ────────────────────────────────
const ConfirmModal = ({
  title,
  body,
  confirm_label = "Confirm",
  loading,
  error,
  on_confirm,
  on_cancel,
}: {
  title: string;
  body: string;
  confirm_label?: string;
  loading: boolean;
  error: string;
  on_confirm: () => void;
  on_cancel: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) on_cancel();
    }}
  >
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-extrabold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-500">{body}</p>
      </div>
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={on_cancel}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:border-gray-300 transition-colors duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={on_confirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-bold text-white transition-colors duration-200 disabled:opacity-60"
        >
          {loading ? "Please wait..." : confirm_label}
        </button>
      </div>
    </div>
  </div>
);

// ── TaskCard ──────────────────────────────────────────────────────────────────
export const TaskCard = ({
  task,
  on_deleted,
}: {
  task: Task;
  /** Called after successful delete so parent can remove the card */
  on_deleted?: (task_id: string) => void;
}) => {
  const project = typeof task.project === "object" ? task.project : null;
  const assigned = typeof task.assignedTo === "object" ? task.assignedTo : null;

  const is_overdue =
    task.due_date &&
    task.status !== "done" &&
    new Date(task.due_date) < new Date();

  const [show_delete, set_show_delete] = useState(false);
  const [deleting, set_deleting] = useState(false);
  const [delete_error, set_delete_error] = useState("");

  const handle_delete = async () => {
    set_deleting(true);
    set_delete_error("");
    try {
      const data = await delete_task(task._id);
      if (!data.success) {
        set_delete_error(data.message ?? "Failed to delete task.");
        return;
      }
      set_show_delete(false);
      on_deleted?.(task._id);
    } catch {
      set_delete_error("Something went wrong. Please try again.");
    } finally {
      set_deleting(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <Link
          href={`/task/${task._id}`}
          className="block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 mb-1 truncate pr-6">
                {task.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                {task.description}
              </p>

              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                {project && (
                  <span>
                    Project:{" "}
                    <span className="text-gray-600 font-medium">
                      {project.project_name}
                    </span>
                  </span>
                )}
                {assigned && (
                  <span>
                    Assigned:{" "}
                    <span className="text-gray-600 font-medium">
                      @{assigned.username}
                    </span>
                  </span>
                )}
                {task.due_date && (
                  <span
                    className={is_overdue ? "text-red-500 font-medium" : ""}
                  >
                    Due:{" "}
                    {new Date(task.due_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {is_overdue && " · Overdue"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <StatusBadge status={task.status} />
              {task.priority && <PriorityBadge priority={task.priority} />}
            </div>
          </div>
        </Link>

        {/* Delete button — appears on hover, outside the Link */}
        {on_deleted && (
          <button
            onClick={(e) => {
              e.preventDefault();
              set_delete_error("");
              set_show_delete(true);
            }}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            aria-label={`Delete task "${task.title}"`}
            title="Delete task"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {show_delete && (
        <ConfirmModal
          title="Delete task?"
          body={`"${task.title}" will be permanently deleted. This cannot be undone.`}
          confirm_label="Yes, delete"
          loading={deleting}
          error={delete_error}
          on_confirm={handle_delete}
          on_cancel={() => {
            if (!deleting) {
              set_show_delete(false);
              set_delete_error("");
            }
          }}
        />
      )}
    </>
  );
};

// ── MemberRow — shows a member with a "Remove" button ────────────────────────
export type Member = {
  _id: string;
  username: string;
  full_name?: string;
  avatar?: string;
};

export const MemberRow = ({
  member,
  project_id,
  is_owner,
  on_removed,
}: {
  member: Member;
  project_id: string;
  /** Only the project owner should see/use the remove button */
  is_owner: boolean;
  on_removed?: (member_id: string) => void;
}) => {
  const [show_confirm, set_show_confirm] = useState(false);
  const [removing, set_removing] = useState(false);
  const [remove_error, set_remove_error] = useState("");

  const handle_remove = async () => {
    set_removing(true);
    set_remove_error("");
    try {
      const data = await remove_member(project_id, { member_id: member._id });
      if (!data.success) {
        set_remove_error(data.message ?? "Failed to remove member.");
        return;
      }
      set_show_confirm(false);
      on_removed?.(member._id);
    } catch {
      set_remove_error("Something went wrong. Please try again.");
    } finally {
      set_removing(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-3">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
              {(member.full_name ?? member.username).charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {member.full_name ?? member.username}
            </p>
            <p className="text-xs text-gray-400">@{member.username}</p>
          </div>
        </div>

        {is_owner && on_removed && (
          <button
            onClick={() => {
              set_remove_error("");
              set_show_confirm(true);
            }}
            className="text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors duration-200"
          >
            Remove
          </button>
        )}
      </div>

      {show_confirm && (
        <ConfirmModal
          title="Remove member?"
          body={`@${member.username} will lose access to this project.`}
          confirm_label="Yes, remove"
          loading={removing}
          error={remove_error}
          on_confirm={handle_remove}
          on_cancel={() => {
            if (!removing) {
              set_show_confirm(false);
              set_remove_error("");
            }
          }}
        />
      )}
    </>
  );
};
