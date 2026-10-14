"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ExportButton } from "@/components/ui/ExportButton";
import { StatCard } from "@/components/ui/StatCard";
import { fileDate } from "@/lib/download";
import { downloadTable, type ExportFormat } from "@/lib/export";
import { FarmerAvatar } from "@/features/farmers";
import { ACTIVITY_REPORT, SUBMITTED_OUTCOMES } from "@/features/visits";

// One CSV: the week's metrics first, then every submitted outcome row.
type ReportRow = { section: string; farmer: string; kebele: string; purpose: string; summary: string; date: string; metric: string; value: string };

function exportReport(format: ExportFormat, stats: { label: string; value: string }[]) {
  const blank = { farmer: "", kebele: "", purpose: "", summary: "", date: "" };
  const rows: ReportRow[] = [
    ...stats.map((s) => ({ section: `Metric (${ACTIVITY_REPORT.weekLabel})`, ...blank, metric: s.label, value: s.value })),
    ...SUBMITTED_OUTCOMES.map((o) => ({ section: "Submitted outcome", farmer: o.farmerName, kebele: o.kebele, purpose: o.purpose, summary: o.summary, date: o.date, metric: "", value: "" })),
  ];
  downloadTable(format, `activity-report-${fileDate()}`, rows, [
    { header: "Section", value: (r) => r.section },
    { header: "Metric", value: (r) => r.metric },
    { header: "Value", value: (r) => r.value },
    { header: "Farmer", value: (r) => r.farmer },
    { header: "Kebele", value: (r) => r.kebele },
    { header: "Purpose", value: (r) => r.purpose },
    { header: "Summary", value: (r) => r.summary },
    { header: "Date", value: (r) => r.date },
  ]);
}

export function ActivityReport() {
  const stats = [
    {
      label: "Visits completed",
      value: ACTIVITY_REPORT.visitsCompleted,
      accent: "border-l-brand-green",
      tile: "bg-brand-tint text-brand-green",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" />
        </svg>
      ),
    },
    {
      label: "Farmers reached",
      value: ACTIVITY_REPORT.farmersReached,
      accent: "border-l-blue-600",
      tile: "bg-info-tint text-blue-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M21.5 20a6.5 6.5 0 00-4.5-6.2" />
        </svg>
      ),
    },
    {
      label: "Advisories issued",
      value: ACTIVITY_REPORT.advisoriesIssued,
      accent: "border-l-violet-600",
      tile: "bg-purple-100 text-violet-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 11v2a1 1 0 001 1h2l7 4V6L6 10H4a1 1 0 00-1 1zM17 9a4 4 0 010 6M6 14v4" />
        </svg>
      ),
    },
    {
      label: "Issues raised",
      value: ACTIVITY_REPORT.issuesRaised,
      accent: "border-l-danger",
      tile: "bg-danger-tint text-danger",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4M12 17.5h.01" />
        </svg>
      ),
    },
    {
      label: "Follow-ups",
      value: ACTIVITY_REPORT.followUps,
      accent: "border-l-amber-600",
      tile: "bg-warning-wash text-amber-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
        </svg>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden p-0 shadow-card">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-3.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Activity report — {ACTIVITY_REPORT.weekLabel}</h2>
          <p className="mt-0.5 text-[13px] text-muted">Auto-compiled from submitted visit outcomes</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/visits"
            className="inline-flex h-9 items-center whitespace-nowrap rounded-md border border-brand-green bg-white px-3.5 text-[13.5px] font-semibold text-brand-green transition-colors hover:bg-brand-wash"
          >
            Activity Log &rarr;
          </Link>
          <ExportButton onExport={(format) => exportReport(format, stats)} />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[14px] font-semibold text-ink">Submitted visit outcomes</h3>
          <ul className="flex flex-col gap-2.5">
            {SUBMITTED_OUTCOMES.map((row) => (
              <li
                key={row.farmerName}
                className="grid grid-cols-1 items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-[13.5px] text-slate-700 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.6fr)_auto]"
              >
                <div className="flex items-center gap-3">
                  <FarmerAvatar name={row.farmerName} className="bg-info-tint text-blue-600" />
                  <div className="leading-tight">
                    <p className="text-[14px] font-semibold text-ink">{row.farmerName}</p>
                    <p className="mt-0.5 text-[13px] text-muted">{row.kebele}</p>
                  </div>
                </div>
                <p>{row.purpose}</p>
                <p className="text-slate-600">{row.summary}</p>
                <p className="text-slate-600 md:text-right">{row.date}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
