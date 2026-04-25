"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get_all_users, send_invite, get_projects } from "@/lib/api";

interface User {
  _id: string;
  full_name: string;
  username: string;
  email: string;
  niche: string;
  bio: string;
  skills: string[];
  role: string;
}

interface Project {
  _id: string;
  project_name: string;
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
      className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shrink-0`}
    >
      {initials}
    </div>
  );
};

export default function UsersPage() {
  const { user: me, token } = useAuth();
  const router = useRouter();
  const search_params = useSearchParams();
  const preselected_project = search_params.get("project_id");

  const [users, set_users] = useState<User[]>([]);
  const [projects, set_projects] = useState<Project[]>([]);
  const [search, set_search] = useState("");
  const [loading, set_loading] = useState(true);
  const [selected_project, set_selected_project] = useState(
    preselected_project || ""
  );
  const [invite_states, set_invite_states] = useState<
    Record<string, { loading: boolean; msg: string; success: boolean }>
  >({});

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetch_data();
  }, [token]);

  const fetch_data = async () => {
    try {
      const [users_res, projects_res] = await Promise.all([
        get_all_users(),
        get_projects(),
      ]);
      if (users_res.success)
        set_users(users_res.users.filter((u: User) => u._id !== me?.id));
      if (projects_res.success) set_projects(projects_res.project);
    } catch {
      console.error("Failed to load");
    } finally {
      set_loading(false);
    }
  };

  const handle_invite = async (receiver_id: string) => {
    if (!selected_project) {
      set_invite_states((prev) => ({
        ...prev,
        [receiver_id]: {
          loading: false,
          msg: "Select a project first",
          success: false,
        },
      }));
      return;
    }
    set_invite_states((prev) => ({
      ...prev,
      [receiver_id]: { loading: true, msg: "", success: false },
    }));
    try {
      const data = await send_invite(selected_project, receiver_id);
      set_invite_states((prev) => ({
        ...prev,
        [receiver_id]: {
          loading: false,
          msg: data.message,
          success: data.success,
        },
      }));
    } catch {
      set_invite_states((prev) => ({
        ...prev,
        [receiver_id]: {
          loading: false,
          msg: "Failed to send invite",
          success: false,
        },
      }));
    }
  };

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.niche?.toLowerCase().includes(search.toLowerCase()) ||
      u.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-green-700 mb-4 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Developers
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Browse and invite developers to your projects
              </p>
            </div>
            <span className="text-sm text-gray-400">
              {filtered.length} developer{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name, niche, or skill..."
            value={search}
            onChange={(e) => set_search(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors"
          />
          <select
            value={selected_project}
            onChange={(e) => set_selected_project(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-700 focus:outline-none text-sm transition-colors bg-white min-w-[200px]"
          >
            <option value="">Select project to invite to</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.project_name}
              </option>
            ))}
          </select>
        </div>

        {!selected_project && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-xl">
            Select a project above before inviting a developer
          </p>
        )}

        {/* Users list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No developers found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((u) => {
              const state = invite_states[u._id];
              return (
                <div
                  key={u._id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={u.full_name || u.username} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {u.full_name}
                      </p>
                      <p className="text-xs text-gray-400">@{u.username}</p>
                      {u.niche && (
                        <p className="text-xs text-green-700 font-medium mt-0.5">
                          {u.niche}
                        </p>
                      )}
                    </div>
                  </div>

                  {u.bio && (
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                      {u.bio}
                    </p>
                  )}

                  {u.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {u.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                      {u.skills.length > 4 && (
                        <span className="text-[10px] text-gray-400">
                          +{u.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handle_invite(u._id)}
                    disabled={state?.loading || state?.success}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all duration-200
                      ${
                        state?.success
                          ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                          : "bg-green-700 hover:bg-green-800 text-white disabled:opacity-60"
                      }`}
                  >
                    {state?.loading
                      ? "Sending..."
                      : state?.success
                      ? "✓ Invited"
                      : "Send invite"}
                  </button>

                  {state?.msg && !state.success && (
                    <p className="text-[11px] text-red-500 mt-1.5 text-center">
                      {state.msg}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
