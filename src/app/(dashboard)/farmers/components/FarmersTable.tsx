"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { SEGMENTS, segmentName, useBeneficiariesStore } from "@/features/beneficiaries";
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
import { fileDate, type CsvColumn } from "@/lib/download";
import { downloadTable, formatLabel } from "@/lib/export";
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
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [filters, setFilters] = useState<FarmerFilters>(EMPTY_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<ReactNode>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [segmentId, setSegmentId] = useState(SEGMENTS[0].id);
  const linkBeneficiaries = useBeneficiariesStore((s) => s.link);

  const selectedFarmers = FARMERS.filter((f) => selected.has(f.id));

  const addToBeneficiaries = () => {
    const { added, skipped } = linkBeneficiaries([...selected], segmentId);
    const parts = [
      added.length > 0 && `${added.length} farmer${added.length === 1 ? "" : "s"} added to “${segmentName(segmentId)}” — Pending verification.`,
      skipped.length > 0 && `Already in this segment: ${skipped.join(", ")}.`,
    ].filter(Boolean);
    setNotice(
      <>
        {parts.join(" ")}{" "}
        <Link href="/beneficiaries" className="font-semibold underline">View beneficiaries</Link>
      </>,
    );
    setSelected(new Set());
    setIsAddOpen(false);
  };

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
    <Card className="overflow-hidden p-0 shadow-card">
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

          {selected.size > 0 && (
            <Button variant="brand" size="md" onClick={() => { setSegmentId(SEGMENTS[0].id); setIsAddOpen(true); }}>
              Add to beneficiaries ({selected.size})
            </Button>
          )}

          <ExportButton
            disabled={rows.length === 0}
            onExport={(format) => {
              downloadTable(format, `farmers-report-${fileDate()}`, rows, EXPORT_COLUMNS, "Farmers report");
              setNotice(`Exported ${rows.length} farmer${rows.length === 1 ? "" : "s"} matching the current search and filters (${formatLabel(format)}).`);
            }}
          />
        </div>
      </div>

      {notice && <Banner tone="success" className="mx-4 mb-3" onDismiss={() => setNotice(null)}>{notice}</Banner>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-y border-line bg-surface text-[14px] font-semibold text-slate-500">
              <th className="w-14 px-4 py-3 align-middle">
                <Checkbox checked={allSelected} onChange={toggleAll} aria-label="Select all farmers" />
              </th>
              <th className="px-4 py-3 font-semibold">Farmer Details</th>
              <th className="px-4 py-3 font-semibold">
                <FilterDropdown label="Kebele" allLabel="All kebeles" options={KEBELE_OPTIONS} selected={filters.kebele} onApply={setColumnFilter("kebele")} />
              </th>
              <th className="px-4 py-3 font-semibold">
                <FilterDropdown label="Crop" allLabel="All crops" options={CROP_OPTIONS} selected={filters.crop} onApply={setColumnFilter("crop")} />
              </th>
              <th className="px-4 py-3 text-center font-semibold">Registered date</th>
              <th className="px-4 py-3 text-center font-semibold">
                <FilterDropdown label="Status" allLabel="All Status" options={STATUS_OPTIONS} selected={filters.status} onApply={setColumnFilter("status")} />
              </th>
              <th className="px-4 py-3 text-center font-semibold">Action</th>
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
                  <td className="w-14 px-4 py-3.5 align-middle">
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
                        <p className="mt-0.5 text-[13px] text-muted">{farmer.phone}</p>
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

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add to Beneficiaries"
        subtitle={`${selectedFarmers.length} farmer${selectedFarmers.length === 1 ? "" : "s"} selected`}
        footer={<><Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button><Button variant="brand" onClick={addToBeneficiaries}>Add</Button></>}
      >
        <div className="flex flex-col gap-4">
          <FormField label="Segment" htmlFor="bulk-segment" required hint="Membership is verified against the segment rule before enrolment.">
            <Select id="bulk-segment" value={segmentId} onChange={(e) => setSegmentId(e.target.value)}>
              {SEGMENTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </FormField>
          <div>
            <p className="text-[14px] font-medium text-ink">Farmers</p>
            <ul className="mt-2 flex max-h-[220px] flex-col gap-2 overflow-y-auto">
              {selectedFarmers.map((f) => (
                <li key={f.id} className="flex items-center gap-2.5 text-[14px]">
                  <FarmerAvatar name={f.name} avatar={f.avatar} />
                  <span className="text-ink">{f.name}</span>
                  <span className="text-[13px] text-muted">{f.kebele} · {f.crop}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
