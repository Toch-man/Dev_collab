"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { get_my_invites, accept_invite, reject_invite } from "@/lib/api";

interface Invite {
  _id: string;
  type: "owner_invite" | "join_request";
  status: "pending" | "accepted" | "rejected";
  project: {
    _id: string;
    project_name: string;
    description: string;
    techStack: string[];
  };
  sender: {
    _id: string;
    username: string;
    email: string;
    niche: string;
  };
  createdAt: string;
}

export default function InvitesPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [invites, set_invites] = useState<Invite[]>([]);
  const [loading, set_loading] = useState(true);
  const [action_states, set_action_states] = useState<
    Record<string, { loading: boolean; done: boolean }>
  >({});
  const [filter, set_filter] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("pending");

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetch_invites();
  }, [token]);

  const fetch_invites = async () => {
    try {
      const data = await get_my_invites();
      if (data.success) set_invites(data.invites);
    } catch {
      console.error("Failed to load invites");
    } finally {
      set_loading(false);
    }
  };

  const handle_action = async (
    invite_id: string,
    action: "accept" | "reject"
  ) => {
    set_action_states((prev) => ({
      ...prev,
      [invite_id]: { loading: true, done: false },
    }));
    try {
      const data =
        action === "accept"
          ? await accept_invite(invite_id)
          : await reject_invite(invite_id);

      if (data.success) {
        set_invites((prev) =>
          prev.map((inv) =>
            inv._id === invite_id
              ? {
                  ...inv,
                  status: action === "accept" ? "accepted" : "rejected",
                }
              : inv
          )
        );
        set_action_states((prev) => ({
          ...prev,
          [invite_id]: { loading: false, done: true },
        }));
      }
    } catch {
      set_action_states((prev) => ({
        ...prev,
        [invite_id]: { loading: false, done: false },
      }));
    }
  };

  const filtered = invites.filter(
    (inv) => filter === "all" || inv.status === filter
  );
  const pending_count = invites.filter((i) => i.status === "pending").length;

  const status_style = {
    pending: "bg-amber-50 text-amber-700 border border-amber-100",
    accepted: "bg-green-50 text-green-700 border border-green-100",
    rejected: "bg-red-50 text-red-500 border border-red-100",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-green-700 mb-4 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                Invites
                {pending_count > 0 && (
                  <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-full font-semibold">
                    {pending_count}
                  </span>
                )}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Project invites and join requests sent to you
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 mt-5 bg-gray-100 p-1 rounded-xl w-fit">
            {(["pending", "accepted", "rejected", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => set_filter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200
                  ${
                    filter === f
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              No {filter === "all" ? "" : filter} invites
            </p>
          </div>
        ) : (
          filtered.map((invite) => {
            const state = action_states[invite._id];
            return (
              <div
                key={invite._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    {/* Project */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link
                        href={`/project/${invite.project._id}`}
                        className="font-bold text-gray-900 hover:text-green-700 transition-colors"
                      >
                        {invite.project.project_name}
                      </Link>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                          status_style[invite.status]
                        }`}
                      >
                        {invite.status}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {invite.type === "owner_invite"
                          ? "Invited by owner"
                          : "Join request"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                      {invite.project.description}
                    </p>

                    {/* Tech stack */}
                    {invite.project.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {invite.project.techStack.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-md"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Sender */}
                    <p className="text-xs text-gray-400">
                      From{" "}
                      <span className="font-medium text-gray-600">
                        @{invite.sender?.username}
                      </span>
                      {invite.sender?.niche && ` · ${invite.sender.niche}`}
                    </p>
                  </div>

                  {/* Actions */}
                  {invite.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handle_action(invite._id, "reject")}
                        disabled={state?.loading}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:border-red-200 hover:text-red-500 transition-all disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handle_action(invite._id, "accept")}
                        disabled={state?.loading}
                        className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-xs font-bold text-white transition-all disabled:opacity-50"
                      >
                        {state?.loading ? "..." : "Accept"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
