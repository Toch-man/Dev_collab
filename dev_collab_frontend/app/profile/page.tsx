"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Avatar = ({ name }: { name: string }) => {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-24 h-24 rounded-3xl bg-green-700 flex items-center justify-center text-white font-bold text-3xl shrink-0">
      {initials}
    </div>
  );
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [show_logout_confirm, set_show_logout_confirm] = useState(false);

  if (!user) {
    router.push("/auth/login");
    return;
  }
  const stats = [
    { label: "Role", value: user.role },
    { label: "Niche", value: user.niche },
    { label: "Skills", value: `${user.skills?.length ?? 0}` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Banner — reduced height so avatar doesn't overlap */}
      <div className="h-10 bg-linear-to-r from-green-700 to-emerald-600 relative">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 2px, transparent 1px), radial-gradient(circle at 80% 20%, white 2px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6">
        {/* Avatar sits just below banner with negative margin */}
        <div
          className="flex items-end justify-between mb-6"
          style={{ marginTop: "-48px" }}
        >
          <div className="ring-4 ring-white rounded-3xl bg-white">
            <Avatar name={user.full_name || user.username} />
          </div>
          <div className="flex gap-2 pb-1">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:border-green-300 transition-colors font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => set_show_logout_confirm(true)}
              className="text-sm bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {user.full_name}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">@{user.username}</p>
          <p className="text-green-700 text-sm font-medium mt-1">
            {user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 px-4 py-4 text-center"
            >
              <p className="font-bold text-gray-900 capitalize text-base truncate">
                {s.value || "—"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Bio
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-sm bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Account */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Account
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium text-gray-900">
                {user.email}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Username</span>
              <span className="text-sm font-medium text-gray-900">
                @{user.username}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Role</span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide
                ${
                  user.role === "admin"
                    ? "bg-gray-900 text-white"
                    : "bg-green-50 text-green-700 border border-green-100"
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout modal */}
      {show_logout_confirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-extrabold text-gray-900 text-lg mb-2">
              Log out?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              You'll be redirected to the login page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => set_show_logout_confirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
