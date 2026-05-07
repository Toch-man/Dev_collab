"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { get_all_projects, delete_project } from "@/lib/api";

const PlusIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    className="w-4 h-4"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 text-gray-400"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

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

type Project = {
  _id: string;
  project_name: string;
  description: string;
  techStack: string[];
  isPublic: boolean;
  members: string[];
  createdAt: string;
};

type DeleteModal = {
  open: boolean;
  project_id: string;
  project_name: string;
};

export default function Projects() {
  const [projects, set_projects] = useState<Project[]>([]);
  const [filtered, set_filtered] = useState<Project[]>([]);
  const [search, set_search] = useState("");
  const [filter, set_filter] = useState<"all" | "public" | "private">("all");
  const [loading, set_loading] = useState(true);
  const [delete_modal, set_delete_modal] = useState<DeleteModal>({
    open: false,
    project_id: "",
    project_name: "",
  });
  const [deleting, set_deleting] = useState(false);
  const [delete_error, set_delete_error] = useState("");
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetch_projects();
  }, []);

  useEffect(() => {
    let result = projects;
    if (filter === "public") result = result.filter((p) => p.isPublic);
    if (filter === "private") result = result.filter((p) => !p.isPublic);
    if (search.trim()) {
      result = result.filter(
        (p) =>
          p.project_name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()) ||
          p.techStack.join(" ").toLowerCase().includes(search.toLowerCase())
      );
    }
    set_filtered(result);
  }, [search, filter, projects]);

  const fetch_projects = async () => {
    try {
      const data = await get_all_projects();
      set_projects(data.projects ?? []);
      set_filtered(data.projects ?? []);
    } catch {
      console.error("Failed to fetch projects");
    } finally {
      set_loading(false);
    }
  };

  const open_delete = (e: React.MouseEvent, project: Project) => {
    e.preventDefault(); // don't navigate to the project page
    e.stopPropagation();
    set_delete_error("");
    set_delete_modal({
      open: true,
      project_id: project._id,
      project_name: project.project_name,
    });
  };

  const close_delete = () => {
    if (deleting) return;
    set_delete_modal({ open: false, project_id: "", project_name: "" });
    set_delete_error("");
  };

  const confirm_delete = async () => {
    set_deleting(true);
    set_delete_error("");
    try {
      const data = await delete_project(delete_modal.project_id);
      if (!data.success) {
        set_delete_error(data.message ?? "Failed to delete project.");
        return;
      }
      // Remove from local state — no full refetch needed
      set_projects((prev) =>
        prev.filter((p) => p._id !== delete_modal.project_id)
      );
      set_delete_modal({ open: false, project_id: "", project_name: "" });
    } catch {
      set_delete_error("Something went wrong. Please try again.");
    } finally {
      set_deleting(false);
    }
  };

  const filter_tabs: { label: string; value: "all" | "public" | "private" }[] =
    [
      { label: "All", value: "all" },
      { label: "Public", value: "public" },
      { label: "Private", value: "private" },
    ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors duration-200"
          >
            <BackIcon /> Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Projects</h1>
            <p className="text-gray-500 text-sm mt-1">
              {projects.length} total
            </p>
          </div>
          <Link
            href="/project/create_project"
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors duration-200"
          >
            <PlusIcon /> New project
          </Link>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>
            <input
              placeholder="Search by name, description, stack..."
              value={search}
              onChange={(e) => set_search(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200 bg-white"
            />
          </div>
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            {filter_tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => set_filter(t.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filter === t.value
                    ? "bg-green-700 text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">Loading projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
            <p className="text-gray-400 text-sm mb-4">
              {search || filter !== "all"
                ? "No projects match your search"
                : "No projects yet"}
            </p>
            {!search && filter === "all" && (
              <Link
                href="/project/create_project"
                className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors duration-200"
              >
                <PlusIcon /> Create your first project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <Link
                key={project._id}
                href={`/project/${project._id}`}
                className="block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      project.isPublic
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {project.isPublic ? "Public" : "Private"}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>

                    {/* Delete button — shown on hover */}
                    <button
                      onClick={(e) => open_delete(e, project)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                      aria-label={`Delete ${project.project_name}`}
                      title="Delete project"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-1">
                  {project.project_name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {Array.isArray(project.techStack)
                      ? project.techStack.slice(0, 2).join(", ")
                      : project.techStack}
                  </span>
                  <span className="text-xs text-gray-400">
                    {project.members?.length ?? 0} member
                    {project.members?.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {delete_modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) close_delete();
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-extrabold text-gray-900">
                Delete project?
              </h2>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">
                  &ldquo;{delete_modal.project_name}&rdquo;
                </span>{" "}
                will be permanently deleted along with all its tasks. This
                cannot be undone.
              </p>
            </div>

            {delete_error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                {delete_error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={close_delete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:border-gray-300 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirm_delete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-bold text-white transition-colors duration-200 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
