"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { RowAction } from "@/components/ui/RowAction";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill, type PillTone } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Dropdown, type DropdownOption } from "@/components/ui/Dropdown";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { useAuthStore } from "@/store/useAuthStore";
import { FARMERS } from "@/features/farmers/data";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { cn } from "@/lib/utils";

// Rule-based beneficiary segments (Appendix C.3). Rules are edited by Supervisor/Admin only (Appendix D row 1).
interface Segment {
  id: string;
  name: string;
  rule: string;
  scheme: string;
  members: number;
  tone: PillTone;
}
const SEGMENTS: Segment[] = [
  { id: "seg-input", name: "Input subsidy — teff & wheat", rule: "primary crop ∈ {Teff, Wheat} AND land ≥ 0.5 ha", scheme: "MoA input voucher 2026/27", members: 142, tone: "green" },
  { id: "seg-credit", name: "Credit-eligible smallholders", rule: "Fayda verified AND no open credit application", scheme: "Access to Credit (partner banks)", members: 97, tone: "blue" },
  { id: "seg-drought", name: "Drought-response kebeles", rule: "kebele ∈ {Koye Feche, Amarti Gibe}", scheme: "Emergency seed distribution", members: 118, tone: "amber" },
  { id: "seg-women", name: "Women-headed households", rule: "household head = female", scheme: "Livelihood grant (ATI)", members: 64, tone: "purple" },
];

interface Beneficiary {
  id: string;
  name: string;
  kebele: string;
  crop: string;
  segmentId: string;
  status: "Enrolled" | "Pending verification" | "Removed";
  linkedAt: string;
}

const SEED: Beneficiary[] = FARMERS.slice(0, 8).map((f, i) => ({
  id: f.id,
  name: f.name,
  kebele: f.kebele,
  crop: f.crop,
  segmentId: SEGMENTS[i % SEGMENTS.length].id,
  status: i === 5 ? "Pending verification" : "Enrolled",
  linkedAt: ["02 Sep 2026", "28 Aug 2026", "21 Aug 2026", "14 Aug 2026", "09 Aug 2026", "13 Sep 2026", "30 Jul 2026", "22 Jul 2026"][i],
}));

const STATUSES = ["Enrolled", "Pending verification"];

const SEARCH_PLACEHOLDER = searchPlaceholder(["Farmer", "Kebele", "Primary crop", "Segment", "Status", "Linked"]);

const optionsOf = (values: string[], order?: readonly string[], label?: (v: string) => string): FilterOption[] =>
  (order ?? [...new Set(values)]).map((value) => ({ value, label: label ? label(value) : value, count: values.filter((v) => v === value).length }));

// Secondary line makes the farmer search match kebele, woreda, crop and phone as well as the name.
const FARMER_OPTIONS: DropdownOption[] = FARMERS.map((f) => ({ value: f.id, label: f.name, description: `${f.kebele} · ${f.woreda} · ${f.crop} · ${f.phone}` }));

const segmentName = (id: string) => SEGMENTS.find((s) => s.id === id)?.name ?? id;

interface BeneficiaryFilters extends FilterSelection {
  kebele: Set<string>;
  crop: Set<string>;
  segment: Set<string>;
  status: Set<string>;
}
const EMPTY: BeneficiaryFilters = { kebele: new Set(), crop: new Set(), segment: new Set(), status: new Set() };

