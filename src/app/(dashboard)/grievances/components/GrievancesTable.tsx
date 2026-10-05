"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowAction } from "@/components/ui/RowAction";
import { AdvancedFiltersDrawer, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import {
  bucketOf,
  GRIEVANCE_CATEGORY_OPTIONS,
  GRIEVANCE_FILTER_FIELDS,
  GRIEVANCE_PRIORITY_OPTIONS,
  GRIEVANCE_STATUS_OPTIONS,
  GRIEVANCES,
  grievanceStatsFor,
} from "@/features/grievances";
import { GrievanceBucketPill, GrievancePriorityPill } from "@/features/grievances";
import { GrievanceDetailModal } from "@/features/grievances";
import type { Grievance } from "@/features/grievances";
import { GrievanceStats, type StatKey } from "./GrievanceStats";
import { RaiseGrievanceButton } from "./RaiseGrievanceButton";
import { ServiceStatusBanner } from "./ServiceStatusBanner";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { TablePagination } from "@/components/ui/TablePagination";

const SEARCH_PLACEHOLDER = searchPlaceholder(["Ticket ID", "Details", "Category", "Status", "Priority", "Submitted"]);

type RaisedBy = "All" | "DA" | "Farmer";

// Table heading follows the active "Raised by" tab.
const RAISED_BY_HEADINGS: Record<RaisedBy, { title: string; description: string }> = {
  All: { title: "All Grievances", description: "Track and manage all reported grievances." },
  DA: { title: "Raised by DA", description: "Grievances you raised for yourself or on behalf of a farmer." },
  Farmer: { title: "Raised by Farmer", description: "Grievances farmers raised directly." },
};

interface Filters extends FilterSelection {
  category: Set<string>;
  status: Set<string>;
  priority: Set<string>;
  region: Set<string>;
}

const EMPTY: Filters = { category: new Set(), status: new Set(), priority: new Set(), region: new Set() };

export function GrievancesTable() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [query, setQuery] = useState("");
  // FR-12 raised-by filter: DA-originated vs farmer-originated (external service records both)
  const [raisedBy, setRaisedBy] = useState<RaisedBy>("All");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;

  const setFilter = (key: keyof Filters) => (next: Set<string>) => {
    setFilters((prev) => ({ ...prev, [key]: next }));
    setPage(1);
  };

  // Every filter except status: the stat cards count these rows, so each card's number is exactly
  // what the table shows once that card (or the matching Status filter) is selected.
  const scoped = GRIEVANCES.filter(
    (g) =>
      (raisedBy === "All" || g.raisedBy === raisedBy) &&
      (filters.category.size === 0 || filters.category.has(g.category)) &&
      (filters.priority.size === 0 || filters.priority.has(g.priority)) &&
      (filters.region.size === 0 || filters.region.has(g.region)) &&
      matchesQuery(query, g),
  );
  const rows = scoped.filter((g) => filters.status.size === 0 || filters.status.has(bucketOf(g.status)));
  const stats = grievanceStatsFor(scoped);
  // The cards and the Status filter share one selection; a multi-status filter highlights no single card.
  const activeCard: StatKey = filters.status.size === 0 ? "All" : filters.status.size === 1 ? ([...filters.status][0] as StatKey) : "All";

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <PageHeader
        tabBar={
          <SegmentTabs<RaisedBy>
            label="Raised by"
            tabs={[{ key: "All", label: "All" }, { key: "DA", label: "Raised by DA" }, { key: "Farmer", label: "Raised by farmer" }]}
            active={raisedBy}
            onChange={(k) => { setRaisedBy(k); setPage(1); }}
          />
        }
        title="Grievances"
        description="Raise and track grievances for yourself or on behalf of a farmer. Triage and resolution happen in the external Grievance Service - this surface is read-only for case handling."
        actions={<RaiseGrievanceButton className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md bg-brand-green px-5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-green-dark" />}
      />
      <ServiceStatusBanner />
      <GrievanceStats
        active={activeCard}
        counts={stats}
        onSelect={(key) => setFilter("status")(key === "All" ? new Set() : new Set([key]))}
      />

      <Card className="overflow-hidden p-0 shadow-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">{RAISED_BY_HEADINGS[raisedBy].title}</h2>
            <p className="mt-0.5 text-[13px] text-ink-soft">{RAISED_BY_HEADINGS[raisedBy].description}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <SearchInput value={query} onChange={(value) => {
                setQuery(value);
                setPage(1);
              }} placeholder={SEARCH_PLACEHOLDER} />

            <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[180px]" />
              <col />
              <col className="w-[120px]" />
              <col className="w-[110px]" />
              <col className="w-[135px]" />
              <col className="w-[160px]" />
              <col className="w-[110px]" />
            </colgroup>
            <thead>
              <tr className="border-y border-line bg-surface text-[14px] font-semibold text-slate-500">
                <th className="whitespace-nowrap px-4 py-3 font-semibold">Ticket ID</th>
                <th className="px-4 py-3 font-semibold">Details</th>
                <th className="px-4 py-3 font-semibold">
                  <FilterDropdown label="Category" allLabel="All categories" options={GRIEVANCE_CATEGORY_OPTIONS} selected={filters.category} onApply={setFilter("category")} />
                </th>
                <th className="px-4 py-3 font-semibold">
                  <FilterDropdown label="Priority" allLabel="All priorities" options={GRIEVANCE_PRIORITY_OPTIONS} selected={filters.priority} onApply={setFilter("priority")} />
                </th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">
                  <FilterDropdown label="Status" allLabel="All statuses" options={GRIEVANCE_STATUS_OPTIONS} selected={filters.status} onApply={setFilter("status")} />
                </th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-slate-700">
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6"><EmptyState title="No grievances match the selected filters" hint="Clear a filter or try a different search." /></td>
                </tr>
              )}
              {pageRows.map((g) => (
                <tr key={g.ticketId} className="border-b border-line-soft transition-colors last:border-0 hover:bg-surface">
                  <td className="whitespace-nowrap px-3 py-4 text-[13px] font-semibold text-ink">{g.ticketId}</td>
                  <td className="px-4 py-4">
                    <p className="truncate text-[14.5px] font-semibold text-ink" title={g.title}>{g.title}</p>
                    <p className="mt-1 text-[13px] text-muted">
                      {g.submitter} · {g.region}, {g.woreda}
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted">{g.type}</p>
                    <p className="mt-1 flex items-center gap-3 text-[12px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.4 11.05l-9.2 9.2a6 6 0 01-8.5-8.5l9.2-9.2a4 4 0 015.7 5.7l-9.2 9.2a2 2 0 01-2.8-2.8l8.5-8.5" />
                        </svg>
                        {g.attachments}
                      </span>
                      {g.responses > 0 && (
                        <span className="font-medium text-brand-green">
                          {g.responses} response{g.responses > 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-[13.5px]">{g.category}</td>
                  <td className="px-4 py-4"><GrievancePriorityPill priority={g.priority} /></td>
                  <td className="whitespace-nowrap px-4 py-4 text-[13px] leading-snug text-slate-700">
                    {g.submittedAt.split(", ").slice(0, 2).join(", ")},
                    <br />
                    {g.submittedAt.split(", ")[2]}
                  </td>
                  <td className="px-4 py-4">
                    <GrievanceBucketPill bucket={bucketOf(g.status)} />
                    {/* Service sub-status (e.g. Submitted, Assigned) when it differs from the card bucket */}
                    {g.status !== bucketOf(g.status) && <p className="mt-1 text-[12px] text-muted">{g.status}</p>}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <RowAction onClick={() => setSelected(g)} icon="view">View</RowAction>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          itemLabel="grievances"
          page={currentPage}
          pageSize={pageSize}
          total={rows.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </Card>

      <AdvancedFiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        fields={GRIEVANCE_FILTER_FIELDS}
        filters={filters}
        onApply={(next) => {
          setFilters({
            category: next.category ?? new Set(),
            status: next.status ?? new Set(),
            priority: next.priority ?? new Set(),
            region: next.region ?? new Set(),
          });
          setPage(1);
        }}
      />

      {selected && <GrievanceDetailModal key={selected.ticketId} grievance={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
