"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { RowAction } from "@/components/ui/RowAction";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { FAYDA_CHECKS, FAYDA_TONE } from "@/features/agents";
import type { AuditEntry, FaydaCheck } from "@/features/agents";

type Resolution = "Merge" | "Keep" | "Escalate";

const RESULTS = ["Verified", "Pending", "Mismatch"];
const DOB_RESULTS = ["Match", "Differs", "Not checked"];
const DUPLICATE = ["Duplicate", "No duplicate"];

const SEARCH_PLACEHOLDER = searchPlaceholder(["DA-ID / ref", "Fayda ID", "Registry name", "Fayda name", "DOB", "Result"]);

const dobOf = (c: FaydaCheck) => (c.result === "Pending" ? "Not checked" : c.dobMatch ? "Match" : "Differs");
const duplicateOf = (c: FaydaCheck) => (c.duplicateOf ? "Duplicate" : "No duplicate");

const optionsOf = (values: string[], order: readonly string[]): FilterOption[] =>
  order.map((value) => ({ value, label: value, count: values.filter((v) => v === value).length }));

interface FaydaFilters extends FilterSelection {
  dob: Set<string>;
  result: Set<string>;
  duplicate: Set<string>;
}
const EMPTY: FaydaFilters = { dob: new Set(), result: new Set(), duplicate: new Set() };

