"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { RowAction } from "@/components/ui/RowAction";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { StatCard } from "@/components/ui/StatCard";
import { Banner } from "@/components/ui/Banner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { useAuthStore } from "@/store/useAuthStore";
import { KEBELES, WOREDAS } from "@/features/agents";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { AGENT_STATUS_TONE, ASSIGNMENT_TONE, ASSIGNMENTS, KEBELE_COVERAGE, type AgentAssignment, type AssociationMode, type Geofence } from "@/features/assignments";

const icon = (d: string) => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

const STATUSES = ["Active", "Unassigned", "On-leave"];
const ASSIGNMENT_STATES = ["Proposed", "Validated", "Flagged", "Effective", "Superseded"];
const COVERAGE_STATES = ["Full", "Agent on leave", "Flagged", "Uncovered"];
const NO_KEBELE = "—";

const SEARCH_PLACEHOLDER = searchPlaceholder(["Agent", "DA-ID", "Woreda", "Kebele", "Farmers", "Status"]);
const COVERAGE_SEARCH_PLACEHOLDER = searchPlaceholder(["Kebele", "Woreda", "Agents", "Linked farmers", "Households", "Coverage"]);

const optionsOf = (values: string[], order?: readonly string[], label?: (v: string) => string): FilterOption[] =>
  (order ?? [...new Set(values)]).map((value) => ({ value, label: label ? label(value) : value, count: values.filter((v) => v === value).length }));

const has = (set: Set<string>, value: string) => set.size === 0 || set.has(value);
const countActive = (filters: FilterSelection) => Object.values(filters).filter((set) => set.size > 0).length;

interface AgentFilters extends FilterSelection {
  woreda: Set<string>;
  kebele: Set<string>;
  status: Set<string>;
  assignment: Set<string>;
}
const EMPTY_AGENT_FILTERS: AgentFilters = { woreda: new Set(), kebele: new Set(), status: new Set(), assignment: new Set() };

interface CoverageFilters extends FilterSelection {
  woreda: Set<string>;
  coverage: Set<string>;
}
const EMPTY_COVERAGE_FILTERS: CoverageFilters = { woreda: new Set(), coverage: new Set() };

// Kebeles under the selected woredas (every kebele when none is picked), plus the "no kebele yet" bucket.
const kebelesFor = (woredas: Set<string>) => [
  ...(woredas.size === 0 ? Object.values(KEBELES).flat() : [...woredas].flatMap((w) => KEBELES[w] ?? [])),
  NO_KEBELE,
];

const pruneKebeles = (next: AgentFilters): AgentFilters => {
  const allowed = new Set(kebelesFor(next.woreda));
  return { ...next, kebele: new Set([...next.kebele].filter((k) => allowed.has(k))) };
};

const COVERAGE_WOREDA_OPTIONS = optionsOf(KEBELE_COVERAGE.map((k) => k.woreda));
const COVERAGE_OPTIONS = optionsOf(KEBELE_COVERAGE.map((k) => k.coverage), COVERAGE_STATES);
const COVERAGE_FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "woreda", label: "Woreda", allLabel: "All woredas", placeholder: "All woredas", options: COVERAGE_WOREDA_OPTIONS },
  { key: "coverage", label: "Coverage", allLabel: "All coverage states", placeholder: "All", options: COVERAGE_OPTIONS },
];

interface Draft {
  daId: string;
  woreda: string;
  kebele: string;
  effectiveDate: string;
  reason: string;
  mode: AssociationMode;
}

// Geofence validation (§4.2): deterministic stand-in for the boundary check — flagged when the DA's registered
// home GPS falls outside the target kebele polygon. Amarti Gibe reproduces the known out-of-bounds case.
const runGeofence = (kebele: string): { result: Geofence; reason?: string } =>
  kebele === "Amarti Gibe" ? { result: "Out-of-bounds", reason: "Home GPS 2.4 km outside Amarti Gibe boundary" } : { result: "In-boundary" };

