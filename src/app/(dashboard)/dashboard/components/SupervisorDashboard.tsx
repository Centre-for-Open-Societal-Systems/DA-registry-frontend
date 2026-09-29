"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { Pill } from "@/components/ui/Pill";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig } from "@/components/ui/AdvancedFiltersDrawer";
import { TablePagination, usePagination } from "@/components/ui/TablePagination";
import { cn } from "@/lib/utils";
import { STATUS_TONE, WOREDA_HEALTH, type KebeleStatus } from "@/features/dashboard";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { SearchInput } from "@/components/ui/SearchInput";
import { DateRangeDropdown } from "./DateRangeDropdown";

const SEARCH_PLACEHOLDER = searchPlaceholder(["Kebele", "Farmers", "Agents", "Visit %", "Last sync", "Status"]);

const STATUSES: KebeleStatus[] = ["On track", "Watch", "At risk"];
const BAR_COLOUR: Record<KebeleStatus, string> = { "On track": "bg-brand-green", Watch: "bg-orange-600", "At risk": "bg-danger" };
const PCT_COLOUR: Record<KebeleStatus, string> = { "On track": "text-brand-green", Watch: "text-orange-600", "At risk": "text-danger" };

const icon = (d: string) => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

// Supervisor home: woreda programme health with kebele breakdown (role home varies — FSD §2.4 / §3.9).
export function SupervisorDashboard() {
  const [woredaIdx, setWoredaIdx] = useState(0);
  const [kebeleFilter, setKebeleFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const w = WOREDA_HEALTH[woredaIdx];

  const kebeleOptions: FilterOption[] = w.kebeles.map((k) => ({ value: k.kebele, label: k.kebele, count: 1 }));
  const statusOptions: FilterOption[] = STATUSES.map((s) => ({ value: s, label: s, count: w.kebeles.filter((k) => k.status === s).length }));
  const countOf = (s: KebeleStatus) => w.kebeles.filter((k) => k.status === s).length;
  const activeFilterCount = (kebeleFilter.size > 0 ? 1 : 0) + (statusFilter.size > 0 ? 1 : 0);
  const filterFields: FilterFieldConfig[] = [
    { key: "kebele", label: "Kebele", allLabel: "All kebeles", placeholder: "All kebeles", options: kebeleOptions },
    { key: "status", label: "Status", allLabel: "All statuses", placeholder: "All statuses", options: statusOptions },
  ];

  const rows = useMemo(
    () => w.kebeles.filter((k) => (kebeleFilter.size === 0 || kebeleFilter.has(k.kebele)) && (statusFilter.size === 0 || statusFilter.has(k.status)) && matchesQuery(query, k)),
    [w, kebeleFilter, statusFilter, query],
  );

  const { pageRows, paginationProps } = usePagination(rows);

  const selectWoreda = (i: number) => {
    setWoredaIdx(i);
    setKebeleFilter(new Set());
    setStatusFilter(new Set());
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header */}
      <Card className="relative z-50 flex w-full flex-col justify-between gap-4 px-4 py-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] md:flex-row md:items-center">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-ink sm:text-[22px]">{w.woreda} — Programme Health</h1>
          <p className="mt-1.5 text-[14px] text-ink-soft">Kebele-level performance across {w.kebeles.length} kebeles · update {w.updatedAt}</p>
        </div>
        <DateRangeDropdown />
      </Card>

      {/* Live banner */}
      <Banner tone="success" title="Live">KPI and SLA figures are aggregated at the kebele level and refreshed every 2 hours from the field agent sync.</Banner>

      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        {/* Woreda tabs */}
        <div role="tablist" className="flex overflow-x-auto border-b border-line">
          {WOREDA_HEALTH.map((item, i) => {
            const active = i === woredaIdx;
            return (
              <button
                key={item.woreda}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectWoreda(i)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 px-4 py-3.5 text-[14px] transition-colors",
                  active ? "-mb-px border-b-2 border-brand-green bg-brand-wash font-medium text-brand-green" : "text-ink-soft hover:text-ink",
                )}
              >
                {item.woreda}
                <span className={cn("rounded-full px-1.5 py-px text-[11px] font-semibold", active ? "bg-brand-green text-white" : "bg-line-soft text-slate-600")}>{item.kebeles.length}</span>
              </button>
            );
          })}
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Farmer registered" value={w.stats.farmers.toLocaleString()} accent="border-l-blue-600" tile="bg-blue-50 text-blue-600" icon={icon("M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z")} />
          <StatCard label="Active agents" value={String(w.stats.activeAgents)} accent="border-l-violet-600" tile="bg-violet-50 text-violet-600" icon={icon("M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0M12 12v8")} />
          <StatCard label="Avg. data quality" value={`${w.stats.dataQuality}/100`} accent="border-l-brand-green" tile="bg-brand-tint text-brand-green" icon={icon("M22 7l-8.5 8.5-5-5L2 17M16 7h6v6")} />
          <StatCard label="Open grievances" value={String(w.stats.openGrievances)} accent="border-l-danger" tile="bg-danger-wash text-danger" icon={icon("M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01")} />
        </div>

        {/* Kebele breakdown */}
        <div className="mx-4 mb-4 overflow-hidden rounded-xl border border-line">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <h2 className="text-[15px] font-semibold text-ink">Kebele breakdown — {w.woreda}</h2>
              {/* Quick status chips — they drive the same status filter as the column header. */}
              <div className="flex flex-wrap items-center gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter((prev) => (prev.size === 1 && prev.has(s) ? new Set() : new Set([s])))}
                    aria-pressed={statusFilter.size === 1 && statusFilter.has(s)}
                    className={cn("rounded-full transition-shadow", statusFilter.size === 1 && statusFilter.has(s) && "ring-2 ring-offset-1 ring-brand-green/40")}
                  >
                    <Pill tone={STATUS_TONE[s]}>
                      {s} <span className="ml-1 rounded bg-white/70 px-1.5 text-[11px]">{countOf(s)}</span>
                    </Pill>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
              <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

              <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-y border-line bg-surface text-[13px] font-medium text-slate-700">
                  <th className="whitespace-nowrap px-4 py-3 font-medium"><FilterDropdown label="Kebele" allLabel="All kebeles" options={kebeleOptions} selected={kebeleFilter} onApply={setKebeleFilter} /></th>
                  <th className="px-4 py-3 font-medium">Farmers</th>
                  <th className="px-4 py-3 text-center font-medium">Agents</th>
                  <th className="px-4 py-3 font-medium">Visit %</th>
                  <th className="px-4 py-3 font-medium">Last sync</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium"><FilterDropdown label="Status" allLabel="All statuses" options={statusOptions} selected={statusFilter} onApply={setStatusFilter} /></th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-slate-700">
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6"><EmptyState title="No kebeles match the selected filters" hint="Clear a filter or try a different search." /></td></tr>
                )}
                {pageRows.map((k, i) => (
                  <tr key={`${k.kebele}-${i}`} className="border-b border-line-soft transition-colors last:border-0 hover:bg-surface">
                    <td className="px-4 py-3.5 font-medium text-ink">{k.kebele}</td>
                    <td className="px-4 py-3.5">{k.farmers.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center">{k.agents}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-9 text-[13px] font-semibold", PCT_COLOUR[k.status])}>{k.visitPct}%</span>
                        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200">
                          <span className={cn("block h-full rounded-full", BAR_COLOUR[k.status])} style={{ width: `${k.visitPct}%` }} />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-ink-soft">{k.lastSync}</td>
                    <td className="px-4 py-3.5 text-right"><Pill tone={STATUS_TONE[k.status]}>{k.status}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 0 && <TablePagination {...paginationProps} itemLabel="kebeles" />}
        </div>

        <AdvancedFiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          fields={filterFields}
          filters={{ kebele: kebeleFilter, status: statusFilter }}
          onApply={(next) => {
            setKebeleFilter(next.kebele ?? new Set());
            setStatusFilter(next.status ?? new Set());
          }}
        />
      </Card>
    </div>
  );
}
