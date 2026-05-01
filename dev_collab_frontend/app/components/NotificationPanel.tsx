import { get_notification, mark_as_read } from "@/lib/api";
import { useState, useEffect } from "react";

type Notification = {
  _id: string;
  sender?: { name: string };
  message: string;
  type: string;
  isRead: boolean;
};

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [tab, setTab] = useState<"all" | "unread" | "mentions">("all");

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    const data = await get_notification();

    setNotifications(data.data);
  };

  const fetchUnreadCount = async () => {
    const res = await fetch("/api/notifications/unread_count", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setUnreadCount(data.count);
  };

  const markAsRead = async (id: string) => {
    await mark_as_read({ id });
    fetchNotifications();
    fetchUnreadCount();
  };

  const filtered = notifications.filter((n) => {
    if (tab === "unread") return !n.isRead;
    if (tab === "mentions") return n.type === "mention";
    return true;
  });

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)}>
        🔔 {unreadCount > 0 && <span>{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          {["all", "unread", "mentions"].map((t) => (
            <button key={t} onClick={() => setTab(t as any)}>
              {t}
            </button>
          ))}

          {filtered.map((n) => (
            <div
              key={n._id}
              onClick={() => markAsRead(n._id)}
              style={{ opacity: n.isRead ? 0.6 : 1 }}
            >
              <strong>{n.sender?.name}</strong>
              <p>{n.message}</p>
              <span>{n.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
