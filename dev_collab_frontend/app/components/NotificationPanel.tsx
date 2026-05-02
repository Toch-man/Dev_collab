"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { get_notification } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

type Notification = {
  _id: string;
  sender?: { username: string; full_name: string };
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

type Tab = "all" | "unread" | "mentions";

const type_icon: Record<string, string> = {
  invite: "📨",
  mention: "💬",
  task: "✅",
  join_request: "🤝",
  accepted: "🎉",
  default: "🔔",
};

export default function NotificationPanel() {
  const { token } = useAuth();
  const [notifications, set_notifications] = useState<Notification[]>([]);
  const [open, set_open] = useState(false);
  const [tab, set_tab] = useState<Tab>("all");
  const [loading, set_loading] = useState(false);

  //derive unread count from notifications
  const unread_count = notifications.filter((n) => !n.isRead).length;

  const fetch_notifications = useCallback(async () => {
    if (!token) return;
    set_loading(true);
    try {
      const data = await get_notification();

      if (data.success) set_notifications(data.data ?? []);
    } catch {
      console.error("Failed to load notifications");
    } finally {
      set_loading(false);
    }
  }, [token]);

  useEffect(() => {
    fetch_notifications();
  }, [fetch_notifications]);

  const mark_as_read = async (id: string) => {
    try {
      await mark_as_read(id);
      set_notifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      console.error("Failed to mark as read");
    }
  };

  const mark_all_read = async () => {
    try {
      const unread_ids = notifications
        .filter((n) => !n.isRead)
        .map((n) => n._id);
      await Promise.all(unread_ids.map((id) => mark_as_read(id)));
      set_notifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      console.error("Failed to mark all as read");
    }
  };

  const filtered = notifications.filter((n) => {
    if (tab === "unread") return !n.isRead;
    if (tab === "mentions") return n.type === "mention";
    return true;
  });

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => set_open(!open)}
        className="relative w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:border-green-300 transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-gray-600"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread_count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread_count > 9 ? "9+" : unread_count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => set_open(false)} />
          <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">
                  Notifications
                </h3>
                {unread_count > 0 && (
                  <span className="text-[10px] bg-green-700 text-white px-1.5 py-0.5 rounded-full font-bold">
                    {unread_count}
                  </span>
                )}
              </div>
              {unread_count > 0 && (
                <button
                  onClick={mark_all_read}
                  className="text-xs text-green-700 hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {(["all", "unread", "mentions"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => set_tab(t)}
                  className={`flex-1 py-2 text-xs font-semibold capitalize transition-colors
                    ${
                      tab === t
                        ? "text-green-700 border-b-2 border-green-700"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {t}
                  {t === "unread" && unread_count > 0 && ` (${unread_count})`}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-2xl mb-2">🔔</p>
                  <p className="text-gray-400 text-xs">
                    {tab === "unread"
                      ? "You're all caught up!"
                      : "No notifications yet"}
                  </p>
                </div>
              ) : (
                filtered.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && mark_as_read(n._id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors
                      ${
                        !n.isRead
                          ? "cursor-pointer hover:bg-gray-50 bg-green-50/30"
                          : "opacity-60"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-sm shrink-0">
                      {type_icon[n.type] || type_icon.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      {n.sender && (
                        <p className="text-xs font-semibold text-gray-700 truncate">
                          {n.sender.full_name || n.sender.username}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(n.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-green-600 shrink-0 mt-1" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
