"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { get_project, send_invite } from "@/lib/api";

// ── types ─────────────────────────────────────────────────────────────────────
type Member = {
  _id: string;
  username: string;
  email: string;
  niche: string;
};

type Project = {
  _id: string;
  project_name: string;
  description: string;
  techStack: string[];
  isPublic: boolean;
  owner: Member;
  members: Member[];
  createdAt: string;
};

// ── icons ─────────────────────────────────────────────────────────────────────
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

const UsersIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const StackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ── avatar — shows initials when no image ─
const Avatar = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-9 h-9 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-green-700">{initials}</span>
    </div>
  );
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, set_project] = useState<Project | null>(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState("");

  // invite state
  const [receiver_id, set_receiver_id] = useState("");
  const [invite_loading, set_invite_loading] = useState(false);
  const [invite_msg, set_invite_msg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch_project();
  }, [id]);

  const fetch_project = async () => {
    set_loading(true);
    try {
      const data = await get_project(id);
      if (!data.success) {
        set_error(data.message);
        return;
      }
      set_project(data.project);
    } catch {
      set_error("Failed to load project");
    } finally {
      set_loading(false);
    }
  };

  const handle_invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiver_id.trim()) return;
    set_invite_loading(true);
    set_invite_msg("");
    try {
      const data = await send_invite(id, receiver_id.trim());
      if (data.success) {
        set_invite_msg(data.message);
        set_receiver_id("");
      } else {
        set_invite_msg(data.message);
      }
    } catch {
      set_invite_msg("Failed to send invite");
    } finally {
      set_invite_loading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-sm">{error || "Project not found"}</p>
        <Link
          href="/projects"
          className="text-green-700 text-sm font-semibold hover:underline"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* back link */}
        <Link
          href="/projects"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors duration-200 mb-6 w-fit"
        >
          <BackIcon /> Projects
        </Link>

        {/* project header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-extrabold text-gray-900">
                  {project.project_name}
                </h1>
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
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                {project.description}
              </p>
            </div>
          </div>

          {/* meta row */}
          <div className="flex flex-wrap gap-5 mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarIcon />
              {new Date(project.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <UsersIcon />
              {project.members?.length ?? 0} member
              {project.members?.length !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <StackIcon />
              {project.techStack?.length ?? 0} tech stack
              {project.techStack?.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* tech stack */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Tech stack</h2>
            {project.techStack?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No tech stack added yet</p>
            )}
          </div>

          {/* owner */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Owner</h2>
            {project.owner ? (
              <div className="flex items-center gap-3">
                <Avatar name={project.owner.username} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {project.owner.username}
                  </p>
                  <p className="text-xs text-gray-500">{project.owner.email}</p>
                  {project.owner.niche && (
                    <p className="text-xs text-green-700 mt-0.5">
                      {project.owner.niche}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Owner not found</p>
            )}
          </div>

          {/* members */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:col-span-2">
            <h2 className="font-bold text-gray-900 mb-4">
              Members{" "}
              <span className="text-gray-400 font-normal text-sm">
                ({project.members?.length ?? 0})
              </span>
            </h2>

            {project.members?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <Avatar name={member.username} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {member.username}
                      </p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                      {member.niche && (
                        <p className="text-xs text-green-700 mt-0.5">
                          {member.niche}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No members yet</p>
            )}
          </div>

          {/* send invite */}
          {project.isPublic && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:col-span-2">
              <h2 className="font-bold text-gray-900 mb-1">
                Invite a developer
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Enter the user ID of the developer you want to invite
              </p>

              <form onSubmit={handle_invite} className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Paste user ID..."
                  value={receiver_id}
                  onChange={(e) => set_receiver_id(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors duration-200"
                />
                <button
                  type="submit"
                  disabled={invite_loading || !receiver_id.trim()}
                  className="bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors duration-200"
                >
                  {invite_loading ? "Sending..." : "Send invite"}
                </button>
              </form>

              {invite_msg && (
                <p
                  className={`text-sm mt-3 ${
                    invite_msg.toLowerCase().includes("success") ||
                    invite_msg.toLowerCase().includes("sent")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {invite_msg}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
