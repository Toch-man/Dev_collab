"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { get_my_projects } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// Icons
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
const InviteIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 12 18.92a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 6.18 2 2 0 0 1 4.11 4h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 11.91a16 16 0 0 0 6 6z" />
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

// Sidebar link (desktop)
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

//  Bottom nav link (mobile)
const BottomLink = ({
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
    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors flex-1
      ${active ? "text-green-700" : "text-gray-400 hover:text-gray-700"}`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

// Project card
const ProjectCard = ({ project }: { project: Project }) => (
  <Link
    href={`/project/${project._id}`}
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
      <div className="flex flex-wrap gap-1">
        {Array.isArray(project.techStack) ? (
          project.techStack.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))
        ) : (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {project.techStack}
          </span>
        )}
      </div>
      <span className="text-xs text-gray-400">
        {project.members?.length ?? 0} member
        {project.members?.length !== 1 ? "s" : ""}
      </span>
    </div>
  </Link>
);

//dashboard
export default function Dashboard() {
  const [projects, set_projects] = useState<Project[]>([]);
  const [loading, set_loading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuth();

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetch_data();
  }, [token]);

  const fetch_data = async () => {
    try {
      const data = await get_my_projects();
      if (data.success) set_projects(data.project ?? []);
    } catch {
      console.error("Failed to fetch dashboard data");
    } finally {
      set_loading(false);
    }
  };

  const nav_items = [
    { href: "/dashboard", icon: <ProjectIcon />, label: "Home" },
    { href: "/project", icon: <ProjectIcon />, label: "Projects" },
    { href: "/task", icon: <TaskIcon />, label: "Tasks" },
    { href: "/invites", icon: <InviteIcon />, label: "Invites" },
    { href: "/profile", icon: <ProfileIcon />, label: "Profile" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 p-5 fixed h-full z-30">
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
            active={pathname === "/dashboard"}
          />
          <SideLink
            href="/project"
            icon={<ProjectIcon />}
            label="Projects"
            active={pathname.startsWith("/project")}
          />
          <SideLink
            href="/task"
            icon={<TaskIcon />}
            label="Tasks"
            active={pathname.startsWith("/task")}
          />
          <SideLink
            href="/users"
            icon={<TeamIcon />}
            label="Developers"
            active={pathname.startsWith("/users")}
          />
          <SideLink
            href="/invites"
            icon={<InviteIcon />}
            label="Invites"
            active={pathname.startsWith("/invites")}
          />
          <SideLink
            href="/profile"
            icon={<ProfileIcon />}
            label="Profile"
            active={pathname.startsWith("/profile")}
          />
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogoutIcon /> Logout
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-60 p-6 md:p-10 pb-24 md:pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back{user?.username ? `, ${user.username}` : ""}
            </p>
          </div>
          <Link
            href="/project/create_project"
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            <PlusIcon /> New project
          </Link>
        </div>

        {/* Stats */}
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

        {/* Projects */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900">
            Your projects
          </h2>
          <Link
            href="/project"
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
              href="/project/create_project"
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
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

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex items-center z-30">
        {nav_items.map(({ href, icon, label }) => (
          <BottomLink
            key={href}
            href={href}
            icon={icon}
            label={label}
            active={
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href))
            }
          />
        ))}
      </nav>
    </div>
  );
}
