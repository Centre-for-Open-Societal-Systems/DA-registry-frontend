"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { RowAction } from "@/components/ui/RowAction";
import { SearchInput } from "@/components/ui/SearchInput";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { CERTIFICATE_STATUS_TONE, PROVENANCE_NOTE, useCertificatesStore, type Certificate } from "@/features/performance";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { AddCertificateModal } from "./AddCertificateModal";

const SEARCH_PLACEHOLDER = searchPlaceholder(["Name", "Organisation", "Credential ID"]);

const optionsOf = (values: string[]): FilterOption[] =>
  [...new Set(values)].sort().map((value) => ({ value, label: value, count: values.filter((v) => v === value).length }));

interface CertificateFilters extends FilterSelection {
  provenance: Set<string>;
  status: Set<string>;
  type: Set<string>;
}
const EMPTY: CertificateFilters = { provenance: new Set(), status: new Set(), type: new Set() };

// Agrilearn-earned certificates (read-only) and DA-uploaded external credentials, with the add-external flow.
export function CertificatesTable() {
  const certificates = useCertificatesStore((s) => s.rows);
  const [filters, setFilters] = useState<CertificateFilters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [query, setQuery] = useState("");

  const provenanceOptions = optionsOf(certificates.map((c) => c.provenance));
  const statusOptions = optionsOf(certificates.map((c) => c.status));
  const typeOptions = optionsOf(certificates.map((c) => c.type));
  const filterFields: FilterFieldConfig[] = [
    { key: "provenance", label: "Provenance", allLabel: "All provenance", placeholder: "All Provenance", options: provenanceOptions },
    { key: "status", label: "Status", allLabel: "All Status", placeholder: "All Status", options: statusOptions },
    { key: "type", label: "Certificate type", allLabel: "All types", placeholder: "All Types", options: typeOptions },
  ];

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof CertificateFilters) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));
  const has = (set: Set<string>, value: string) => set.size === 0 || set.has(value);

  const rows = certificates.filter(
    (c) =>
      has(filters.provenance, c.provenance) &&
      has(filters.status, c.status) &&
      has(filters.type, c.type) &&
      matchesQuery(query, c.name, c.issuer, c.credentialId, c.provenance, c.status, c.type, c.issuedOn),
  );

  const columns: Column<Certificate>[] = [
    {
      key: "certificate",
      header: "Certificate / issuing organisation",
      cell: (c) => (
        <span className="flex flex-col">
          <span className="font-semibold text-ink">{c.name}</span>
          <span className="text-[12.5px] text-muted">{c.issuer} • {c.credentialId}</span>
        </span>
      ),
    },
    {
      key: "provenance",
      header: <FilterDropdown label="Provenance" allLabel="All provenance" options={provenanceOptions} selected={filters.provenance} onApply={setFilter("provenance")} />,
      cell: (c) => (
        <span className="flex flex-col">
          <span className="text-ink">{c.provenance}</span>
          <span className="text-[12.5px] text-muted">{PROVENANCE_NOTE[c.provenance]}</span>
        </span>
      ),
    },
    { key: "issued", header: "Issue Date", cell: (c) => <span className="whitespace-nowrap">{c.issuedOn}</span> },
    {
      key: "status",
      header: <FilterDropdown label="Status" allLabel="All Status" options={statusOptions} selected={filters.status} onApply={setFilter("status")} />,
      align: "center",
      cell: (c) => <Pill tone={CERTIFICATE_STATUS_TONE[c.status]} className="px-2.5 py-0.5 text-[12.5px]">{c.status}</Pill>,
    },
    { key: "action", header: "Action", align: "center", cell: (c) => <RowAction icon="view" href={`/training/certificates/${c.id}`}>View</RowAction> },
  ];

  return (
    <Card className="overflow-hidden p-0 shadow-card">
      <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-ink">Certificates</h2>
          <p className="mt-0.5 text-[13px] text-muted">{rows.length === certificates.length ? `${certificates.length} certificates` : `${rows.length} of ${certificates.length} certificates`}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />
          <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-green px-4 text-[14px] font-semibold text-white transition-colors hover:bg-brand-green-dark"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            Add external certificate
          </button>
        </div>
      </div>

      <DataTable
        itemLabel="certificates"
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        minWidth="960px"
        emptyTitle={certificates.length === 0 ? "No certificates yet" : "No certificates match the selected filters"}
        emptyHint={certificates.length === 0 ? "Agrilearn certificates appear automatically after sync; add external ones for Woreda review." : "Clear a filter or try a different search."}
      />

      <AdvancedFiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        fields={filterFields}
        filters={filters}
        onApply={(next) => setFilters({ provenance: next.provenance ?? new Set(), status: next.status ?? new Set(), type: next.type ?? new Set() })}
      />

      <AddCertificateModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </Card>
  );
}