// FR-05 Agent Assignment: agent list by Kebele + Woreda, coverage tiles, Assign / Reassign with effective date,
// farmer-association mode and geofence validation. Reassignment supersedes the prior assignment.
export function AssignmentsWorkspace() {
  const role = useAuthStore((s) => s.role);
  const canAssign = role === "Supervisor" || role === "Admin";
  const [rows, setRows] = useState<AgentAssignment[]>(ASSIGNMENTS);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<AgentFilters>(EMPTY_AGENT_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [coverageQuery, setCoverageQuery] = useState("");
  const [coverageFilters, setCoverageFilters] = useState<CoverageFilters>(EMPTY_COVERAGE_FILTERS);
  const [isCoverageFiltersOpen, setIsCoverageFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [outcome, setOutcome] = useState<{ tone: "success" | "warning"; title: string; body: string } | null>(null);

  const setFilter = (key: keyof AgentFilters) => (next: Set<string>) => setFilters((prev) => pruneKebeles({ ...prev, [key]: next }));
  const setCoverageFilter = (key: keyof CoverageFilters) => (next: Set<string>) => setCoverageFilters((prev) => ({ ...prev, [key]: next }));

  const woredaOptions = optionsOf(rows.map((r) => r.woreda), WOREDAS);
  const kebeleOptions = optionsOf(
    rows.filter((r) => has(filters.woreda, r.woreda)).map((r) => r.kebele ?? NO_KEBELE),
    kebelesFor(filters.woreda),
    (k) => (k === NO_KEBELE ? "No kebele yet" : k),
  );
  const statusOptions = optionsOf(rows.map((r) => r.status), STATUSES);
  const assignmentOptions = optionsOf(rows.map((r) => r.assignmentStatus), ASSIGNMENT_STATES);
  const filterFields: FilterFieldConfig[] = [
    { key: "woreda", label: "Woreda", allLabel: "All woredas", placeholder: "All woredas", options: woredaOptions },
    { key: "kebele", label: "Kebele", allLabel: "All kebeles", placeholder: "All kebeles", options: kebeleOptions },
    { key: "status", label: "Status", allLabel: "All Status", placeholder: "All Status", options: statusOptions },
    { key: "assignment", label: "Assignment", allLabel: "All assignment states", placeholder: "All", options: assignmentOptions },
  ];

  const visible = useMemo(() => {
    return rows.filter(
      (r) =>
        has(filters.woreda, r.woreda) &&
        has(filters.kebele, r.kebele ?? NO_KEBELE) &&
        has(filters.status, r.status) &&
        has(filters.assignment, r.assignmentStatus) &&
        matchesQuery(query, r),
    );
  }, [rows, query, filters]);

  const coverageRows = KEBELE_COVERAGE.filter(
    (k) => has(coverageFilters.woreda, k.woreda) && has(coverageFilters.coverage, k.coverage) && matchesQuery(coverageQuery, k),
  );

  const kebelesCovered = new Set(rows.filter((r) => r.kebele).map((r) => r.kebele)).size;
  const unassigned = rows.filter((r) => r.status === "Unassigned").length;
  const assigned = rows.filter((r) => r.farmers > 0);
  const avgLoad = Math.round(assigned.reduce((s, r) => s + r.farmers, 0) / Math.max(1, assigned.length));

  const openAssign = (r: AgentAssignment) =>
    setDraft({ daId: r.daId, woreda: r.woreda, kebele: r.kebele ?? "", effectiveDate: "2026-09-21", reason: "", mode: r.mode ?? "Automatic" });

  const commit = () => {
    if (!draft) return;
    const check = runGeofence(draft.kebele);
    const prior = rows.find((r) => r.daId === draft.daId)!;
    const isReassign = Boolean(prior.kebele);
    const farmers = draft.mode === "Automatic" ? KEBELE_COVERAGE.find((k) => k.kebele === draft.kebele)?.households ?? 150 : 0;
    setRows((prev) =>
      prev.map((r) =>
        r.daId === draft.daId
          ? { ...r, woreda: draft.woreda, kebele: draft.kebele, farmers: check.result === "In-boundary" ? farmers : r.farmers, status: r.status === "Unassigned" ? "Active" : r.status, assignmentStatus: check.result === "In-boundary" ? "Effective" : "Flagged", effectiveDate: draft.effectiveDate, geofence: check.result, geofenceReason: check.reason, mode: draft.mode }
          : r,
      ),
    );
    if (check.result === "In-boundary") {
      setOutcome({
        tone: "success",
        title: `${prior.agent} ${isReassign ? "reassigned" : "assigned"} to ${draft.kebele} — Validated (in-boundary), effective ${draft.effectiveDate}.`,
        body: `${isReassign ? `Prior assignment (${prior.kebele}) is now Superseded. ` : ""}Farmer count recomputed (${draft.mode === "Automatic" ? "automatic from task list" : "manual selection pending"}); the Kebele coverage summary reflects the change. DA notified by SMS + app.`,
      });
    } else {
      setOutcome({ tone: "warning", title: `Assignment to ${draft.kebele} is Flagged (out-of-bounds).`, body: `${check.reason}. The assignment is recorded as Flagged with the reason and does not become Effective until a supervisor overrides or the boundary data is corrected.` });
    }
    setDraft(null);
  };

  const columns: Column<AgentAssignment>[] = [
    { key: "agent", header: "Agent", cell: (r) => <Link href={`/agents/${r.daId}`} className="font-medium text-ink hover:text-brand-green">{r.agent}</Link> },
    { key: "daId", header: "DA-ID", cell: (r) => <span className="font-mono text-[13px] text-ink-soft">{r.daId}</span> },
    { key: "woreda", header: <FilterDropdown label="Woreda" allLabel="All woredas" options={woredaOptions} selected={filters.woreda} onApply={setFilter("woreda")} />, cell: (r) => r.woreda },
    { key: "kebele", header: <FilterDropdown label="Kebele" allLabel="All kebeles" options={kebeleOptions} selected={filters.kebele} onApply={setFilter("kebele")} />, cell: (r) => (r.kebele ? <span>{r.kebele}<span className="block text-[12px] text-muted">since {r.effectiveDate}</span></span> : <span className="text-subtle">—</span>) },
    { key: "farmers", header: "Farmers", align: "right", cell: (r) => r.farmers.toLocaleString() },
    {
      key: "status",
      header: (
        <span className="inline-flex items-center gap-1.5">
          <FilterDropdown label="Status" allLabel="All Status" options={statusOptions} selected={filters.status} onApply={setFilter("status")} />
          <span className="text-subtle">/</span>
          <FilterDropdown label="Assignment" allLabel="All assignment states" options={assignmentOptions} selected={filters.assignment} onApply={setFilter("assignment")} />
        </span>
      ),
      cell: (r) => <div className="flex flex-col items-start gap-1"><Pill tone={AGENT_STATUS_TONE[r.status]} dot>{r.status}</Pill><Pill tone={ASSIGNMENT_TONE[r.assignmentStatus]}>{r.assignmentStatus}{r.geofence === "Out-of-bounds" ? " · out-of-bounds" : ""}</Pill></div> },
    {
      key: "actions", header: "Actions", align: "center",
      cell: (r) => (
        <div className="flex items-center justify-center gap-1.5">
          {canAssign && <RowAction tone="solid" onClick={() => openAssign(r)}>{r.kebele ? "Reassign" : "Assign"}</RowAction>}
          <RowAction href={`/agents/${r.daId}`} icon="view">View</RowAction>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Agents" value={String(rows.length)} accent="border-l-brand-green" tile="bg-brand-tint text-brand-green" icon={icon("M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z")} />
        <StatCard label="Kebeles covered" value={String(kebelesCovered)} accent="border-l-blue-600" tile="bg-blue-50 text-blue-600" icon={icon("M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z")} />
        <StatCard label="Unassigned" value={String(unassigned)} accent="border-l-amber-600" tile="bg-warning-wash text-amber-600" icon={icon("M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 11l-4 4M18 11l4 4")} />
        <StatCard label="Average load" value={avgLoad.toLocaleString()} hint="farmers per assigned agent" accent="border-l-violet-600" tile="bg-violet-50 text-violet-600" icon={icon("M18 20V10M12 20V4M6 20v-6")} />
      </div>

      {outcome && <Banner tone={outcome.tone} title={outcome.title} onDismiss={() => setOutcome(null)}>{outcome.body}</Banner>}

      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-[15px] font-semibold text-ink">Agents by Kebele and Woreda</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />
            <AdvancedFiltersButton activeCount={countActive(filters)} onClick={() => setIsFiltersOpen(true)} />
          </div>
        </div>
        <DataTable itemLabel="agents" columns={columns} rows={visible} rowKey={(r) => r.daId} minWidth="1000px" emptyTitle="No agents match the selected filters" emptyHint="Clear a filter or try a different search." />

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
                status: next.status ?? new Set(),
                assignment: next.assignment ?? new Set(),
              }),
            )
          }
        />
      </Card>

      {/* Read-only Kebele coverage summary — managed separately (§3.5). */}
      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">Kebele coverage summary <Pill tone="slate">Read-only</Pill></h2>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">Service coverage across kebeles in Bako Tibe. This reporting view is managed separately and is not edited from the assignment screen.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <SearchInput value={coverageQuery} onChange={setCoverageQuery} placeholder={COVERAGE_SEARCH_PLACEHOLDER} />
            <AdvancedFiltersButton activeCount={countActive(coverageFilters)} onClick={() => setIsCoverageFiltersOpen(true)} />
          </div>
        </div>
        <DataTable itemLabel="kebeles"
          minWidth="720px"
          rowKey={(k) => k.kebele}
          rows={coverageRows}
          emptyTitle="No kebeles match the selected filters"
          emptyHint="Clear a filter or try a different search."
          columns={[
            { key: "kebele", header: "Kebele", cell: (k) => <span className="font-medium text-ink">{k.kebele}</span> },
            { key: "woreda", header: <FilterDropdown label="Woreda" allLabel="All woredas" options={COVERAGE_WOREDA_OPTIONS} selected={coverageFilters.woreda} onApply={setCoverageFilter("woreda")} />, cell: (k) => k.woreda },
            { key: "agents", header: "Agents", align: "right", cell: (k) => k.agents },
            { key: "farmers", header: "Linked farmers", align: "right", cell: (k) => k.farmers.toLocaleString() },
            { key: "hh", header: "Households", align: "right", cell: (k) => k.households.toLocaleString() },
            { key: "cov", header: <FilterDropdown label="Coverage" allLabel="All coverage states" options={COVERAGE_OPTIONS} selected={coverageFilters.coverage} onApply={setCoverageFilter("coverage")} />, cell: (k) => <Pill tone={k.coverage === "Full" ? "green" : k.coverage === "Uncovered" ? "red" : "amber"}>{k.coverage}</Pill> },
          ]}
        />

        <AdvancedFiltersDrawer
          isOpen={isCoverageFiltersOpen}
          onClose={() => setIsCoverageFiltersOpen(false)}
          fields={COVERAGE_FILTER_FIELDS}
          filters={coverageFilters}
          onApply={(next) =>
            setCoverageFilters({
              woreda: next.woreda ?? new Set(),
              coverage: next.coverage ?? new Set(),
            })
          }
        />
      </Card>

      {draft && (
        <Modal isOpen onClose={() => setDraft(null)} title={rows.find((r) => r.daId === draft.daId)?.kebele ? "Reassign agent" : "Assign agent"} subtitle={`${rows.find((r) => r.daId === draft.daId)?.agent} · ${draft.daId}`} size="lg"
          footer={<><Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button><Button variant="brand" disabled={!draft.kebele || !draft.effectiveDate || draft.reason.trim().length < 3} onClick={commit}>Validate &amp; commit</Button></>}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Woreda" htmlFor="as-woreda" required>
              <Select id="as-woreda" value={draft.woreda} onChange={(e) => setDraft({ ...draft, woreda: e.target.value, kebele: "" })}>{WOREDAS.map((w) => <option key={w}>{w}</option>)}</Select>
            </FormField>
            <FormField label="Kebele" htmlFor="as-kebele" required>
              <Select id="as-kebele" value={draft.kebele} onChange={(e) => setDraft({ ...draft, kebele: e.target.value })}><option value="">Select kebele</option>{(KEBELES[draft.woreda] ?? []).map((k) => <option key={k}>{k}</option>)}</Select>
            </FormField>
            <FormField label="Effective date" htmlFor="as-date" required>
              <Input id="as-date" type="date" value={draft.effectiveDate} onChange={(e) => setDraft({ ...draft, effectiveDate: e.target.value })} />
            </FormField>
            <FormField label="Farmer association" htmlFor="as-mode" required hint={draft.mode === "Automatic" ? "Farmers in the kebele task list are linked automatically." : "You select the farmers after commit."}>
              <Select id="as-mode" value={draft.mode} onChange={(e) => setDraft({ ...draft, mode: e.target.value as AssociationMode })}><option>Automatic</option><option>Manual</option></Select>
            </FormField>
            <FormField label="Reason" htmlFor="as-reason" required className="sm:col-span-2" hint="Recorded with the assignment; reassignment supersedes the prior assignment (effective-dated).">
              <Input id="as-reason" value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} placeholder="e.g. Coverage gap in Bako 02" />
            </FormField>
          </div>
          {draft.kebele && (
            <div className="mt-4 rounded-lg border border-line bg-surface p-3 text-[13px] text-ink-soft">
              Geofence validation runs on commit: <span className="font-semibold text-ink">In-boundary → Validated → Effective</span>, or <span className="font-semibold text-danger">Out-of-bounds → Flagged</span> with the reason.
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
