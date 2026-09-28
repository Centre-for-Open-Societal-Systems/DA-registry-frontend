"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowAction } from "@/components/ui/RowAction";
import { AdvancedFiltersDrawer, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { cn } from "@/lib/utils";
import {
  bucketOf,
  GRIEVANCE_CATEGORY_OPTIONS,
  GRIEVANCE_FILTER_FIELDS,
  GRIEVANCE_PRIORITY_OPTIONS,
  GRIEVANCE_STATUS_OPTIONS,
  GRIEVANCES,
} from "@/features/grievances/data";
import { GrievancePriorityPill, GrievanceStatusPill } from "@/features/grievances/components/GrievancePills";
import { GrievanceDetailModal } from "@/features/grievances/components/GrievanceDetailModal";
import type { Grievance } from "@/features/grievances/types";
import { GrievanceStats, type StatKey } from "./GrievanceStats";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { TablePagination } from "@/components/ui/TablePagination";

const SEARCH_PLACEHOLDER = searchPlaceholder(["Ticket ID", "Details", "Category", "Status", "Priority", "Submitted"]);

interface Filters extends FilterSelection {
  category: Set<string>;
  status: Set<string>;
  priority: Set<string>;
  region: Set<string>;
}

const EMPTY: Filters = { category: new Set(), status: new Set(), priority: new Set(), region: new Set() };

export function GrievancesTable() {
  const [bucket, setBucket] = useState<StatKey>("All");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [query, setQuery] = useState("");
  // FR-12 raised-by filter: DA-originated vs farmer-originated (external service records both)
  const [raisedBy, setRaisedBy] = useState<"All" | "DA" | "Farmer">("All");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;

  const setFilter = (key: keyof Filters) => (next: Set<string>) => {
    setFilters((prev) => ({ ...prev, [key]: next }));
    setPage(1);
  };

  const rows = GRIEVANCES.filter(
    (g) =>
      (bucket === "All" || bucketOf(g.status) === bucket) &&
      (raisedBy === "All" || g.raisedBy === raisedBy) &&
      (filters.category.size === 0 || filters.category.has(g.category)) &&
      (filters.status.size === 0 || filters.status.has(g.status)) &&
      (filters.priority.size === 0 || filters.priority.has(g.priority)) &&
      (filters.region.size === 0 || filters.region.has(g.region)) &&
      matchesQuery(query, g),
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const start = rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, rows.length);

  return (
    <>
      <GrievanceStats
        active={bucket}
        onSelect={(key) => {
          setBucket(key);
          setPage(1);
        }}
      />

      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Grievance Records</h2>
            <span className="whitespace-nowrap rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-0.5 text-[12.5px] text-[#4a5568]">
              Showing {start}–{end} of {rows.length}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            {/* Segments fill the row on phones with short labels; full labels from sm up */}
            <div role="group" aria-label="Raised by" className="flex h-9 items-center rounded-md border border-zinc-200 bg-[#F8FAFC] p-0.5">
              {(["All", "DA", "Farmer"] as const).map((k) => (
                <button key={k} type="button" onClick={() => { setRaisedBy(k); setPage(1); }} className={cn("h-8 flex-1 whitespace-nowrap rounded px-3 text-[13px] font-medium transition-colors sm:flex-none", raisedBy === k ? "bg-white text-brand-green shadow-sm" : "text-[#4a5568]")}>
                  {k === "All" ? "All" : (
                    <>
                      <span className="sm:hidden">{k === "DA" ? "By DA" : "By farmer"}</span>
                      <span className="hidden sm:inline">{k === "DA" ? "Raised by DA" : "Raised by farmer"}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
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
              <col className="w-[110px]" />
              <col className="w-[160px]" />
              <col className="w-[110px]" />
              <col className="w-[135px]" />
              <col className="w-[110px]" />
            </colgroup>
            <thead>
              <tr className="border-y border-[#E5E7EB] bg-[#F8FAFC] text-[13px] font-medium text-[#334155]">
                <th className="whitespace-nowrap px-4 py-3 font-medium">Ticket ID</th>
                <th className="px-4 py-3 font-medium">Details</th>
                <th className="px-4 py-3 font-medium">
                  <FilterDropdown label="Category" allLabel="All categories" options={GRIEVANCE_CATEGORY_OPTIONS} selected={filters.category} onApply={setFilter("category")} />
                </th>
                <th className="px-4 py-3 font-medium">
                  <FilterDropdown label="Status" allLabel="All statuses" options={GRIEVANCE_STATUS_OPTIONS} selected={filters.status} onApply={setFilter("status")} />
                </th>
                <th className="px-4 py-3 font-medium">
                  <FilterDropdown label="Priority" allLabel="All priorities" options={GRIEVANCE_PRIORITY_OPTIONS} selected={filters.priority} onApply={setFilter("priority")} />
                </th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#334155]">
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6"><EmptyState title="No grievances match the selected filters" hint="Clear a filter or try a different search." /></td>
                </tr>
              )}
              {pageRows.map((g) => (
                <tr key={g.ticketId} className="border-b border-[#F1F3F4] transition-colors last:border-0 hover:bg-[#F8FAFC]">
                  <td className="whitespace-nowrap px-3 py-4 text-[13px] font-semibold text-[#1a2b3c]">{g.ticketId}</td>
                  <td className="px-4 py-4">
                    <p className="truncate text-[14.5px] font-semibold text-[#1a2b3c]" title={g.title}>{g.title}</p>
                    <p className="mt-1 text-[13px] text-[#64748b]">
                      {g.submitter} · {g.region}, {g.woreda}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#64748b]">{g.type}</p>
                    <p className="mt-1 flex items-center gap-3 text-[12px] text-[#64748b]">
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
                  <td className="px-4 py-4"><GrievanceStatusPill status={g.status} /></td>
                  <td className="px-4 py-4"><GrievancePriorityPill priority={g.priority} /></td>
                  <td className="whitespace-nowrap px-4 py-4 text-[13px] leading-snug text-[#334155]">
                    {g.submittedAt.split(", ").slice(0, 2).join(", ")},
                    <br />
                    {g.submittedAt.split(", ")[2]}
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
