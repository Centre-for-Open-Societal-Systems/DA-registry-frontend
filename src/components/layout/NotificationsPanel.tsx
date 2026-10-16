"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/** One row of GET /da-services/notifications. */
export interface AppNotification {
  id: string;
  /** Visit, Task, Sync, Grievance, Broadcast, Issue, Assignment, Onboarding, Approval or System. */
  kind: string;
  title: string;
  body: string | null;
  /** Portal route the row opens, e.g. "/visits/DA-VIS-0001"; null when there is nothing to open. */
  href: string | null;
  read: boolean;
  /** ISO timestamp the notification was created. */
  at: string;
}

export type NotificationsTab = "all" | "unread";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  /** Across all notifications, from the API's meta. */
  unreadCount: number;
  tab: NotificationsTab;
  onTabChange: (tab: NotificationsTab) => void;
  /** True while the first page of the current tab loads. */
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  /** Row clicked: mark it read and open its href. */
  onOpen: (notification: AppNotification) => void;
  onMarkAllRead: () => void;
}

// Icon and tint per notification kind; anything unlisted gets the bell.
const KIND_ICON: Record<string, { tile: string; path: string }> = {
  Visit: { tile: "bg-blue-50 text-blue-500", path: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z" },
  Task: { tile: "bg-violet-50 text-violet-500", path: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" },
  Assignment: { tile: "bg-white border border-brand-green/20 text-brand-green", path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  Onboarding: { tile: "bg-white border border-brand-green/20 text-brand-green", path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  Approval: { tile: "bg-emerald-50 text-emerald-600", path: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  Broadcast: { tile: "bg-amber-50 text-amber-600", path: "M3 11l18-5v12L3 14v-3zM11.6 16.8a3 3 0 11-5.8-1.6" },
  Sync: { tile: "bg-emerald-50 text-emerald-600", path: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" },
  Grievance: { tile: "bg-amber-50 text-amber-600", path: "M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" },
  Issue: { tile: "bg-red-50 text-danger", path: "M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" },
};
const DEFAULT_ICON = { tile: "bg-slate-100 text-slate-500", path: "M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 003.4 0" };

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const DAY = 86_400_000;

type Group = "Today" | "Yesterday" | "Earlier";

function groupOf(at: string, now: Date): Group {
  const diff = startOfDay(now) - startOfDay(new Date(at));
  return diff <= 0 ? "Today" : diff <= DAY ? "Yesterday" : "Earlier";
}

/** "2 h ago" today, "Yesterday, 4:10 PM", then "12 Oct, 4:10 PM". */
function timeLabel(at: string, group: Group, now: Date): string {
  const d = new Date(at);
  const clock = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (group === "Yesterday") return `Yesterday, ${clock}`;
  if (group === "Earlier") return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${clock}`;
  const minutes = Math.max(0, Math.round((now.getTime() - d.getTime()) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.round(minutes / 60)} h ago`;
}

export function NotificationsPanel({ isOpen, onClose, notifications, unreadCount, tab, onTabChange, loading, error, hasMore, loadingMore, onLoadMore, onOpen, onMarkAllRead }: NotificationsPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0); return () => clearTimeout(t);
  }, []);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const now = new Date();
  const groups: { label: Group; items: AppNotification[] }[] = (["Today", "Yesterday", "Earlier"] as const)
    .map((label) => ({ label, items: notifications.filter((n) => groupOf(n.at, now) === label) }))
    .filter((g) => g.items.length > 0);

  const tabClass = (active: boolean) =>
    cn("flex h-full items-center gap-2 border-b-2 px-5 py-3.5 text-[14px] font-semibold transition-colors", active ? "border-brand-green bg-brand-green/5 text-brand-green" : "border-transparent text-muted hover:text-ink");

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-[400px] h-full bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right-full duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line-soft">
          <h2 className="text-xl font-bold text-ink">Notifications</h2>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 text-ink-soft transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between px-6 border-b border-line-soft select-none">
          <div className="flex items-center h-full">
            <button type="button" onClick={() => onTabChange("all")} className={tabClass(tab === "all")}>
              All
            </button>
            <button type="button" onClick={() => onTabChange("unread")} className={tabClass(tab === "unread")}>
              Unread
              {unreadCount > 0 && (
                <span className="flex items-center justify-center bg-brand-green text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] h-5">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="text-[13px] font-bold text-brand-green hover:text-emerald-800 transition-colors disabled:cursor-not-allowed disabled:text-subtle"
          >
            Mark all read
          </button>
        </div>

        {/* Scrollable Notifications List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
          {error && (
            <div className="m-4 rounded-lg border border-danger-border bg-danger-wash px-4 py-3 text-[13px] text-red-800">{error}</div>
          )}

          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 border-b border-line-soft px-5 py-4">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <div className="px-5 py-2.5 bg-surface border-b border-line-soft">
                  <span className="text-[11px] font-bold text-muted tracking-wider uppercase">{group.label}</span>
                </div>

                {group.items.map((n) => {
                  const icon = KIND_ICON[n.kind] ?? DEFAULT_ICON;
                  const unread = !n.read;
                  return (
                    <div
                      key={n.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpen(n)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(n); } }}
                      aria-label={n.href ? `Open "${n.title}"` : unread ? `Mark "${n.title}" as read` : n.title}
                      className={cn("flex px-4 py-4 border-b border-line-soft cursor-pointer transition-colors", unread ? "bg-brand-green/5 hover:bg-brand-green/10" : "bg-white hover:bg-zinc-50")}
                    >
                      <div className="pt-2 shrink-0 w-4 flex justify-center">
                        {unread && <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />}
                      </div>
                      <div className="ml-1">
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", icon.tile)}>
                          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d={icon.path} />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <h4 className={cn("text-[14px] text-ink", unread ? "font-bold" : "font-semibold")}>{n.title}</h4>
                        {n.body && <p className="text-[13px] text-muted mt-1 leading-snug pr-4">{n.body}</p>}
                        <span className="text-[12px] text-muted mt-1.5 flex items-center gap-1.5">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">{n.kind}</span>
                          {timeLabel(n.at, group.label, now)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="p-8 text-center text-muted">
              {tab === "unread" ? "You're all caught up." : "No notifications to display."}
            </div>
          )}

          {!loading && hasMore && (
            <div className="p-4 text-center">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="text-[13px] font-semibold text-brand-green hover:underline disabled:cursor-wait disabled:text-subtle disabled:no-underline"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
