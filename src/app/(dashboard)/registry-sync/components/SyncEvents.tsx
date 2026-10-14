"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { RowAction } from "@/components/ui/RowAction";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { StatCard } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { ExportButton } from "@/components/ui/ExportButton";
import { fileDate } from "@/lib/download";
import { downloadTable, formatLabel } from "@/lib/export";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { useAuthStore } from "@/store/useAuthStore";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { SYNC_EVENTS, SYNC_TONE } from "@/features/agents";
import type { SyncEvent, SyncOutcome } from "@/features/agents";

const OUTCOMES: SyncOutcome[] = ["Failed", "Pending", "Success", "Reconciled"];
const DIRECTIONS = ["OAN → MoA", "MoA → OAN"];

const SEARCH_PLACEHOLDER = searchPlaceholder(["Event", "Entity", "Direction", "Outcome", "Detail", "Timestamp"]);

const optionsOf = (values: string[], order?: readonly string[]): FilterOption[] =>
  (order ?? [...new Set(values)]).map((value) => ({ value, label: value, count: values.filter((v) => v === value).length }));

interface SyncFilters extends FilterSelection {
  entity: Set<string>;
  direction: Set<string>;
  outcome: Set<string>;
}
const EMPTY: SyncFilters = { entity: new Set(), direction: new Set(), outcome: new Set() };

const icon = (d: string) => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

