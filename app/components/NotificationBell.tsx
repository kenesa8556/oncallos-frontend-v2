"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useOrg } from "../lib/OrgContext";

interface Notification {
  id: string;
  incident_id: string | null;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

const ICONS: Record<string, any> = {
  new_incident: AlertTriangle,
  needs_approval: ShieldAlert,
  resolved: CheckCircle2,
};

export default function NotificationBell() {
  const { orgId } = useOrg();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setToken(session.access_token);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/notifications`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) setNotifications(await res.json());
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [orgId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleOpen() {
    setOpen((o) => !o);
  }

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  function handleClick(n: Notification) {
    markRead(n.id);
    setOpen(false);
    if (n.incident_id) router.push(`/incidents/${n.incident_id}`);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center text-slate hover:bg-white hover:border hover:border-border transition-colors relative shrink-0"
      >
        <Bell size={16} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-critical" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-[340px] max-w-[90vw] bg-white border border-border rounded-[8px] overflow-hidden z-20 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
              <span className="text-[12.5px] font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[11.5px] text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 && (
                <div className="px-3.5 py-8 text-center text-[12.5px] text-muted">No notifications yet.</div>
              )}
              {notifications.map((n) => {
                const Icon = ICONS[n.type] ?? Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex items-start gap-2.5 px-3.5 py-3 border-b border-border-subtle last:border-b-0 transition-colors hover:bg-surface ${
                      n.read ? "" : "bg-primary-subtle/30"
                    }`}
                  >
                    <Icon size={14} className="text-muted mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] text-ink leading-[1.4]">{n.message}</div>
                      <div className="text-[10.5px] text-muted/70 font-mono mt-1">{timeAgo(n.created_at)}</div>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}