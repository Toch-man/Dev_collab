"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  get_my_invites,
  accept_invite,
  reject_invite,
  send_notification,
} from "@/lib/api";

interface InviteBase {
  _id: string;
  status: "pending" | "accepted" | "rejected";
  type: "owner_invite" | "join_request";
  project: {
    _id: string;
    project_name: string;
    description: string;
    techStack: string[];
  };
  createdAt: string;
}

interface ReceivedInvite extends InviteBase {
  sender: { _id: string; username: string; email: string; niche: string };
}

interface SentRequest extends InviteBase {
  receiver: { _id: string; username: string; email: string };
}

interface ProjectRequest extends InviteBase {
  sender: {
    _id: string;
    username: string;
    email: string;
    niche: string;
    full_name: string;
  };
}

type Tab = "received" | "sent" | "join_requests";

const status_style: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-100",
  accepted: "bg-green-50 text-green-700 border border-green-100",
  rejected: "bg-red-50 text-red-500 border border-red-100",
};

const Avatar = ({ name }: { name: string }) => {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-9 h-9 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-green-700">{initials}</span>
    </div>
  );
};

export default function InvitesPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [received, set_received] = useState<ReceivedInvite[]>([]);
  const [sent, set_sent] = useState<SentRequest[]>([]);
  const [project_requests, set_project_requests] = useState<ProjectRequest[]>(
    []
  );
  const [loading, set_loading] = useState(true);
  const [active_tab, set_active_tab] = useState<Tab>("received");
  const [action_states, set_action_states] = useState<
    Record<string, { loading: boolean }>
  >({});

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
      if (data.success) {
        set_received(data.received_invites || []);
        set_sent(data.sent_requests || []);
        set_project_requests(data.project_requests || []);
      }
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
    set_action_states((prev) => ({ ...prev, [invite_id]: { loading: true } }));
    try {
      const data =
        action === "accept"
          ? await accept_invite(invite_id)
          : await reject_invite(invite_id);

      if (data.success) {
        const update = (list: any[]) =>
          list.map((inv) =>
            inv._id === invite_id
              ? {
                  ...inv,
                  status: action === "accept" ? "accepted" : "rejected",
                }
              : inv
          );
        set_received(update);
        set_project_requests(update);
      }
    } finally {
      set_action_states((prev) => ({
        ...prev,
        [invite_id]: { loading: false },
      }));
    }
  };

  const pending_received = received.filter(
    (i) => i.status === "pending"
  ).length;
  const pending_requests = project_requests.filter(
    (i) => i.status === "pending"
  ).length;

  const tabs: { key: Tab; label: string; count?: number; data: any[] }[] = [
    {
      key: "received",
      label: "Invites received",
      count: pending_received,
      data: received,
    },
    {
      key: "join_requests",
      label: "Join requests",
      count: pending_requests,
      data: project_requests,
    },
    {
      key: "sent",
      label: "Requests sent",
      data: sent,
    },
  ];

  const active_data = tabs.find((t) => t.key === active_tab)?.data || [];

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
          <h1 className="text-2xl font-extrabold text-gray-900">Invites</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage your project invites and join requests
          </p>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => set_active_tab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 -mb-px
                  ${
                    active_tab === tab.key
                      ? "border-green-700 text-green-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[10px] bg-green-700 text-white px-1.5 py-0.5 rounded-full font-bold">
                    {tab.count}
                  </span>
                )}
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
        ) : active_data.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {active_tab === "received" && "No invites received yet"}
            {active_tab === "sent" && "You haven't sent any join requests yet"}
            {active_tab === "join_requests" &&
              "No one has requested to join your projects yet"}
          </div>
        ) : (
          active_data.map((invite) => {
            const state = action_states[invite._id];
            const is_pending = invite.status === "pending";

            return (
              <div
                key={invite._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex items-start gap-3 flex-wrap">
                  {/* Avatar — show sender for received/requests, owner for sent */}
                  {active_tab !== "sent" && invite.sender && (
                    <Avatar
                      name={invite.sender.full_name || invite.sender.username}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Sender info */}
                    {active_tab === "received" && (
                      <p className="text-xs text-gray-500 mb-1">
                        <span className="font-semibold text-gray-700">
                          @{invite.sender?.username}
                        </span>
                        {invite.sender?.niche && ` · ${invite.sender.niche}`}{" "}
                        invited you to join
                      </p>
                    )}
                    {active_tab === "join_requests" && (
                      <p className="text-xs text-gray-500 mb-1">
                        <span className="font-semibold text-gray-700">
                          {invite.sender?.full_name ||
                            `@${invite.sender?.username}`}
                        </span>
                        {invite.sender?.niche && ` · ${invite.sender.niche}`}{" "}
                        wants to join
                      </p>
                    )}
                    {active_tab === "sent" && (
                      <p className="text-xs text-gray-500 mb-1">
                        Your join request
                      </p>
                    )}

                    {/* Project */}
                    <Link
                      href={`/project/${invite.project._id}`}
                      className="font-bold text-gray-900 hover:text-green-700 transition-colors text-base"
                    >
                      {invite.project.project_name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {invite.project.description}
                    </p>

                    {/* Tech stack */}
                    {invite.project.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {invite.project.techStack.map((t: string) => (
                          <span
                            key={t}
                            className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-md"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Status badge for sent requests */}
                    {active_tab === "sent" && (
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize mt-2 ${
                          status_style[invite.status]
                        }`}
                      >
                        {invite.status}
                      </span>
                    )}
                  </div>

                  {/* Accept/Reject actions — only for received invites and join requests */}
                  {(active_tab === "received" ||
                    active_tab === "join_requests") &&
                    is_pending && (
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

                  {/* Already responded */}
                  {(active_tab === "received" ||
                    active_tab === "join_requests") &&
                    !is_pending && (
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-semibold capitalize shrink-0 ${
                          status_style[invite.status]
                        }`}
                      >
                        {invite.status}
                      </span>
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
