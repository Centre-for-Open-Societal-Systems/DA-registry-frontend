"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportButton } from "@/components/ui/ExportButton";
import { cn } from "@/lib/utils";
import { FARMERS } from "@/features/farmers";
import { FarmerAvatar } from "@/features/farmers";
import { StatusPill } from "@/features/farmers";
import {
  applyFilters,
  countActiveFilters,
  CROP_OPTIONS,
  EMPTY_FILTERS,
  FARMER_FILTER_FIELDS,
  KEBELE_OPTIONS,
  STATUS_OPTIONS,
  type FarmerFilters,
} from "@/features/farmers";
import { Checkbox } from "@/components/ui/Checkbox";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer } from "@/components/ui/AdvancedFiltersDrawer";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { TablePagination, usePagination } from "@/components/ui/TablePagination";
import { RowAction } from "@/components/ui/RowAction";
import { Banner } from "@/components/ui/Banner";
import { downloadCsv, fileDate, type CsvColumn } from "@/lib/download";
import type { Farmer } from "@/features/farmers";

const SEARCH_PLACEHOLDER = searchPlaceholder(["Farmer Details", "Kebele", "Crop", "Registered date", "Status"]);

// The visible table columns (Farmer Details split into name / email / phone).
const EXPORT_COLUMNS: CsvColumn<Farmer>[] = [
  { header: "Farmer ID", value: (f) => f.id },
  { header: "Name", value: (f) => f.name },
  { header: "Email", value: (f) => f.email },
  { header: "Phone", value: (f) => f.phone },
  { header: "Kebele", value: (f) => f.kebele },
  { header: "Woreda", value: (f) => f.woreda },
  { header: "Crop", value: (f) => f.crop },
  { header: "Land (ha)", value: (f) => f.landHa },
  { header: "Registered date", value: (f) => `${f.registeredAt} ${f.registeredTime}` },
  { header: "Status", value: (f) => f.status },
  { header: "Status reason", value: (f) => f.statusReason ?? "" },
];

export function FarmersTable() {
  // First four rows start selected, matching the design's selected-state example.
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(FARMERS.slice(0, 4).map((f) => f.id)),
  );
  const [filters, setFilters] = useState<FarmerFilters>(EMPTY_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const rows = applyFilters(FARMERS, filters).filter((farmer) => matchesQuery(query, farmer));
  const activeFilterCount = countActiveFilters(filters);
  const { pageRows, paginationProps } = usePagination(rows);
  const allSelected = rows.length > 0 && rows.every((f) => selected.has(f.id));

  const setColumnFilter = (key: keyof FarmerFilters) => (next: Set<string>) =>
    setFilters((prev) => ({ ...prev, [key]: next }));

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((f) => f.id)));

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[15px] font-semibold text-ink">My Farmers</h2>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-green px-1.5 text-[12px] font-semibold text-white">
            {selected.size}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

          <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />

          <ExportButton
            label="Export Report"
            disabled={rows.length === 0}
            onClick={() => {
              downloadCsv(`farmers-report-${fileDate()}.csv`, rows, EXPORT_COLUMNS);
              setNotice(`Exported ${rows.length} farmer${rows.length === 1 ? "" : "s"} matching the current search and filters (CSV).`);
            }}
          />
        </div>
      </div>

      {notice && <Banner tone="success" className="mx-4 mb-3" onDismiss={() => setNotice(null)}>{notice}</Banner>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-y border-line bg-surface text-[13px] font-medium text-slate-700">
              <th className="w-16 px-6 py-3">
                <Checkbox checked={allSelected} onChange={toggleAll} aria-label="Select all farmers" />
              </th>
              <th className="px-4 py-3 font-medium">Farmer Details</th>
              <th className="px-4 py-3 font-medium">
                <FilterDropdown label="Kebele" allLabel="All kebeles" options={KEBELE_OPTIONS} selected={filters.kebele} onApply={setColumnFilter("kebele")} />
              </th>
              <th className="px-4 py-3 font-medium">
                <FilterDropdown label="Crop" allLabel="All crops" options={CROP_OPTIONS} selected={filters.crop} onApply={setColumnFilter("crop")} />
              </th>
              <th className="px-4 py-3 text-center font-medium">Registered date</th>
              <th className="px-4 py-3 text-center font-medium">
                <FilterDropdown label="Status" allLabel="All Status" options={STATUS_OPTIONS} selected={filters.status} onApply={setColumnFilter("status")} />
              </th>
              <th className="px-4 py-3 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="text-[14px] text-slate-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6"><EmptyState title="No farmers match the selected filters" hint="Clear a filter or try a different search." /></td>
              </tr>
            )}
            {pageRows.map((farmer) => {
              const isSelected = selected.has(farmer.id);
              return (
                <tr
                  key={farmer.id}
                  className={cn(
                    "border-b border-line-soft transition-colors last:border-0",
                    isSelected ? "bg-brand-wash" : "hover:bg-surface",
                  )}
                >
                  <td className="px-4 py-3.5">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleOne(farmer.id)}
                      aria-label={`Select ${farmer.name}`}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <FarmerAvatar name={farmer.name} avatar={farmer.avatar} />
                      <div className="leading-tight">
                        <p className="font-medium text-ink">{farmer.name}</p>
                        <p className="mt-0.5 text-[13px] text-muted">{farmer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">{farmer.kebele}</td>
                  <td className="px-4 py-3.5">
                    {farmer.crop} {farmer.landHa} ha
                  </td>
                  <td className="px-4 py-3.5 text-center leading-tight">
                    {farmer.registeredAt}
                    <br />
                    <span className="text-slate-600">- {farmer.registeredTime}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusPill status={farmer.status} reason={farmer.statusReason} />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <RowAction href={`/farmers/${farmer.id}`} icon="view">View</RowAction>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TablePagination {...paginationProps} itemLabel="farmers" />

      <AdvancedFiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        fields={FARMER_FILTER_FIELDS}
        filters={filters}
        onApply={(next) =>
          setFilters({
            kebele: next.kebele ?? new Set(),
            crop: next.crop ?? new Set(),
            status: next.status ?? new Set(),
          })
        }
      />
    </Card>
  );
}
