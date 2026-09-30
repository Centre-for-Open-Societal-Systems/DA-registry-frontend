"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pill } from "@/components/ui/Pill";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Banner } from "@/components/ui/Banner";
import { NOTIFICATIONS, SIGNAL_TONE, SIGNALS, type Notification, type Signal } from "@/features/communication";
import { cn } from "@/lib/utils";

type InboxTab = "inbox" | "handled";
type NotifTab = "all" | "unread";

const SEVERITY_TONE = { Info: "slate", Warning: "amber", Critical: "red" } as const;

// FR-10 inbox of incoming signals (separate from dispatch history) + FR-10b notification centre with an unread filter.
export function AlertsInbox() {
  const [signals, setSignals] = useState<Signal[]>(SIGNALS);
  const [tab, setTab] = useState<InboxTab>("inbox");
  const [notifs, setNotifs] = useState<Notification[]>(NOTIFICATIONS);
  const [notifTab, setNotifTab] = useState<NotifTab>("unread");
  const [notice, setNotice] = useState<string | null>(null);

  const inbox = signals.filter((s) => s.status === "New");
  const handled = signals.filter((s) => s.status !== "New");
  const list = tab === "inbox" ? inbox : handled;
  const unread = notifs.filter((n) => !n.read);
  const notifList = notifTab === "unread" ? unread : notifs;

  const dismiss = (id: string) => {
    setSignals((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Dismissed" } : s)));
    setNotice(`${id} dismissed — kept under Handled for the audit trail.`);
  };

  return (
    <>
    <PageHeader
      tabBar={<SegmentTabs<InboxTab> tabs={[{ key: "inbox", label: "Inbox", count: inbox.length }, { key: "handled", label: "Handled", count: handled.length }]} active={tab} onChange={setTab} />}
      title="Alerts — inbox"
      description="Inbound triage of knowledge snippets, emergency alerts, weather alerts (source only) and informational signals. Dismiss, or craft a response in Broadcast."
    />
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-4">
        {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}
        <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
          {list.length === 0 ? (
            <EmptyState title={tab === "inbox" ? "Inbox is clear" : "Nothing handled yet"} hint="Incoming knowledge, emergency, weather-source and informational signals land here." />
          ) : (
            <ul className="divide-y divide-line-soft">
              {list.map((s) => (
                <li key={s.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={SIGNAL_TONE[s.source]}>{s.source}</Pill>
                      <Pill tone={SEVERITY_TONE[s.severity]} dot>{s.severity}</Pill>
                      {s.status !== "New" && <Pill tone="slate">{s.status}</Pill>}
                      <span className="font-mono text-[12px] text-subtle">{s.id}</span>
                    </div>
                    <p className="mt-1.5 text-[15px] font-semibold text-ink">{s.title}</p>
                    <p className="mt-1 text-[13.5px] text-ink-soft">{s.detail}</p>
                    <p className="mt-1 text-[12px] text-subtle">Received {s.receivedAt}</p>
                  </div>
                  {s.status === "New" && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" onClick={() => dismiss(s.id)} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center rounded-md border border-zinc-200 bg-white px-3.5 text-[13.5px] font-medium text-ink transition-colors hover:bg-zinc-50">Dismiss</button>
                      <Link href={`/broadcast?signal=${s.id}`} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark">Craft response</Link>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Notification centre (FR-10b): unread filter alongside the full list; tab state reflects the active view */}
      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[15px] font-semibold text-ink">Notifications</h2>
          <button type="button" disabled={unread.length === 0} onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))} className="text-[12.5px] font-semibold text-brand-green hover:underline disabled:text-subtle disabled:no-underline">Mark all read</button>
        </div>
        <SegmentTabs<NotifTab> tabs={[{ key: "unread", label: "Unread", count: unread.length }, { key: "all", label: "All", count: notifs.length }]} active={notifTab} onChange={setNotifTab} />
        {notifList.length === 0 ? (
          <EmptyState title="All caught up" hint="No unread notifications." />
        ) : (
          <ul className="divide-y divide-line-soft">
            {notifList.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))} className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface", !n.read && "bg-brand-wash/60")}>
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-brand-green")} />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-ink">{n.title}</span>
                    <span className="block text-[12.5px] text-ink-soft">{n.body}</span>
                    <span className="mt-0.5 block text-[11.5px] text-subtle">{n.kind} · {n.at}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
    </>
  );
}
