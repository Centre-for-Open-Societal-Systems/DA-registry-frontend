"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
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
import { FARMERS, FarmerAvatar } from "@/features/farmers";
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
  icon: "leaf" | "cash" | "drop" | "people";
}
const SEGMENTS: Segment[] = [
  { id: "seg-input", name: "Input subsidy — teff & wheat", rule: "primary crop ∈ {Teff, Wheat} AND land ≥ 0.5 ha", scheme: "MoA input voucher 2026/27", members: 142, tone: "green", icon: "leaf" },
  { id: "seg-credit", name: "Credit-eligible smallholders", rule: "Fayda verified AND no open credit application", scheme: "Access to Credit (partner banks)", members: 123, tone: "blue", icon: "cash" },
  { id: "seg-drought", name: "Drought-response kebeles", rule: "kebele ∈ {Koye Feche, Amarti Gibe}", scheme: "Emergency seed distribution", members: 118, tone: "amber", icon: "drop" },
  { id: "seg-women", name: "Women-headed households", rule: "household head = female", scheme: "Livelihood grant (ATI)", members: 64, tone: "purple", icon: "people" },
];

// Card colours per segment tone: tinted panel, left accent, icon tile and member count.
const SEGMENT_STYLE: Partial<Record<PillTone, { card: string; tile: string; count: string }>> = {
  green: { card: "border-l-segment-green bg-segment-green-wash", tile: "bg-green-100 text-brand-green", count: "text-brand-green" },
  blue: { card: "border-l-segment-blue bg-segment-blue-wash", tile: "bg-blue-100 text-blue-600", count: "text-blue-600" },
  amber: { card: "border-l-segment-orange bg-segment-orange-wash", tile: "bg-orange-100 text-orange-600", count: "text-orange-600" },
  purple: { card: "border-l-segment-purple bg-segment-purple-wash", tile: "bg-violet-100 text-violet-700", count: "text-violet-700" },
};

const SEGMENT_ICONS: Record<Segment["icon"], ReactNode> = {
  leaf: <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.2-6" />,
  cash: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></>,
  drop: <path d="M12 22a7 7 0 007-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 007 7z" />,
  people: <><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8" /></>,
};

interface Beneficiary {
  avatar?: string;
  id: string;
  name: string;
  kebele: string;
  crop: string;
  segmentId: string;
  status: "Enrolled" | "Pending verification" | "Removed";
  linkedAt: string;
}

const SEED: Beneficiary[] = FARMERS.map((f, i) => ({
  id: f.id,
  name: f.name,
  avatar: f.avatar,
  kebele: f.kebele,
  crop: f.crop,
  segmentId: SEGMENTS[i % SEGMENTS.length].id,
  status: i % 3 === 2 ? "Pending verification" : "Enrolled",
  linkedAt: ["22 Sep 2026", "21 Sep 2026", "19 Sep 2026", "16 Sep 2026", "13 Sep 2026", "09 Sep 2026", "02 Sep 2026", "28 Aug 2026", "21 Aug 2026", "14 Aug 2026"][i],
}));

const STATUSES = ["Enrolled", "Pending verification"];

const SEARCH_PLACEHOLDER = searchPlaceholder(["Farmer", "Kebele", "Primary crop", "Segment", "Status", "Linked"]);

const optionsOf = (values: string[], order?: readonly string[], label?: (v: string) => string): FilterOption[] =>
  (order ?? [...new Set(values)]).map((value) => ({ value, label: label ? label(value) : value, count: values.filter((v) => v === value).length }));

// Secondary line makes the farmer search match kebele, woreda, crop and phone as well as the name.
const FARMER_OPTIONS: DropdownOption[] = FARMERS.map((f) => ({ value: f.id, label: f.name, description: `${f.kebele} · ${f.woreda} · ${f.crop} · ${f.phone}` }));

const segmentName = (id: string) => SEGMENTS.find((s) => s.id === id)?.name ?? id;

