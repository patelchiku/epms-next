"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Bell, AlertTriangle, Clock, CheckCircle2, FileText, Home, Handshake, Users, X } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Alert = { type: string; label: string; count: number; href: string; color: string };
type Activity = {
  id: number; userId: number; action: string; entity: string; entityId: number | null;
  title: string; createdAt: string;
  user: { firstName: string; lastName: string };
};

const ENTITY_ICONS: Record<string, any> = {
  enquiry: FileText, property: Home, deal: Handshake, user: Users, approval: CheckCircle2,
};
const ACTION_COLORS: Record<string, string> = {
  created: "text-emerald-600 bg-emerald-50",
  updated: "text-blue-600 bg-blue-50",
  deleted: "text-red-600 bg-red-50",
  approved: "text-violet-600 bg-violet-50",
  rejected: "text-orange-600 bg-orange-50",
};
const ALERT_COLORS: Record<string, string> = {
  red: "bg-red-50 text-red-700 border-red-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  blue: "bg-blue-50 text-blue-700 border-blue-100",
};

function entityHref(entity: string, entityId: number | null): string {
  if (!entityId) return "#";
  const map: Record<string, string> = { enquiry: "/enquiries", property: "/properties", deal: "/deals", user: "/users" };
  return map[entity] ? `${map[entity]}/${entityId}` : "#";
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"alerts" | "activity">("alerts");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [unreadActivity, setUnreadActivity] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const userId = (session?.user as any)?.id;

  const lastReadKey = `notif_last_read_${userId}`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setAlerts(data.alerts ?? []);
      setActivities(data.activities ?? []);
      setTotalAlerts(data.totalAlerts ?? 0);
      // Count activities after lastRead
      const lastRead = localStorage.getItem(lastReadKey);
      if (lastRead) {
        const cutoff = new Date(lastRead);
        setUnreadActivity(data.activities.filter((a: Activity) => new Date(a.createdAt) > cutoff).length);
      } else {
        setUnreadActivity(data.activities.length);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [lastReadKey]);

  useEffect(() => {
    if (!userId) return;
    load();
    const interval = setInterval(load, 60_000); // poll every minute
    return () => clearInterval(interval);
  }, [load, userId]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function openPanel() {
    setOpen((v) => !v);
    if (!open) {
      localStorage.setItem(lastReadKey, new Date().toISOString());
      setUnreadActivity(0);
    }
  }

  const badge = totalAlerts + unreadActivity;

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={openPanel}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-4.5 h-4.5 w-5 h-5" />
        {badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-800">Notifications</p>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {(["alerts", "activity"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize ${
                  tab === t ? "text-violet-600 border-b-2 border-violet-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "alerts" ? `Alerts${totalAlerts > 0 ? ` (${totalAlerts})` : ""}` : `Activity${unreadActivity > 0 ? ` · ${unreadActivity} new` : ""}`}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : tab === "alerts" ? (
              alerts.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-medium">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-0.5">No pending alerts right now</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {alerts.map((a) => (
                    <Link
                      key={a.type}
                      href={a.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors hover:opacity-90 ${ALERT_COLORS[a.color]}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
                        {a.color === "red" ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{a.label}</p>
                      </div>
                      <span className="text-2xl font-bold">{a.count}</span>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              activities.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-medium">No activity yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {activities.map((a) => {
                    const Icon = ENTITY_ICONS[a.entity] ?? Bell;
                    const colorCls = ACTION_COLORS[a.action] ?? "text-slate-600 bg-slate-100";
                    const href = entityHref(a.entity, a.entityId);
                    return (
                      <Link
                        key={a.id}
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorCls}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 leading-snug">{a.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {a.user.firstName} {a.user.lastName} ·{" "}
                            {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {tab === "activity" && activities.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5 text-center">
              <p className="text-xs text-slate-400">Showing last 50 entries · 30-day log retention</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