// Appendix C.2 "Fayda verification": identity match + duplicate resolution (Merge / Keep / Escalate) with an audit trail.
export function FaydaVerification() {
  const [checks, setChecks] = useState<FaydaCheck[]>(FAYDA_CHECKS);
  const [filters, setFilters] = useState<FaydaFilters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FaydaCheck | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([
    { actor: "Kebede Alemu", role: "Supervisor", action: "Escalated DA-OR-000353 to Fayda helpdesk (DOB mismatch)", at: "11 Sep 2026, 16:05" },
    { actor: "Fayda verification", role: "System", action: "DA-OR-000355 verified — name and DOB match", at: "15 Aug 2026, 10:10" },
  ]);

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof FaydaFilters) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));

  const dobOptions = optionsOf(checks.map(dobOf), DOB_RESULTS);
  const resultOptions = optionsOf(checks.map((c) => c.result), RESULTS);
  const duplicateOptions = optionsOf(checks.map(duplicateOf), DUPLICATE);
  const filterFields: FilterFieldConfig[] = [
    { key: "result", label: "Result", allLabel: "All results", placeholder: "All Results", options: resultOptions },
    { key: "dob", label: "DOB", allLabel: "All DOB checks", placeholder: "All", options: dobOptions },
    { key: "duplicate", label: "Duplicate", allLabel: "All records", placeholder: "All", options: duplicateOptions },
  ];

  const rows = checks.filter(
    (c) =>
      (filters.dob.size === 0 || filters.dob.has(dobOf(c))) &&
      (filters.result.size === 0 || filters.result.has(c.result)) &&
      (filters.duplicate.size === 0 || filters.duplicate.has(duplicateOf(c))) &&
      matchesQuery(query, c, dobOf(c)),
  );

  const log = (action: string) => setAudit((prev) => [{ actor: "Kebede Alemu", role: "Supervisor", action, at: "Just now" }, ...prev]);

  const verify = (daId: string) => {
    setChecks((prev) => prev.map((c) => (c.daId === daId ? { ...c, checkedAt: "Re-check queued" } : c)));
    log(`Re-verification requested for ${daId}`);
    setNotice(`Verification request sent to Fayda for ${daId}. The result updates the Fayda status on the registry row.`);
  };

  const resolve = (c: FaydaCheck, how: Resolution) => {
    const msg: Record<Resolution, string> = {
      Merge: `${c.daId} merged into ${c.duplicateOf ?? "the existing DA record"} — one DA-ID per agent is preserved; the duplicate proposal is closed.`,
      Keep: `${c.daId} kept as a distinct record. Mismatch flag stays until Fayda confirms; the decision is logged.`,
      Escalate: `${c.daId} escalated to the Fayda helpdesk with the mismatch evidence. Record stays in Exception until resolved.`,
    };
    if (how === "Merge") setChecks((prev) => prev.filter((x) => x.daId !== c.daId));
    log(`${how}: ${c.daId}${c.duplicateOf ? ` (duplicate of ${c.duplicateOf})` : ""}`);
    setNotice(msg[how]);
    setSelected(null);
  };

  const columns: Column<FaydaCheck>[] = [
    { key: "daId", header: "DA-ID / ref", cell: (c) => <span className="font-mono text-[13px] font-medium text-ink">{c.daId}</span> },
    { key: "fayda", header: "Fayda ID", cell: (c) => <span className="whitespace-nowrap font-mono text-[13px] text-ink-soft">{c.faydaId}</span> },
    { key: "reg", header: "Registry name", cell: (c) => c.registryName },
    { key: "fname", header: "Fayda name", cell: (c) => <span className={c.faydaName !== "—" && c.faydaName !== c.registryName ? "font-medium text-danger" : ""}>{c.faydaName}</span> },
    { key: "dob", header: <FilterDropdown label="DOB" allLabel="All DOB checks" options={dobOptions} selected={filters.dob} onApply={setFilter("dob")} />, align: "center", cell: (c) => (c.result === "Pending" ? <span className="text-subtle">—</span> : c.dobMatch ? <Pill tone="green">Match</Pill> : <Pill tone="red">Differs</Pill>) },
    { key: "result", header: <FilterDropdown label="Result" allLabel="All results" options={resultOptions} selected={filters.result} onApply={setFilter("result")} />, cell: (c) => <div className="flex flex-col items-start gap-1"><Pill tone={FAYDA_TONE[c.result]} dot>{c.result}</Pill>{c.duplicateOf && <span className="text-[11.5px] text-danger">Duplicate of {c.duplicateOf}</span>}</div> },
    { key: "at", header: "Checked", cell: (c) => <span className="whitespace-nowrap text-[13px] text-muted">{c.checkedAt}</span> },
    {
      key: "actions", header: "Actions", align: "center",
      cell: (c) => (
        <div className="flex items-center justify-center gap-1.5">
          {c.result === "Pending" && <RowAction icon="check" onClick={() => verify(c.daId)}>Verify</RowAction>}
          {c.result === "Mismatch" && <RowAction tone="solid" onClick={() => setSelected(c)}>Resolve</RowAction>}
          {c.result === "Verified" && <span className="text-[12.5px] text-subtle">—</span>}
        </div>
      ),
    },
  ];

  return (
    <>
      <Card className="overflow-hidden p-0 shadow-card">
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Fayda verification</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">Every DA record must be attributed to one verified Fayda identity — no duplicate or unverified registrations.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

            <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />

            <button type="button" onClick={() => { log("Bulk verification requested for all Pending records"); setNotice("Bulk verification requested for all Pending records."); }} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center rounded-md border border-brand-green bg-white px-3.5 text-[13.5px] font-semibold text-brand-green hover:bg-brand-wash">Verify all pending</button>
          </div>
        </div>
        {notice && <Banner tone="success" className="mx-4 mb-3" onDismiss={() => setNotice(null)}>{notice}</Banner>}
        <DataTable
          itemLabel="verification checks"
          columns={columns}
          rows={rows}
          rowKey={(c) => c.daId}
          minWidth="1100px"
          emptyTitle={checks.length === 0 ? "Nothing awaiting verification" : "No checks match the selected filters"}
          emptyHint={checks.length === 0 ? undefined : "Clear a filter or try a different search."}
        />

        <AdvancedFiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          fields={filterFields}
          filters={filters}
          onApply={(next) =>
            setFilters({
              dob: next.dob ?? new Set(),
              result: next.result ?? new Set(),
              duplicate: next.duplicate ?? new Set(),
            })
          }
        />
      </Card>

      <Card className="p-0 shadow-card">
        <div className="border-b border-line px-4 py-4"><h2 className="text-[15px] font-semibold text-ink">Audit trail</h2></div>
        <ul className="divide-y divide-line-soft">
          {audit.map((a) => (
            <li key={`${a.at}-${a.actor}-${a.action}`} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
              <span className="w-40 shrink-0 text-[12.5px] text-muted">{a.at}</span>
              <span className="text-[13.5px] text-ink"><span className="font-semibold">{a.actor}</span> <span className="text-muted">({a.role})</span> — {a.action}</span>
            </li>
          ))}
        </ul>
      </Card>

      {selected && (
        <Modal isOpen onClose={() => setSelected(null)} title="Resolve Identity Mismatch" subtitle={`${selected.fullName} · ${selected.daId}`} size="lg"
          footer={<>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button variant="outline" onClick={() => resolve(selected, "Escalate")}>Escalate to Fayda</Button>
            <Button variant="brandOutline" onClick={() => resolve(selected, "Keep")}>Keep separate</Button>
            {selected.duplicateOf && <Button variant="brand" onClick={() => resolve(selected, "Merge")}>Merge into {selected.duplicateOf}</Button>}
          </>}
        >
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-line bg-surface p-4 text-[13.5px]">
            <div><p className="text-[11.5px] font-semibold uppercase tracking-wider text-muted">Registry (import)</p><p className="mt-1 font-medium text-ink">{selected.registryName}</p><p className="font-mono text-[12.5px] text-ink-soft">{selected.faydaId}</p></div>
            <div><p className="text-[11.5px] font-semibold uppercase tracking-wider text-muted">Fayda (authority)</p><p className="mt-1 font-medium text-ink">{selected.faydaName}</p><p className="text-[12.5px] text-danger">Date of birth differs</p></div>
          </div>
          <ul className="mt-4 space-y-1.5 text-[13px] text-ink-soft">
            <li><span className="font-semibold text-ink">Merge</span> — the proposal is a duplicate of an existing DA; keep the existing DA-ID and close this record.</li>
            <li><span className="font-semibold text-ink">Keep</span> — treat as a distinct person; the record remains flagged until Fayda confirms.</li>
            <li><span className="font-semibold text-ink">Escalate</span> — hand the evidence to the Fayda helpdesk; the record stays in Exception.</li>
          </ul>
          <p className="mt-3 text-[12.5px] text-muted">Fayda is the external identity authority — the registry never edits national identity data.</p>
        </Modal>
      )}
    </>
  );
}
