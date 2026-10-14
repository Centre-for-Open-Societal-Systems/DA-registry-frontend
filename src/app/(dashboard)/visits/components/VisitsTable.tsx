"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowAction } from "@/components/ui/RowAction";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { AdvancedFiltersDrawer, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { TablePagination, usePagination } from "@/components/ui/TablePagination";
import { FarmerAvatar } from "@/features/farmers";
import { VisitStatusPill } from "@/features/visits";
import { VisitDetailsModal } from "@/features/visits";
import { RescheduleVisitModal } from "@/features/visits";
import {
  VISIT_AGENT_OPTIONS,
  VISIT_FILTER_FIELDS,
  VISIT_KEBELE_OPTIONS,
  VISIT_STATUS_OPTIONS,
  VISITS,
  supervisorVisitsFor,
} from "@/features/visits";
import type { VisitRecord } from "@/features/visits";

const SEARCH_PLACEHOLDER = searchPlaceholder(["Date & time", "Agent", "Farmer", "Kebele", "Purpose", "Status"]);

interface VisitFilters extends FilterSelection {
  agent: Set<string>;
  kebele: Set<string>;
  status: Set<string>;
}

const EMPTY: VisitFilters = { agent: new Set(), kebele: new Set(), status: new Set() };

type ActiveModal = { type: "view" | "reschedule"; visit: VisitRecord } | null;

export function VisitsTable() {
  // A DA sees only the visits their supervisor assigned to them; officers see every visit.
  const isDA = useAuthStore((s) => s.role === "DA");
  const daName = useAuthStore((s) => s.user?.name ?? "");
  const source = isDA ? supervisorVisitsFor(daName) : VISITS;
  const [filters, setFilters] = useState<VisitFilters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<ActiveModal>(null);
  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;

  const setFilter = (key: keyof VisitFilters) => (next: Set<string>) =>
    setFilters((prev) => ({ ...prev, [key]: next }));

  const rows = source.filter(
    (v) =>
      (filters.agent.size === 0 || filters.agent.has(v.agent)) &&
      (filters.kebele.size === 0 || filters.kebele.has(v.kebele)) &&
      (filters.status.size === 0 || filters.status.has(v.status)) &&
      matchesQuery(query, v),
  );

  const { pageRows, paginationProps } = usePagination(rows);

  return (
    <Card className="overflow-hidden p-0 shadow-card">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-[15px] font-semibold text-ink">Visits</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

          <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-y border-line bg-surface text-[14px] font-semibold text-slate-500">
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Date &amp; time</th>
              {/* A DA's own visits: no Agent column (it is always them); who assigned them lives on the Assignments page. */}
              {!isDA && (
                <th className="px-4 py-3 font-semibold">
                  <FilterDropdown label="Agent" allLabel="All agents" options={VISIT_AGENT_OPTIONS} selected={filters.agent} onApply={setFilter("agent")} />
                </th>
              )}
              <th className="px-4 py-3 font-semibold">Farmer</th>
              <th className="px-4 py-3 font-semibold">
                <FilterDropdown label="Kebele" allLabel="All kebeles" options={VISIT_KEBELE_OPTIONS} selected={filters.kebele} onApply={setFilter("kebele")} />
              </th>
              <th className="px-4 py-3 font-semibold">Purpose</th>
              <th className="px-4 py-3 text-center font-semibold">
                <FilterDropdown label="Status" allLabel="All Status" options={VISIT_STATUS_OPTIONS} selected={filters.status} onApply={setFilter("status")} />
              </th>
              <th className="px-4 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="text-[14px] text-slate-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={isDA ? 6 : 7}className="px-4 py-6"><EmptyState title="No visits match the selected filters" hint="Clear a filter or try a different search." /></td>
              </tr>
            )}
            {pageRows.map((v) => (
              <tr key={v.id} className="border-b border-line-soft transition-colors last:border-0 hover:bg-surface">
                <td className="px-4 py-3.5 leading-tight">
                  {v.date}
                  <br />
                  <span className="text-slate-600">- {v.time}</span>
                </td>
                {!isDA && <td className="px-4 py-3.5">{v.agent}</td>}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <FarmerAvatar name={v.farmerName} avatar={v.farmerAvatar} />
                    <div className="leading-tight">
                      <p className="font-medium text-ink">{v.farmerName}</p>
                      <p className="mt-0.5 text-[13px] text-muted">{v.farmerEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">{v.kebele}</td>
                <td className="px-4 py-3.5">{v.purpose}</td>
                <td className="px-4 py-3.5 text-center">
                  <VisitStatusPill status={v.status} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <RowAction onClick={() => setModal({ type: "view", visit: v })} icon="view">View</RowAction>
                    <RowAction tone="neutral" icon="calendar" onClick={() => setModal({ type: "reschedule", visit: v })}>Reschedule</RowAction>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination {...paginationProps} itemLabel="visits" />

      <AdvancedFiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        fields={isDA ? VISIT_FILTER_FIELDS.filter((f) => f.key !== "agent") : VISIT_FILTER_FIELDS}
        filters={filters}
        onApply={(next) =>
          setFilters({
            agent: next.agent ?? new Set(),
            kebele: next.kebele ?? new Set(),
            status: next.status ?? new Set(),
          })
        }
      />

      {modal?.type === "view" && (
        <VisitDetailsModal
          visit={modal.visit}
          onClose={() => setModal(null)}
          onReschedule={(visit) => setModal({ type: "reschedule", visit })}
        />
      )}
      {modal?.type === "reschedule" && <RescheduleVisitModal visit={modal.visit} onClose={() => setModal(null)} />}
    </Card>
  );
}
