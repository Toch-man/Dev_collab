"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

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

type Project = {
  _id: string;
  project_name: string;
  description: string;
  techStack: string;
  isPublic: boolean;
  members: string[];
  createdAt: string;
};

export default function Projects() {
  const [projects, set_projects] = useState<Project[]>([]);
  const [filtered, set_filtered] = useState<Project[]>([]);
  const [search, set_search] = useState("");
  const [filter, set_filter] = useState<"all" | "public" | "private">("all");
  const [loading, set_loading] = useState(true);
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

  // re-filter whenever search or filter tab changes
  useEffect(() => {
    let result = projects;
    if (filter === "public") result = result.filter((p) => p.isPublic);
    if (filter === "private") result = result.filter((p) => !p.isPublic);
    if (search.trim()) {
      result = result.filter(
        (p) =>
          p.project_name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()) ||
          p.techStack.toLowerCase().includes(search.toLowerCase())
      );
    }
    set_filtered(result);
  }, [search, filter, projects]);

  const fetch_projects = async () => {
    try {
      const res = await fetch(`${API}/api/project`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      set_projects(data.project ?? []);
      set_filtered(data.project ?? []);
    } catch {
      console.error("Failed to fetch projects");
    } finally {
      set_loading(false);
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
        {/* header */}
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
            href="/projects/new"
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors duration-200"
          >
            <PlusIcon /> New project
          </Link>
        </div>

        {/* search + filter */}
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
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
                  ${
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

        {/* project grid */}
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
                href="/projects/new"
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
                href={`/projects/${project._id}`}
                className="block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full
                    ${
                      project.isPublic
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {project.isPublic ? "Public" : "Private"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {project.project_name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {project.techStack}
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
    </div>
  );
}
