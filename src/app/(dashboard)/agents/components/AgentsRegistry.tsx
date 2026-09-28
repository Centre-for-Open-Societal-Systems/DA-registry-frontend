"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { RowAction } from "@/components/ui/RowAction";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { SearchInput } from "@/components/ui/SearchInput";
import { Banner } from "@/components/ui/Banner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ExportButton } from "@/components/ui/ExportButton";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { useAuthStore } from "@/store/useAuthStore";
import { ACTIVE_TONE, AGENTS, APPROVAL_TONE, FAYDA_TONE, KEBELES, TOTAL_AGENTS, WOREDAS } from "@/features/agents/data";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { downloadCsv, downloadTemplate, fileDate, type CsvColumn } from "@/lib/download";
import type { Agent } from "@/features/agents/types";

const FAYDA = ["Verified", "Pending", "Mismatch"];
const ACTIVE = ["Active", "On-leave", "Separated", "Unassigned"];
const TIERS = ["Certificate", "Diploma", "Degree", "Masters"];
const APPROVALS = ["Draft", "Awaiting review", "Changes requested", "Approved", "Published", "Rejected"];
const UNASSIGNED = "—";

// The registry columns in table order — used by Export.
const CSV_COLUMNS: CsvColumn<Agent>[] = [
  { header: "DA-ID", value: (a) => a.daId },
  { header: "Full Name", value: (a) => a.fullName },
  { header: "Fayda ID", value: (a) => a.faydaId },
  { header: "Fayda Status", value: (a) => a.faydaStatus },
  { header: "Active Status", value: (a) => a.activeStatus },
  { header: "Education Tier", value: (a) => a.educationTier },
  { header: "Assigned Kebele", value: (a) => (a.kebele === UNASSIGNED ? "Unassigned" : a.kebele) },
  { header: "Woreda", value: (a) => a.woreda },
  { header: "Farmer Count", value: (a) => a.farmerCount },
  { header: "Approval Status", value: (a) => a.approvalStatus },
  { header: "Last Updated", value: (a) => a.updatedAt },
];

// Import template v3: the registry's input columns (DA-ID is minted and statuses computed on import).
const downloadImportTemplate = () =>
  downloadTemplate(
    "da-import-template-v3.csv",
    ["Full Name", "Fayda ID", "Phone", "Education Tier", "Specialisation", "Region", "Woreda", "Assigned Kebele"],
    ["Abebe Kebede", "3512 0000 1234", "+251 91 234 5678", "Diploma", "Crop production", "Oromia", "Bako Tibe", "Bako 01"],
  );

const SEARCH_PLACEHOLDER = searchPlaceholder(["DA-ID", "Full Name", "Fayda ID", "Fayda Status", "Active Status", "Education Tier", "Assigned Kebele", "Approval Status"]);

const optionsOf = (values: string[], order: readonly string[], label?: (v: string) => string): FilterOption[] =>
  order.map((value) => ({ value, label: label ? label(value) : value, count: values.filter((v) => v === value).length }));

const WOREDA_OPTIONS = optionsOf(AGENTS.map((a) => a.woreda), WOREDAS);
const FAYDA_OPTIONS = optionsOf(AGENTS.map((a) => a.faydaStatus), FAYDA);
const ACTIVE_OPTIONS = optionsOf(AGENTS.map((a) => a.activeStatus), ACTIVE);
const TIER_OPTIONS = optionsOf(AGENTS.map((a) => a.educationTier), TIERS);
const APPROVAL_OPTIONS = optionsOf(AGENTS.map((a) => a.approvalStatus), APPROVALS);

interface Filters extends FilterSelection {
  woreda: Set<string>;
  kebele: Set<string>;
  fayda: Set<string>;
  active: Set<string>;
  tier: Set<string>;
  approval: Set<string>;
}
const EMPTY: Filters = { woreda: new Set(), kebele: new Set(), fayda: new Set(), active: new Set(), tier: new Set(), approval: new Set() };

// Kebeles under the selected woredas (every kebele when no woreda is picked), plus the unassigned bucket.
const kebelesFor = (woredas: Set<string>) => [
  ...(woredas.size === 0 ? Object.values(KEBELES).flat() : [...woredas].flatMap((w) => KEBELES[w] ?? [])),
  UNASSIGNED,
];