// FR-03 / §4.3: bidirectional MoA ⇄ OAN sync events with entity, direction, timestamp, outcome; Retry, Bulk reconcile, Export.
export function SyncEvents() {
  const role = useAuthStore((s) => s.role);
  const [events, setEvents] = useState<SyncEvent[]>(SYNC_EVENTS);
  const [filters, setFilters] = useState<SyncFilters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [reconcileOpen, setReconcileOpen] = useState(false);

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof SyncFilters) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));

  const count = (o: SyncOutcome) => events.filter((e) => e.outcome === o).length;
  const entityOptions = optionsOf(events.map((e) => e.entityType));
  const directionOptions = optionsOf(events.map((e) => e.direction), DIRECTIONS);
  const outcomeOptions = optionsOf(events.map((e) => e.outcome), OUTCOMES);
  const filterFields: FilterFieldConfig[] = [
    { key: "entity", label: "Entity", allLabel: "All entities", placeholder: "All Entities", options: entityOptions },
    { key: "direction", label: "Direction", allLabel: "All directions", placeholder: "All Directions", options: directionOptions },
    { key: "outcome", label: "Outcome", allLabel: "All outcomes", placeholder: "All Outcomes", options: outcomeOptions },
  ];

  const rows = events.filter(
    (e) =>
      (filters.entity.size === 0 || filters.entity.has(e.entityType)) &&
      (filters.direction.size === 0 || filters.direction.has(e.direction)) &&
      (filters.outcome.size === 0 || filters.outcome.has(e.outcome)) &&
      matchesQuery(query, e),
  );

  const retry = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, outcome: "Pending", detail: "Retry sent — awaiting MoA receipt", retryCount: e.retryCount + 1 } : e)));
    setNotice(`${id} retried. It stays Pending until MoA returns a receipt; the event keeps its retry count and timestamp.`);
  };

  const columns: Column<SyncEvent>[] = [
    { key: "id", header: "Event", cell: (e) => <span className="font-mono text-[13px] font-medium text-ink">{e.id}</span> },
    { key: "entity", header: <FilterDropdown label="Entity" allLabel="All entities" options={entityOptions} selected={filters.entity} onApply={setFilter("entity")} />, cell: (e) => <span>{e.entityType}<span className="block font-mono text-[12px] text-muted">{e.entityRef}</span></span> },
    { key: "dir", header: <FilterDropdown label="Direction" allLabel="All directions" options={directionOptions} selected={filters.direction} onApply={setFilter("direction")} />, cell: (e) => <Pill tone={e.direction === "OAN → MoA" ? "blue" : "purple"}>{e.direction}</Pill> },
    { key: "outcome", header: <FilterDropdown label="Outcome" allLabel="All outcomes" options={outcomeOptions} selected={filters.outcome} onApply={setFilter("outcome")} />, cell: (e) => <Pill tone={SYNC_TONE[e.outcome]} dot>{e.outcome}</Pill> },
    { key: "detail", header: "Detail", cell: (e) => <span className="text-[13px] text-ink-soft">{e.detail}</span> },
    { key: "retries", header: "Retries", align: "center", cell: (e) => e.retryCount },
    { key: "at", header: "Timestamp", cell: (e) => <span className="whitespace-nowrap text-[13px] text-muted">{e.at}</span> },
    {
      key: "actions", header: "Actions", align: "center",
      cell: (e) => e.outcome === "Failed" ? (
        <RowAction icon="retry" onClick={() => retry(e.id)}>Retry</RowAction>
      ) : <span className="text-[12.5px] text-subtle">—</span>,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Success (7d)" value={String(count("Success"))} accent="border-l-brand-green" tile="bg-brand-tint text-brand-green" icon={icon("M20 6L9 17l-5-5")} />
        <StatCard label="Pending receipt" value={String(count("Pending"))} accent="border-l-amber-600" tile="bg-warning-wash text-amber-600" icon={icon("M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z")} />
        <StatCard label="Failed" value={String(count("Failed"))} hint="Retry available" accent="border-l-danger" tile="bg-danger-wash text-danger" icon={icon("M12 8v4M12 16h.01M12 22a10 10 0 100-20 10 10 0 000 20z")} />
        <StatCard label="Last batch" value="01 Sep" hint="42 received · 40 accepted" accent="border-l-blue-600" tile="bg-blue-50 text-blue-600" icon={icon("M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15")} />
      </div>

      <Card className="overflow-hidden p-0 shadow-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Registry sync</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">Registry-sync (OAN ⇄ MoA) is distinct from device-sync (app ⇄ server, see Sync queue).</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

            <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />

            {role === "Admin" && <button type="button" onClick={() => setReconcileOpen(true)} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white hover:bg-brand-green-dark">Bulk reconcile</button>}
            <ExportButton
              onExport={(format) => {
                downloadTable(format, `registry-sync-events-${fileDate()}`, rows, [
                  { header: "Event ID", value: (e) => e.id },
                  { header: "Entity", value: (e) => e.entityType },
                  { header: "Reference", value: (e) => e.entityRef },
                  { header: "Direction", value: (e) => e.direction },
                  { header: "Outcome", value: (e) => e.outcome },
                  { header: "Retries", value: (e) => e.retryCount },
                  { header: "Detail", value: (e) => e.detail },
                  { header: "At", value: (e) => e.at },
                ], "Registry sync events");
                setNotice(`Reconciliation report exported — ${rows.length} events (${formatLabel(format)}).`);
              }}
            />
          </div>
        </div>
        {notice && <Banner tone="success" className="mx-4 mb-3" onDismiss={() => setNotice(null)}>{notice}</Banner>}
        <div>
          <DataTable itemLabel="sync events" columns={columns} rows={rows} rowKey={(e) => e.id} minWidth="1100px" emptyTitle="No events match the selected filters" emptyHint="Clear a filter or try a different search." />
        </div>

        <AdvancedFiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          fields={filterFields}
          filters={filters}
          onApply={(next) =>
            setFilters({
              entity: next.entity ?? new Set(),
              direction: next.direction ?? new Set(),
              outcome: next.outcome ?? new Set(),
            })
          }
        />
      </Card>

      <Modal isOpen={reconcileOpen} onClose={() => setReconcileOpen(false)} title="Bulk Reconciliation" subtitle="Compare OAN DA Registry against the MoA master and queue corrections"
        footer={<><Button variant="outline" onClick={() => setReconcileOpen(false)}>Cancel</Button><Button variant="brand" onClick={() => { setReconcileOpen(false); setNotice("Reconciliation run #31 started for Oromia (1,284 records). Differences will appear as Reconciled / Failed events and a downloadable report."); }}>Run reconciliation</Button></>}
      >
        <ul className="list-disc space-y-1.5 pl-5 text-[13.5px] text-ink-soft">
          <li>Scope: all regions (admin) — records compared by DA-ID and Fayda ID.</li>
          <li>Outcomes per record: identical · OAN newer (push) · MoA newer (pull) · conflict (surfaced as an exception).</li>
          <li>Conflicts are never auto-resolved; they land in the exceptions view for a person to decide.</li>
        </ul>
      </Modal>
    </>
  );
}
