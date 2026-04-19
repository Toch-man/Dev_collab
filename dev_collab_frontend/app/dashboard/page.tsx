"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

// icons
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

const ProjectIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const TaskIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const TeamIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ProfileIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

//types
type User = {
  id: string;
  username: string;
  email: string;
  niche: string;
  role: string;
};

type Project = {
  _id: string;
  project_name: string;
  description: string;
  techStack: string;
  isPublic: boolean;
  members: string[];
  createdAt: string;
};

// idebar link
const SideLink = ({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200
      ${
        active
          ? "bg-green-700 text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      }`}
  >
    {icon}
    {label}
  </Link>
);

//  project card
const ProjectCard = ({ project }: { project: Project }) => (
  <Link
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
    <h3 className="font-bold text-gray-900 mb-1">{project.project_name}</h3>
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
);

export default function Dashboard() {
  const [user, set_user] = useState<User | null>(null);
  const [projects, set_projects] = useState<Project[]>([]);
  const [loading, set_loading] = useState(true);
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const auth_headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetch_data();
  }, []);

  const fetch_data = async () => {
    try {
      const projects_res = await fetch(`${API}/api/project`, {
        headers: auth_headers,
        credentials: "include",
      });

      if (projects_res.status === 401) {
        router.push("/login");
        return;
      }

      const projects_data = await projects_res.json();
      set_projects(projects_data.project ?? []);

      // parse user from token payload
      const payload = JSON.parse(atob(token!.split(".")[1]));
      set_user({
        id: payload.userId,
        email: payload.email,
        username: "",
        niche: "",
        role: "",
      });
    } catch {
      console.error("Failed to fetch dashboard data");
    } finally {
      set_loading(false);
    }
  };

  const handle_logout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 p-5 fixed h-full">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-black flex items-center justify-center rounded-lg">
            <span className="text-white font-extrabold text-sm">D</span>
          </div>
          <span className="font-extrabold text-gray-900">Dev_collab</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <SideLink
            href="/dashboard"
            icon={<ProjectIcon />}
            label="Dashboard"
            active
          />
          <SideLink href="/projects" icon={<ProjectIcon />} label="Projects" />
          <SideLink href="/tasks" icon={<TaskIcon />} label="Tasks" />
          <SideLink href="/team" icon={<TeamIcon />} label="Team" />
          <SideLink href="/profile" icon={<ProfileIcon />} label="Profile" />
        </nav>

        <button
          onClick={handle_logout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200"
        >
          <LogoutIcon /> Logout
        </button>
      </aside>

      {/* main content */}
      <main className="flex-1 md:ml-60 p-6 md:p-10">
        {/* header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back{user?.email ? `, ${user.email}` : ""}
            </p>
          </div>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors duration-200"
          >
            <PlusIcon /> New project
          </Link>
        </div>

        {/* stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total projects", value: projects.length },
            {
              label: "Public projects",
              value: projects.filter((p) => p.isPublic).length,
            },
            {
              label: "Private projects",
              value: projects.filter((p) => !p.isPublic).length,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className="text-3xl font-extrabold text-green-700">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* projects section */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900">
            Your projects
          </h2>
          <Link
            href="/projects"
            className="text-sm text-green-700 hover:underline font-medium"
          >
            View all
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">
              You have no projects yet
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors duration-200"
            >
              <PlusIcon /> Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