// Drops kebele selections that no longer belong to the chosen woredas.
const pruneKebeles = (next: Filters): Filters => {
  const allowed = new Set(kebelesFor(next.woreda));
  return { ...next, kebele: new Set([...next.kebele].filter((k) => allowed.has(k))) };
};

// FR-02 §3.2.1–3.2.2: 11 literal columns, combinable/resettable filters, search by DA-ID or name.
export function AgentsRegistry() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const canEdit = role === "Supervisor" || role === "Admin";
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof Filters) => (next: Set<string>) => setFilters((prev) => pruneKebeles({ ...prev, [key]: next }));

  const inWoredas = AGENTS.filter((a) => filters.woreda.size === 0 || filters.woreda.has(a.woreda));
  const kebeleOptions = optionsOf(inWoredas.map((a) => a.kebele), kebelesFor(filters.woreda), (k) => (k === UNASSIGNED ? "Unassigned" : k));
  const filterFields: FilterFieldConfig[] = [
    { key: "woreda", label: "Woreda", allLabel: "All woredas", placeholder: "All woredas", options: WOREDA_OPTIONS },
    { key: "kebele", label: "Kebele", allLabel: "All kebeles", placeholder: "All kebeles", options: kebeleOptions },
    { key: "fayda", label: "Fayda status", allLabel: "All Fayda statuses", placeholder: "All", options: FAYDA_OPTIONS },
    { key: "active", label: "Active status", allLabel: "All active statuses", placeholder: "All", options: ACTIVE_OPTIONS },
    { key: "tier", label: "Education tier", allLabel: "All tiers", placeholder: "All", options: TIER_OPTIONS },
    { key: "approval", label: "Approval status", allLabel: "All approval statuses", placeholder: "All", options: APPROVAL_OPTIONS },
  ];

  const rows = useMemo(() => {
    const has = (set: Set<string>, value: string) => set.size === 0 || set.has(value);
    return AGENTS.filter(
      (a) =>
        has(filters.woreda, a.woreda) &&
        has(filters.kebele, a.kebele) &&
        has(filters.fayda, a.faydaStatus) &&
        has(filters.active, a.activeStatus) &&
        has(filters.tier, a.educationTier) &&
        has(filters.approval, a.approvalStatus) &&
        matchesQuery(query, a, a.kebele === UNASSIGNED ? "Unassigned" : ""),
    );
  }, [query, filters]);

  const columns: Column<Agent>[] = [
    { key: "daId", header: "DA-ID", cell: (a) => <span className="font-mono text-[13px] font-medium text-[#1a2b3c]">{a.daId}</span> },
    { key: "name", header: "Full Name", cell: (a) => <Link href={`/agents/${a.daId}`} className="font-medium text-[#1a2b3c] hover:text-brand-green">{a.fullName}</Link> },
    { key: "fayda", header: "Fayda ID", cell: (a) => <span className="whitespace-nowrap font-mono text-[13px] text-[#4a5568]">{a.faydaId}</span> },
    { key: "faydaStatus", header: <FilterDropdown label="Fayda Status" allLabel="All Fayda statuses" options={FAYDA_OPTIONS} selected={filters.fayda} onApply={setFilter("fayda")} />, cell: (a) => <Pill tone={FAYDA_TONE[a.faydaStatus]} dot>{a.faydaStatus}</Pill> },
    { key: "active", header: <FilterDropdown label="Active Status" allLabel="All active statuses" options={ACTIVE_OPTIONS} selected={filters.active} onApply={setFilter("active")} />, cell: (a) => <Pill tone={ACTIVE_TONE[a.activeStatus]} dot>{a.activeStatus}</Pill> },
    { key: "tier", header: <FilterDropdown label="Education Tier" allLabel="All tiers" options={TIER_OPTIONS} selected={filters.tier} onApply={setFilter("tier")} />, cell: (a) => a.educationTier },
    { key: "kebele", header: <FilterDropdown label="Assigned Kebele" allLabel="All kebeles" options={kebeleOptions} selected={filters.kebele} onApply={setFilter("kebele")} />, cell: (a) => (a.kebele === UNASSIGNED ? <span className="text-[#94A3B8]">Unassigned</span> : <span>{a.kebele}<span className="block text-[12px] text-[#64748b]">{a.woreda}</span></span>) },
    { key: "farmers", header: "Farmer Count", align: "right", cell: (a) => a.farmerCount.toLocaleString() },
    { key: "approval", header: <FilterDropdown label="Approval Status" allLabel="All approval statuses" options={APPROVAL_OPTIONS} selected={filters.approval} onApply={setFilter("approval")} />, cell: (a) => <Pill tone={APPROVAL_TONE[a.approvalStatus]}>{a.approvalStatus}</Pill> },
    { key: "updated", header: "Last Updated", cell: (a) => <span className="whitespace-nowrap text-[13px] text-[#64748b]">{a.updatedAt}</span> },
    {
      key: "actions", header: "Actions", align: "center",
      cell: (a) => (
        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <RowAction href={`/agents/${a.daId}`} icon="view">View</RowAction>
          {canEdit && <RowAction href={`/agents/${a.daId}?edit=1`} tone="neutral" icon="edit">Edit</RowAction>}
        </div>
      ),
    },
  ];

  return (
    <>
      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Master registry</h2>
            <span className="text-[13px] text-[#64748b]">{rows.length} of {TOTAL_AGENTS.toLocaleString()} agents</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

            <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />

            {canEdit && (
              <>
                <button type="button" onClick={() => setImportOpen(true)} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center gap-2 rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white hover:bg-brand-green-dark">
                  Import agents
                </button>
                <button type="button" onClick={() => setNotice("Sync from MoA queued — inbound batch will appear in Registry Sync with its receipt.")} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center gap-2 rounded-md border border-brand-green bg-white px-3.5 text-[13.5px] font-semibold text-brand-green hover:bg-[#F0FAF5]">
                  Sync from MoA
                </button>
              </>
            )}
            <ExportButton
              disabled={rows.length === 0}
              onClick={() => {
                downloadCsv(`da-registry-${fileDate()}.csv`, rows, CSV_COLUMNS);
                setNotice(`Exported ${rows.length} agent${rows.length === 1 ? "" : "s"} matching the current filters (CSV).`);
              }}
            />
          </div>
        </div>

        {notice && <Banner tone="success" className="mx-4 mb-3" onDismiss={() => setNotice(null)}>{notice}</Banner>}

        <div>
          <DataTable itemLabel="agents" columns={columns} rows={rows} rowKey={(a) => a.daId} minWidth="1280px" onRowClick={(a) => router.push(`/agents/${a.daId}`)} emptyTitle="No agents match the selected filters" emptyHint="Clear a filter or try a different search." />
        </div>

        <AdvancedFiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          fields={filterFields}
          filters={filters}
          onApply={(next) =>
            setFilters(
              pruneKebeles({
                woreda: next.woreda ?? new Set(),
                kebele: next.kebele ?? new Set(),
                fayda: next.fayda ?? new Set(),
                active: next.active ?? new Set(),
                tier: next.tier ?? new Set(),
                approval: next.approval ?? new Set(),
              }),
            )
          }
        />
      </Card>

      {/* §4.1 Intake — bulk import is one of only two entry paths (no manual Add DA). */}
      <Modal isOpen={importOpen} onClose={() => setImportOpen(false)} title="Import agents (bulk)" subtitle="CSV/XLSX per the MoA extension-staff template. Records enter as proposals routed to their Woreda for review." size="lg"
        footer={<><Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button><Button variant="brand" onClick={() => { setImportOpen(false); setNotice("Import job #205 queued — 0 records parsed yet. Proposals will appear in Approvals as they pass identity checks."); }}>Upload &amp; validate</Button></>}
      >
        <div className="flex flex-col gap-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 bg-[#F8FAFC] px-4 py-6 text-center hover:border-brand-green sm:py-8">
            <input type="file" accept=".csv,.xlsx" className="sr-only" />
            <span className="text-[14px] font-medium text-[#1a2b3c]">Drop the import file here or click to choose</span>
            <span className="text-[12.5px] text-[#64748b]">CSV or XLSX · max 10 MB · template v3 (MoA extension staff)</span>
          </label>
          <ul className="list-disc space-y-1 pl-5 text-[13px] text-[#4a5568]">
            <li>Each row is checked for a Fayda link and uniqueness before a DA-ID is minted (Generated / Queued / Exception / Failed-retry).</li>
            <li>Proposals are held in DA Registry (Gen 2) shadow state until the Woreda supervisor approves.</li>
            <li>There is no manual “Add DA” and no self-registration in this version.</li>
          </ul>
          <button type="button" onClick={downloadImportTemplate} className="w-fit text-[13px] font-semibold text-brand-green hover:underline">Download template (v3)</button>
        </div>
      </Modal>
    </>
  );
}
