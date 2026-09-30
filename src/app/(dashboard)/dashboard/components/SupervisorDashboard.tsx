"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { Pill } from "@/components/ui/Pill";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { TablePagination, usePagination } from "@/components/ui/TablePagination";
import { cn } from "@/lib/utils";
import { STATUS_TONE, WOREDA_HEALTH, type KebeleStatus } from "@/features/dashboard";
import { DateRangeDropdown } from "./DateRangeDropdown";

const STATUSES: KebeleStatus[] = ["On track", "Watch", "At risk"];
const BAR_COLOUR: Record<KebeleStatus, string> = { "On track": "bg-brand-green", Watch: "bg-orange-600", "At risk": "bg-danger" };
const TRACK_COLOUR: Record<KebeleStatus, string> = { "On track": "bg-green-100", Watch: "bg-yellow-100", "At risk": "bg-red-50" };
const PCT_COLOUR: Record<KebeleStatus, string> = { "On track": "text-brand-green", Watch: "text-orange-600", "At risk": "text-danger" };

const icon = (d: string) => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const TH = "whitespace-nowrap px-4 py-3 font-medium";

// Supervisor home: woreda programme health with kebele breakdown (role home varies — FSD §2.4 / §3.9).
export function SupervisorDashboard() {
  const [woredaIdx, setWoredaIdx] = useState(0);
  const [kebeleFilter, setKebeleFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const w = WOREDA_HEALTH[woredaIdx];

  const kebeleOptions: FilterOption[] = w.kebeles.map((k) => ({ value: k.kebele, label: k.kebele, count: 1 }));
  const statusOptions: FilterOption[] = STATUSES.map((s) => ({ value: s, label: s, count: w.kebeles.filter((k) => k.status === s).length }));
  const countOf = (s: KebeleStatus) => w.kebeles.filter((k) => k.status === s).length;

  const rows = useMemo(
    () => w.kebeles.filter((k) => (kebeleFilter.size === 0 || kebeleFilter.has(k.kebele)) && (statusFilter.size === 0 || statusFilter.has(k.status))),
    [w, kebeleFilter, statusFilter],
  );

  const { pageRows, paginationProps } = usePagination(rows);
  const firstIndex = (paginationProps.page - 1) * paginationProps.pageSize;

  const selectWoreda = (i: number) => {
    setWoredaIdx(i);
    setKebeleFilter(new Set());
    setStatusFilter(new Set());
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        tabBar={<SegmentTabs label="Woreda" tabs={WOREDA_HEALTH.map((item, i) => ({ key: String(i), label: item.woreda }))} active={String(woredaIdx)} onChange={(k) => selectWoreda(Number(k))} />}
        title={`${w.woreda} - Programme Health`}
        description={`Kebele-level performance across ${w.kebeles.length} kebeles · update ${w.updatedAt}`}
        actions={<DateRangeDropdown />}
      />

      {/* Live strip */}
      <div role="status" className="flex items-center gap-2.5 rounded-lg border border-brand-border bg-brand-mint px-4 py-2.5 text-[13px] text-ink-soft">
        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-green" aria-hidden="true" />
        <p>
          <span className="font-semibold text-ink">Live:</span> Programme health metrics are updated in real-time from field agent submissions across all kebeles in {w.woreda}.
        </p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Farmer registered" value={w.stats.farmers.toLocaleString()} accent="border-l-blue-600" tile="bg-blue-50 text-blue-600" icon={icon("M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z")} />
        <StatCard label="Active agents" value={String(w.stats.activeAgents)} accent="border-l-violet-600" tile="bg-violet-50 text-violet-600" icon={icon("M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0")} />
        <StatCard label="Avg. data quality" value={`${w.stats.dataQuality}/100`} accent="border-l-brand-green" tile="bg-brand-tint text-brand-green" icon={icon("M22 7l-8.5 8.5-5-5L2 17M16 7h6v6")} />
        <StatCard label="Open grievances" value={String(w.stats.openGrievances)} accent="border-l-danger" tile="bg-danger-wash text-danger" icon={icon("M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01")} />
      </div>

      {/* Kebele breakdown */}
      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[16px] font-semibold text-ink">Kebele breakdown - {w.woreda}</h2>
          {/* Quick status chips — they drive the same status filter as the column header. */}
          <div className="flex flex-wrap items-center gap-2">
            {STATUSES.map((s) => {
              const active = statusFilter.size === 1 && statusFilter.has(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(active ? new Set() : new Set([s]))}
                  aria-pressed={active}
                  className={cn("rounded-full transition-shadow", active && "ring-2 ring-brand-green/40 ring-offset-1")}
                >
                  <Pill tone={STATUS_TONE[s]}>
                    {s} <span className="ml-1 text-[11px]">{countOf(s)}</span>
                  </Pill>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-y border-line bg-surface text-[12.5px] uppercase tracking-wide text-slate-700">
                <th className={cn(TH, "w-16 text-center")}>S.No.</th>
                <th className={TH}><FilterDropdown label="KEBELE" allLabel="All kebeles" options={kebeleOptions} selected={kebeleFilter} onApply={setKebeleFilter} /></th>
                <th className={cn(TH, "text-center")}>Farmers</th>
                <th className={cn(TH, "text-center")}>Agents</th>
                <th className={cn(TH, "text-center")}>Visit %</th>
                <th className={cn(TH, "text-center")}>Last sync</th>
                <th className={cn(TH, "text-center")}><FilterDropdown label="STATUS" allLabel="All statuses" options={statusOptions} selected={statusFilter} onApply={setStatusFilter} /></th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-slate-700">
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6"><EmptyState title="No kebeles match the selected filters" hint="Clear a filter to see every kebele." /></td></tr>
              )}
              {pageRows.map((k, i) => (
                <tr key={`${k.kebele}-${i}`} className="border-b border-line-soft transition-colors last:border-0 hover:bg-surface">
                  <td className="px-4 py-3 text-center">{firstIndex + i + 1}</td>
                  <td className="px-4 py-3 text-ink">{k.kebele}</td>
                  <td className="px-4 py-3 text-center">{k.farmers.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">{k.agents}</td>
                  <td className="px-4 py-3">
                    <div className="mx-auto flex w-[150px] flex-col gap-1">
                      <span className={cn("self-end text-[12px] font-semibold", PCT_COLOUR[k.status])}>{k.visitPct}%</span>
                      <span className={cn("h-1 overflow-hidden rounded-full", TRACK_COLOUR[k.status])}>
                        <span className={cn("block h-full rounded-full", BAR_COLOUR[k.status])} style={{ width: `${k.visitPct}%` }} />
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">{k.lastSync}</td>
                  <td className="px-4 py-3 text-center"><Pill tone={STATUS_TONE[k.status]}>{k.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && <TablePagination {...paginationProps} itemLabel={`${w.woreda} List`} />}
      </Card>
    </div>
  );
}