interface BeneficiaryFilters extends FilterSelection {
  farmer: Set<string>;
  kebele: Set<string>;
  crop: Set<string>;
  segment: Set<string>;
  status: Set<string>;
}
const EMPTY: BeneficiaryFilters = { farmer: new Set(), kebele: new Set(), crop: new Set(), segment: new Set(), status: new Set() };

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
  const farmerOptions = optionsOf(linked.map((b) => b.name));
  const kebeleOptions = optionsOf(linked.map((b) => b.kebele));
  const cropOptions = optionsOf(linked.map((b) => b.crop));
  const segmentOptions = optionsOf(linked.map((b) => b.segmentId), SEGMENTS.map((s) => s.id), segmentName);
  const statusOptions = optionsOf(linked.map((b) => b.status), STATUSES);
  const filterFields: FilterFieldConfig[] = [
    { key: "farmer", label: "Farmer", allLabel: "All farmers", placeholder: "All farmers", options: farmerOptions },
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
        has(filters.farmer, b.name) &&
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
    { key: "sno", header: "S.No.", align: "center", className: "w-16", cell: (b) => visible.indexOf(b) + 1 },
    {
      key: "name",
      header: <FilterDropdown label="Farmer" allLabel="All farmers" options={farmerOptions} selected={filters.farmer} onApply={setFilter("farmer")} />,
      cell: (b) => (
        <Link href={`/farmers/${b.id}`} className="flex items-center gap-2.5 text-ink hover:text-brand-green">
          <FarmerAvatar name={b.name} avatar={b.avatar} />
          <span className="whitespace-nowrap">{b.name}</span>
        </Link>
      ),
    },
    { key: "kebele", header: <FilterDropdown label="Kebele" allLabel="All kebeles" options={kebeleOptions} selected={filters.kebele} onApply={setFilter("kebele")} />, cell: (b) => b.kebele },
    { key: "crop", header: <FilterDropdown label="Primary Crop" allLabel="All crops" options={cropOptions} selected={filters.crop} onApply={setFilter("crop")} />, cell: (b) => b.crop },
    {
      key: "segment",
      align: "center",
      header: <FilterDropdown label="Segments" allLabel="All segments" options={segmentOptions} selected={filters.segment} onApply={setFilter("segment")} />,
      cell: (b) => {
        const seg = SEGMENTS.find((x) => x.id === b.segmentId)!;
        return <Pill tone={seg.tone} className="font-semibold">{seg.name}</Pill>;
      },
    },
    { key: "linked", header: "Linked", align: "center", cell: (b) => <span className="whitespace-nowrap">{b.linkedAt}</span> },
    {
      key: "status",
      align: "center",
      header: <FilterDropdown label="Status" allLabel="All Status" options={statusOptions} selected={filters.status} onApply={setFilter("status")} />,
      cell: (b) => <Pill tone={b.status === "Enrolled" ? "green" : "amber"} className="font-semibold">{b.status}</Pill>,
    },
    {
      key: "actions",
      header: "Action",
      align: "center",
      cell: (b) =>
        canEditRules ? (
          <RowAction tone="danger" icon="remove" onClick={() => setRemoving(b)} className="bg-danger-wash">Remove</RowAction>
        ) : (
          <span className="text-[12.5px] text-subtle">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Beneficiaries"
        description="Rule-based segments that link farmers to schemes. Removing a link never deletes a Farmer Registry record."
        actions={
          <Button variant="brand" size="md" className="px-6" onClick={() => { setAddFarmer(""); setAddOpen(true); }}>
            Add beneficiary
          </Button>
        }
      />

      {/* Segment cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SEGMENTS.map((s) => {
          const active = singleSegment === s.id;
          const style = SEGMENT_STYLE[s.tone]!;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggleSegment(s.id)}
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-l-[3px] border-line p-4 text-left shadow-[0px_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md",
                style.card,
                active && "ring-2 ring-brand-green/40",
              )}
            >
              <div className="flex items-start gap-2.5">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", style.tile)}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {SEGMENT_ICONS[s.icon]}
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-ink">{s.name.replace(" — ", " - ")}</span>
                  <span className="block text-[12px] text-muted">{s.scheme}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex min-h-[46px] flex-1 items-center rounded-md border border-line bg-white px-3 py-2 text-[12px] leading-snug text-ink-soft">{s.rule}</span>
                <span className={cn("shrink-0 text-[24px] font-semibold", style.count)}>{s.members}</span>
              </div>
              {canEditRules && <span className="text-[12px] font-semibold text-brand-green">Edit rule</span>}
            </button>
          );
        })}
      </div>

      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}

      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">{singleSegment ? segmentName(singleSegment) : "All beneficiaries"}</h2>
            <p className="mt-0.5 text-[12.5px] text-muted">Browse and manage all farmers linked to active segments</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />
            <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
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
              farmer: next.farmer ?? new Set(),
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
          footer={<><Button variant="outline" onClick={() => setRemoving(null)}>Cancel</Button><Button className="bg-danger text-white hover:bg-red-700" onClick={remove}>Remove link</Button></>}
        >
          <p className="text-[14px] leading-relaxed text-ink-soft">This detaches the farmer from the segment and its scheme. It never deletes the farmer&apos;s master record — that lives in the Farmer Registry.</p>
        </Modal>
      )}
    </>
  );
}