export function BeneficiariesWorkspace() {
  const role = useAuthStore((s) => s.role);
  const canEditRules = role === "Supervisor" || role === "Admin";
  const [rows, setRows] = useState<Beneficiary[]>(SEED);
  const [filters, setFilters] = useState<BeneficiaryFilters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<Beneficiary | null>(null);
  const [addFarmer, setAddFarmer] = useState("");
  const [addSegment, setAddSegment] = useState(SEGMENTS[0].id);
  const [notice, setNotice] = useState<string | null>(null);

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof BeneficiaryFilters) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));
  // A segment card toggles that segment as the only selected one in the Segment filter.
  const toggleSegment = (id: string) =>
    setFilters((prev) => ({ ...prev, segment: prev.segment.size === 1 && prev.segment.has(id) ? new Set() : new Set([id]) }));
  const singleSegment = filters.segment.size === 1 ? [...filters.segment][0] : null;

  const linked = rows.filter((b) => b.status !== "Removed");
  const kebeleOptions = optionsOf(linked.map((b) => b.kebele));
  const cropOptions = optionsOf(linked.map((b) => b.crop));
  const segmentOptions = optionsOf(linked.map((b) => b.segmentId), SEGMENTS.map((s) => s.id), segmentName);
  const statusOptions = optionsOf(linked.map((b) => b.status), STATUSES);
  const filterFields: FilterFieldConfig[] = [
    { key: "kebele", label: "Kebele", allLabel: "All kebeles", placeholder: "All kebeles", options: kebeleOptions },
    { key: "crop", label: "Primary crop", allLabel: "All crops", placeholder: "All crops", options: cropOptions },
    { key: "segment", label: "Segment", allLabel: "All segments", placeholder: "All segments", options: segmentOptions },
    { key: "status", label: "Status", allLabel: "All Status", placeholder: "All Status", options: statusOptions },
  ];

  const visible = useMemo(() => {
    const has = (set: Set<string>, value: string) => set.size === 0 || set.has(value);
    return rows.filter(
      (b) =>
        b.status !== "Removed" &&
        has(filters.kebele, b.kebele) &&
        has(filters.crop, b.crop) &&
        has(filters.segment, b.segmentId) &&
        has(filters.status, b.status) &&
        matchesQuery(query, b, segmentName(b.segmentId)),
    );
  }, [rows, filters, query]);

  const add = () => {
    const f = FARMERS.find((x) => x.id === addFarmer);
    if (!f) return;
    setRows((prev) => [{ id: f.id, name: f.name, kebele: f.kebele, crop: f.crop, segmentId: addSegment, status: "Pending verification", linkedAt: "Just now" }, ...prev.filter((b) => b.id !== f.id)]);
    setNotice(`${f.name} added to “${SEGMENTS.find((s) => s.id === addSegment)?.name}” — Pending verification against the segment rule. The Farmer Registry record is untouched.`);
    setAddOpen(false);
  };

  const remove = () => {
    if (!removing) return;
    setRows((prev) => prev.map((b) => (b.id === removing.id ? { ...b, status: "Removed" } : b)));
    setNotice(`Link removed for ${removing.name}. This only detaches the beneficiary segment — the farmer's master record in the Farmer Registry is never deleted from here.`);
    setRemoving(null);
  };

  const columns: Column<Beneficiary>[] = [
    { key: "name", header: "Farmer", cell: (b) => <Link href={`/farmers/${b.id}`} className="font-medium text-[#1a2b3c] hover:text-brand-green">{b.name}</Link> },
    { key: "kebele", header: <FilterDropdown label="Kebele" allLabel="All kebeles" options={kebeleOptions} selected={filters.kebele} onApply={setFilter("kebele")} />, cell: (b) => b.kebele },
    { key: "crop", header: <FilterDropdown label="Primary crop" allLabel="All crops" options={cropOptions} selected={filters.crop} onApply={setFilter("crop")} />, cell: (b) => b.crop },
    { key: "segment", header: <FilterDropdown label="Segment" allLabel="All segments" options={segmentOptions} selected={filters.segment} onApply={setFilter("segment")} />, cell: (b) => { const s = SEGMENTS.find((x) => x.id === b.segmentId)!; return <Pill tone={s.tone}>{s.name}</Pill>; } },
    { key: "status", header: <FilterDropdown label="Status" allLabel="All Status" options={statusOptions} selected={filters.status} onApply={setFilter("status")} />, cell: (b) => <Pill tone={b.status === "Enrolled" ? "green" : "amber"} dot>{b.status}</Pill> },
    { key: "linked", header: "Linked", cell: (b) => <span className="text-[13px] text-[#64748b]">{b.linkedAt}</span> },
    {
      key: "actions", header: "Actions", align: "center",
      cell: (b) => canEditRules ? <RowAction tone="danger" icon="remove" onClick={() => setRemoving(b)}>Remove link</RowAction> : <span className="text-[12.5px] text-[#94A3B8]">—</span>,
    },
  ];

  return (
    <>
      {/* Segment cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SEGMENTS.map((s) => {
          const active = singleSegment === s.id;
          return (
            <button key={s.id} type="button" aria-pressed={active} onClick={() => toggleSegment(s.id)} className={cn("rounded-xl border bg-white p-4 text-left shadow-[0px_1px_3px_rgba(0,0,0,0.04)] transition-colors", active ? "border-brand-green bg-[#F0FAF5]" : "border-[#E5E7EB] hover:border-brand-green/60")}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14px] font-semibold text-[#1a2b3c]">{s.name}</p>
                <Pill tone={s.tone}>{s.members}</Pill>
              </div>
              <p className="mt-1.5 font-mono text-[11.5px] text-[#4a5568]">{s.rule}</p>
              <p className="mt-2 text-[12.5px] text-[#64748b]">{s.scheme}</p>
              {canEditRules && <span className="mt-2 inline-block text-[12px] font-semibold text-brand-green">Edit rule</span>}
            </button>
          );
        })}
      </div>

      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}

      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-[15px] font-semibold text-[#1a2b3c]">{singleSegment ? segmentName(singleSegment) : "All beneficiaries"} <span className="ml-1 text-[13px] font-normal text-[#64748b]">{visible.length}</span></h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

            <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />

            <button type="button" onClick={() => { setAddFarmer(""); setAddOpen(true); }}className="inline-flex shrink-0 whitespace-nowrap h-9 items-center rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white hover:bg-brand-green-dark">Add beneficiary</button>
          </div>
        </div>
        <DataTable itemLabel="beneficiaries" columns={columns} rows={visible} rowKey={(b) => b.id} minWidth="960px" emptyTitle="No beneficiaries match the selected filters" emptyHint="Clear a filter or try a different search." />

        <AdvancedFiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          fields={filterFields}
          filters={filters}
          onApply={(next) =>
            setFilters({
              kebele: next.kebele ?? new Set(),
              crop: next.crop ?? new Set(),
              segment: next.segment ?? new Set(),
              status: next.status ?? new Set(),
            })
          }
        />
      </Card>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add beneficiary" subtitle="Link a farmer from your list to a segment"
        footer={<><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button variant="brand" onClick={add} disabled={!addFarmer}>Add</Button></>}
      >
        <div className="flex flex-col gap-4">
          <FormField label="Farmer" htmlFor="ben-farmer" required hint="Only farmers linked to you appear here (Farmer Registry is the source of records).">
            <Dropdown id="ben-farmer" value={addFarmer} onChange={setAddFarmer} options={FARMER_OPTIONS} placeholder="Search or select a farmer" searchable searchPlaceholder="Search name, kebele, crop, phone…" noResultsText="No farmers match your search" />
          </FormField>
          <FormField label="Segment" htmlFor="ben-segment" required hint="Membership is verified against the segment rule before enrolment.">
            <Select id="ben-segment" value={addSegment} onChange={(e) => setAddSegment(e.target.value)}>{SEGMENTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
          </FormField>
        </div>
      </Modal>

      {removing && (
        <Modal isOpen onClose={() => setRemoving(null)} title="Remove beneficiary link?" subtitle={removing.name}
          footer={<><Button variant="outline" onClick={() => setRemoving(null)}>Cancel</Button><Button className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={remove}>Remove link</Button></>}
        >
          <p className="text-[14px] leading-relaxed text-[#4a5568]">This detaches the farmer from the segment and its scheme. It never deletes the farmer&apos;s master record — that lives in the Farmer Registry.</p>
        </Modal>
      )}
    </>
  );
}
