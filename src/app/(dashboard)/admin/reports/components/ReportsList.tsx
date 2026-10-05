"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { DateRangeDropdown } from "@/app/(dashboard)/dashboard/components/DateRangeDropdown";
import { useAuthStore } from "@/store/useAuthStore";
import { formatLabel, type ExportFormat } from "@/lib/export";

interface Report {
  id: string;
  name: string;
  description: string;
  scope: "Woreda" | "Region" | "National";
  part: 1 | 2;
  lastRun: string;
  formats: ExportFormat[];
}

const REPORTS: Report[] = [
  { id: "r-registry", name: "DA master registry extract", description: "All DAs with Fayda status, active status, kebele, farmer count and approval/publication state.", scope: "Region", part: 1, lastRun: "14 Sep 2026, 06:00", formats: ["csv", "xlsx"] },
  { id: "r-coverage", name: "Kebele coverage", description: "Agents, linked farmers and households per kebele; uncovered and flagged kebeles.", scope: "Woreda", part: 1, lastRun: "14 Sep 2026, 06:00", formats: ["pdf", "csv"] },
  { id: "r-sync", name: "MoA reconciliation report", description: "Every registry-sync event with direction, outcome, retry count and reconciliation decision.", scope: "National", part: 1, lastRun: "08 Sep 2026, 10:30", formats: ["csv"] },
  { id: "r-exceptions", name: "Data-quality exceptions", description: "Open and resolved exceptions by kind, age and owning module.", scope: "Region", part: 1, lastRun: "14 Sep 2026, 06:00", formats: ["xlsx"] },
  { id: "r-visits", name: "Visit activity", description: "Planned vs completed visits, on-time rate, missed/rescheduled by agent and kebele.", scope: "Woreda", part: 1, lastRun: "15 Sep 2026, 06:00", formats: ["pdf", "csv"] },
  { id: "r-broadcast", name: "Dissemination log", description: "Broadcast dispatches with audience, channels and delivery outcomes.", scope: "Woreda", part: 1, lastRun: "14 Sep 2026, 06:00", formats: ["csv"] },
  { id: "r-grievance", name: "Grievance summary (external)", description: "Case IDs and categories by kebele — identity fields withheld per FR-12a.", scope: "Woreda", part: 1, lastRun: "15 Sep 2026, 06:00", formats: ["pdf"] },
  { id: "r-sla", name: "SLA compliance", description: "Visit cadence and response timeliness at DA, Woreda and regional level.", scope: "Region", part: 2, lastRun: "—", formats: ["pdf"] },
];

const PERIODS = ["This week", "This month", "This quarter", "Meher 2026"] as const;
// Download buttons always read CSV → XLSX → PDF, whatever order a report lists its formats in.
const FORMAT_ORDER: ExportFormat[] = ["csv", "xlsx", "pdf"];

export function ReportsList() {
  const role = useAuthStore((s) => s.role);
  const [period, setPeriod] = useState<string>("This month");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const scopeNote = role === "Executive" ? "Regional roll-ups; operational DA detail by drill-down only." : role === "Supervisor" ? "Scoped to your Woreda." : "For all regions.";

  // Part 2 reports are not exportable yet, so they stay off the list.
  const q = query.trim().toLowerCase();
  const reports = REPORTS.filter((r) => r.part === 1 && (!q || r.name.toLowerCase().includes(q)));

  return (
    <>
      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}
      <Card className="overflow-visible p-0 shadow-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line-soft px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13.5px] text-ink-soft">{scopeNote}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={query} onChange={setQuery} placeholder="Search by Report name..." className="sm:[&_input]:w-[215px]" />
            <DateRangeDropdown ranges={PERIODS} defaultValue={period} onChange={setPeriod} />
          </div>
        </div>

        {/* Report cards */}
        {reports.length === 0 ? (
          <div className="px-4 py-8">
            <EmptyState title="No reports match your search" hint="Try a different report name." />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            {reports.map((r) => (
              <div key={r.id} className="flex flex-col rounded-xl border border-line px-4 py-4 transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold text-ink">{r.name}</h3>
                  <Pill tone="slate">{r.scope}</Pill>
                </div>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{r.description}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] text-muted">Last run {r.lastRun}</span>
                  <div className="flex gap-2">
                    {FORMAT_ORDER.filter((f) => r.formats.includes(f)).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setNotice(`${r.name} (${formatLabel(f)}, ${period}) queued — you'll be notified when the export is ready.`)}
                        aria-label={`Download ${r.name} as ${f.toUpperCase()}`}
                        className="h-7 rounded-md border border-brand-green bg-white px-3 text-[12px] font-semibold uppercase tracking-wide text-brand-green transition-colors hover:bg-brand-wash"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
