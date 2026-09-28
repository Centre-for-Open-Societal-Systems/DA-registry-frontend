"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { RowAction } from "@/components/ui/RowAction";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { ISSUANCE_EVENTS, ISSUANCE_TONE } from "@/features/agents/data";
import type { IssuanceEvent, IssuanceState } from "@/features/agents/types";

const STATES: IssuanceState[] = ["Generated", "Queued", "Exception", "Failed-retry"];
const FAYDA_MATCHES = ["Match", "Pending", "Mismatch"];
const UNIQUENESS = ["Unique", "Pending", "Duplicate"];

const SEARCH_PLACEHOLDER = searchPlaceholder(["DA-ID / ref", "Name", "Fayda match", "Uniqueness", "State", "Detail"]);

const optionsOf = (values: string[], order: readonly string[]): FilterOption[] =>
  order.map((value) => ({ value, label: value, count: values.filter((v) => v === value).length }));

interface IssuanceFilters extends FilterSelection {
  fayda: Set<string>;
  uniqueness: Set<string>;
  state: Set<string>;
}
const EMPTY: IssuanceFilters = { fayda: new Set(), uniqueness: new Set(), state: new Set() };

// FR-01a: DA-ID issuance pipeline with the four literal states and per-row Retry / Generate actions.
export function IssuancePipeline() {
  const [events, setEvents] = useState<IssuanceEvent[]>(ISSUANCE_EVENTS);
  const [filters, setFilters] = useState<IssuanceFilters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof IssuanceFilters) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));

  const faydaOptions = optionsOf(events.map((e) => e.faydaMatch), FAYDA_MATCHES);
  const uniquenessOptions = optionsOf(events.map((e) => e.uniqueness), UNIQUENESS);
  const stateOptions = optionsOf(events.map((e) => e.state), STATES);
  const filterFields: FilterFieldConfig[] = [
    { key: "fayda", label: "Fayda match", allLabel: "All Fayda results", placeholder: "All", options: faydaOptions },
    { key: "uniqueness", label: "Uniqueness", allLabel: "All uniqueness results", placeholder: "All", options: uniquenessOptions },
    { key: "state", label: "State", allLabel: "All states", placeholder: "All states", options: stateOptions },
  ];

  const rows = events.filter(
    (e) =>
      (filters.fayda.size === 0 || filters.fayda.has(e.faydaMatch)) &&
      (filters.uniqueness.size === 0 || filters.uniqueness.has(e.uniqueness)) &&
      (filters.state.size === 0 || filters.state.has(e.state)) &&
      matchesQuery(query, e, e.reason ? "" : "DA-ID minted and recorded"),
  );

  const retry = (daId: string) => {
    setEvents((prev) => prev.map((e) => (e.daId === daId ? { ...e, state: "Queued", reason: "Re-queued for Fayda verification", retryCount: e.retryCount + 1 } : e)));
    setNotice(`${daId} re-queued. It stays Queued until the Fayda response arrives; the retry is recorded with a timestamp.`);
  };

  const columns: Column<IssuanceEvent>[] = [
    { key: "daId", header: "DA-ID / ref", cell: (e) => <span className="font-mono text-[13px] font-medium text-[#1a2b3c]">{e.daId}</span> },
    { key: "name", header: "Name", cell: (e) => <span className="font-medium text-[#1a2b3c]">{e.fullName}</span> },
    { key: "fayda", header: <FilterDropdown label="Fayda match" allLabel="All Fayda results" options={faydaOptions} selected={filters.fayda} onApply={setFilter("fayda")} />, cell: (e) => <Pill tone={e.faydaMatch === "Match" ? "green" : e.faydaMatch === "Mismatch" ? "red" : "amber"}>{e.faydaMatch}</Pill> },
    { key: "unique", header: <FilterDropdown label="Uniqueness" allLabel="All uniqueness results" options={uniquenessOptions} selected={filters.uniqueness} onApply={setFilter("uniqueness")} />, cell: (e) => <Pill tone={e.uniqueness === "Unique" ? "green" : e.uniqueness === "Duplicate" ? "red" : "amber"}>{e.uniqueness}</Pill> },
    { key: "state", header: <FilterDropdown label="State" allLabel="All states" options={stateOptions} selected={filters.state} onApply={setFilter("state")} />, cell: (e) => <Pill tone={ISSUANCE_TONE[e.state]} dot>{e.state}</Pill> },
    { key: "reason", header: "Detail", cell: (e) => <span className="text-[13px] text-[#4a5568]">{e.reason ?? "DA-ID minted and recorded"}</span> },
    { key: "at", header: "Timestamp", cell: (e) => <span className="whitespace-nowrap text-[13px] text-[#64748b]">{e.generatedAt}{e.retryCount > 0 && <span className="block text-[11.5px]">retries: {e.retryCount}</span>}</span> },
    {
      key: "actions", header: "Actions", align: "center",
      cell: (e) => e.state === "Failed-retry" || e.state === "Exception" ? (
        <RowAction icon="retry" onClick={() => retry(e.daId)}>Retry</RowAction>
      ) : <span className="text-[12.5px] text-[#94A3B8]">—</span>,
    },
  ];

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Issuance pipeline</h2>
          <p className="mt-0.5 text-[12.5px] text-[#4a5568]">A DA-ID is minted only after a Fayda match and a uniqueness check; every generation event is timestamped.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

          <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />

          <button type="button" onClick={() => setNotice("Generation run started for all Queued records with a Fayda response — results appear here as each completes.")} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white hover:bg-brand-green-dark">Generate</button>
          <button type="button" onClick={() => setNotice("Bulk generation queued for import job #205 (0 of 42 processed).")} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center rounded-md border border-brand-green bg-white px-3.5 text-[13.5px] font-semibold text-brand-green hover:bg-[#F0FAF5]">Bulk</button>
        </div>
      </div>
      {notice && <Banner tone="success" className="mx-4 mb-3" onDismiss={() => setNotice(null)}>{notice}</Banner>}
      <div>
        <DataTable itemLabel="DA-ID records" columns={columns} rows={rows} rowKey={(e) => e.daId} minWidth="1100px" emptyTitle="No records match the selected filters" emptyHint="Clear a filter or try a different search." />
      </div>

      <AdvancedFiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        fields={filterFields}
        filters={filters}
        onApply={(next) =>
          setFilters({
            fayda: next.fayda ?? new Set(),
            uniqueness: next.uniqueness ?? new Set(),
            state: next.state ?? new Set(),
          })
        }
      />
    </Card>
  );
}
