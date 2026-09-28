"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { StatCard } from "@/components/ui/StatCard";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";
import { ARTICLES, DISPATCHES, SIGNAL_TONE, SIGNALS } from "@/features/communication/data";
import { DateRangeDropdown } from "./DateRangeDropdown";

const icon = (d: string) => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const SEVERITY_TONE = { Critical: "red", Warning: "amber", Info: "slate" } as const;

// Communications Officer home: what has arrived to broadcast and how the last sends landed (FSD §2.4, FR-10).
export function CommsDashboard() {
  const newSignals = SIGNALS.filter((s) => s.status === "New");
  const totals = DISPATCHES.reduce(
    (acc, d) => ({
      recipients: acc.recipients + d.recipients,
      delivered: acc.delivered + d.delivery.delivered,
      failed: acc.failed + d.delivery.failed,
      pending: acc.pending + d.delivery.pending,
    }),
    { recipients: 0, delivered: 0, failed: 0, pending: 0 },
  );
  const deliveryRate = totals.recipients === 0 ? 0 : Math.round((totals.delivered / totals.recipients) * 100);

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header */}
      <Card className="relative z-50 flex w-full flex-col justify-between gap-4 px-4 py-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] md:flex-row md:items-center">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[#1a2b3c] sm:text-[22px]">Broadcast &amp; Alerts</h1>
          <p className="mt-1.5 text-[14px] text-[#4a5568]">
            {newSignals.length} signal{newSignals.length === 1 ? "" : "s"} waiting to be dispatched · {DISPATCHES.length} sends in the last 30 days
          </p>
        </div>
        <DateRangeDropdown />
      </Card>

      {/* Critical signal banner */}
      {newSignals.some((s) => s.severity === "Critical") && (
        <Banner tone="error" title="Critical signal awaiting dispatch">{newSignals.find((s) => s.severity === "Critical")?.title}</Banner>
      )}

      {/* Dispatch KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Signals to action" value={String(newSignals.length)} accent="border-l-[#EA580C]" tile="bg-[#FFF7EB] text-[#C2410C]" hint={`${SIGNALS.length} received in total`} icon={icon("M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0")} />
        <StatCard label="Recipients reached" value={totals.delivered.toLocaleString()} accent="border-l-brand-green" tile="bg-[#E6F5F0] text-brand-green" hint={`${deliveryRate}% delivery rate`} icon={icon("M4 4h16v16H4zM4 7l8 6 8-6")} />
        <StatCard label="Failed deliveries" value={String(totals.failed)} accent="border-l-[#DC2626]" tile="bg-[#FFF1F1] text-[#DC2626]" hint={`${totals.pending} still pending`} icon={icon("M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z")} />
        <StatCard label="Knowledge articles" value={String(ARTICLES.length)} accent="border-l-[#2563EB]" tile="bg-[#EFF6FF] text-[#2563EB]" hint={`${ARTICLES.reduce((s, a) => s + a.sends, 0)} sends to date`} icon={icon("M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z")} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Incoming signals */}
        <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
            <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Incoming signals</h2>
            <Link href="/alerts" className="text-[13px] font-semibold text-brand-green hover:underline">Open Alerts →</Link>
          </div>
          <ul className="divide-y divide-[#F1F3F4]">
            {SIGNALS.map((s) => (
              <li key={s.id} className="px-5 py-3.5 transition-colors hover:bg-[#F8FAFC]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-[#1a2b3c]">{s.title}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[#64748b]">{s.detail}</p>
                    <p className="mt-1.5 text-[12px] text-[#94a3b8]">{s.receivedAt}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Pill tone={SIGNAL_TONE[s.source]}>{s.source}</Pill>
                    <Pill tone={SEVERITY_TONE[s.severity]}>{s.severity}</Pill>
                  </div>
                </div>
                <p className={cn("mt-2 text-[12px] font-semibold", s.status === "New" ? "text-[#C2410C]" : "text-[#94a3b8]")}>{s.status}</p>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recent dispatches */}
        <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
            <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Recent dispatches</h2>
            <Link href="/broadcast" className="text-[13px] font-semibold text-brand-green hover:underline">Open Broadcast →</Link>
          </div>
          <ul className="divide-y divide-[#F1F3F4]">
            {DISPATCHES.map((d) => {
              const pct = Math.round((d.delivery.delivered / d.recipients) * 100);
              return (
                <li key={d.id} className="px-5 py-3.5 transition-colors hover:bg-[#F8FAFC]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[13.5px] text-[#1a2b3c]">{d.message}</p>
                      <p className="mt-1.5 text-[12.5px] text-[#64748b]">
                        {d.audience} · {d.channels.join(" + ")} · {d.recipients.toLocaleString()} recipients
                      </p>
                      <p className="mt-1 text-[12px] text-[#94a3b8]">{d.dispatchedBy} · {d.dispatchedAt}</p>
                    </div>
                    <Pill tone={SIGNAL_TONE[d.source]} className="shrink-0">{d.source}</Pill>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <span className={cn("block h-full rounded-full", pct >= 95 ? "bg-brand-green" : pct >= 85 ? "bg-[#EA580C]" : "bg-[#DC2626]")} style={{ width: `${pct}%` }} />
                    </span>
                    <span className="shrink-0 text-[12.5px] text-[#64748b]">
                      <strong className="font-semibold text-[#1a2b3c]">{pct}%</strong> delivered · {d.delivery.failed} failed{d.delivery.pending > 0 ? ` · ${d.delivery.pending} pending` : ""}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Knowledge library reach */}
      <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
          <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Knowledge library — most sent</h2>
          <Link href="/knowledge" className="text-[13px] font-semibold text-brand-green hover:underline">Open Knowledge Base →</Link>
        </div>
        <ul className="divide-y divide-[#F1F3F4]">
          {[...ARTICLES].sort((a, b) => b.sends - a.sends).map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#F8FAFC]">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-[#1a2b3c]">{a.title}</p>
                <p className="mt-0.5 text-[12.5px] text-[#64748b]">{a.category} · {a.author} · updated {a.updatedAt}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Pill tone="slate">{a.languages.map((l) => l.toUpperCase()).join(" / ")}</Pill>
                <span className="w-16 text-right text-[13px] text-[#4a5568]"><strong className="font-semibold text-[#1a2b3c]">{a.sends}</strong> sends</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
