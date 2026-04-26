"use client";

import Link from "next/link";

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

// ── TaskCard — used in both task list and dashboard ───────────────────────────
export const TaskCard = ({ task }: { task: Task }) => {
  const project = typeof task.project === "object" ? task.project : null;
  const assigned = typeof task.assignedTo === "object" ? task.assignedTo : null;

  const is_overdue =
    task.due_date &&
    task.status !== "done" &&
    new Date(task.due_date) < new Date();

  return (
    <Link
      href={`/task/${task._id}`}
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
              <span className={is_overdue ? "text-red-500 font-medium" : ""}>
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
  );
};
