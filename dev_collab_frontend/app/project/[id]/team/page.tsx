"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get_project } from "@/lib/api";

interface Member {
  _id: string;
  full_name: string;
  username: string;
  email: string;
  niche: string;
  bio: string;
  skills: string[];
  role: "user" | "admin";
}

interface Project {
  _id: string;
  project_name: string;
  description: string;
  owner: Member;
  members: Member[];
  techStack: string[];
  isPublic: boolean;
}

const Avatar = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "bg-green-700",
    "bg-emerald-600",
    "bg-teal-600",
    "bg-green-800",
    "bg-lime-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl`}
    >
      {initials}
    </div>
  );
};

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const project_id = params?.id as string;

  const [project, set_project] = useState<Project | null>(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    if (!project_id) return;

    const fetch_project = async () => {
      try {
        const data = await get_project(project_id);
        if (!data.success) {
          set_error(data.message || "Failed to load project");
          return;
        }
        set_project(data.project);
      } catch {
        set_error("Network error, please try again");
      } finally {
        set_loading(false);
      }
    };

    fetch_project();
  }, [project_id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading team...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-green-700 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const all_members = [
    project.owner,
    ...project.members.filter((m) => m._id !== project.owner._id),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-green-700 transition-colors mb-4 flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                {project.project_name}
              </h1>
              <p className="text-gray-500 text-sm mt-1 max-w-xl">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-lg font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-3xl font-extrabold text-green-700">
                {all_members.length}
              </span>
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Members
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
          Team Members
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {all_members.map((member) => {
            const is_owner = member._id === project.owner._id;
            return (
              <div
                key={member._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <Avatar name={member.full_name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base">
                        {member.full_name}
                      </h3>
                      {is_owner && (
                        <span className="text-[10px] bg-green-700 text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                          Owner
                        </span>
                      )}
                      {member.role === "admin" && !is_owner && (
                        <span className="text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      @{member.username}
                    </p>
                    <p className="text-xs text-green-700 font-medium mt-1">
                      {member.niche}
                    </p>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-2">
                    {member.bio}
                  </p>
                )}

                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {member.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 4 && (
                      <span className="text-[11px] text-gray-400">
                        +{member.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-50">
                  <p className="text-xs text-gray-400">{member.email}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
