"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { RowAction } from "@/components/ui/RowAction";
import { Pill } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { QUEUE, QUEUE_TONE, type FieldConflict, type QueueItem } from "@/features/sync";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { cn } from "@/lib/utils";

type Resolution = "mine" | "server" | "merge";
type Outcome = { tone: "success" | "warning" | "info"; title: string; body: React.ReactNode };

const icon = (d: string) => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

const SEARCH_PLACEHOLDER = searchPlaceholder(["Item", "Captured", "Size", "Status"]);

const optionsOf = (values: string[], order?: readonly string[]): FilterOption[] =>
  (order ?? [...new Set(values)]).map((value) => ({ value, label: value, count: values.filter((v) => v === value).length }));

interface QueueFilters extends FilterSelection {
  entity: Set<string>;
  status: Set<string>;
}
const EMPTY: QueueFilters = { entity: new Set(), status: new Set() };

// FR-08 / FR-08a: two-tier sync (device ⇄ server) with explicit conflict outcomes. Retry syncs what it can and never
// claims to resolve a conflict; items awaiting a decision stay on the device.
export function SyncQueue() {
  const [items, setItems] = useState<QueueItem[]>(QUEUE);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [merge, setMerge] = useState<Record<string, "device" | "server">>({});
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [filters, setFilters] = useState<QueueFilters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof QueueFilters) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));

  const entityOptions = optionsOf(items.map((i) => i.entity));
  const statusOptions = optionsOf(items.map((i) => i.status), Object.keys(QUEUE_TONE));
  const filterFields: FilterFieldConfig[] = [
    { key: "entity", label: "Item", allLabel: "All items", placeholder: "All items", options: entityOptions },
    { key: "status", label: "Status", allLabel: "All Status", placeholder: "All Status", options: statusOptions },
  ];

  const rows = items.filter(
    (i) =>
      (filters.entity.size === 0 || filters.entity.has(i.entity)) &&
      (filters.status.size === 0 || filters.status.has(i.status)) &&
      matchesQuery(query, i),
  );

  const awaiting = items.filter((i) => i.status === "Awaiting sync").length;
  const conflicts = items.filter((i) => i.status === "Conflict").length;
  const failed = items.filter((i) => i.status === "Failed").length;

  const syncNow = () => {
    setItems((prev) => prev.map((i) => (i.status === "Awaiting sync" || i.status === "Failed" ? { ...i, status: "Synced", detail: undefined } : i)));
    setOutcome({
      tone: conflicts > 0 ? "warning" : "success",
      title: `Synced ${awaiting + failed} item${awaiting + failed === 1 ? "" : "s"}.`,
      body: conflicts > 0 ? `${conflicts} conflict${conflicts === 1 ? "" : "s"} still need${conflicts === 1 ? "s" : ""} a decision — retry does not resolve conflicts. Those items remain on this device until you choose Keep mine, Keep server or Merge.` : "Everything on this device is now on the server.",
    });
  };

  const openConflict = (item: QueueItem) => {
    setSelected(item);
    setMerge(Object.fromEntries((item.conflicts ?? []).map((c) => [c.field, c.device === c.server ? "server" : "device"])));
  };

  const resolve = (how: Resolution) => {
    if (!selected) return;
    const cf = selected.conflicts ?? [];
    const differing = cf.filter((c) => c.device !== c.server);
    const status = how === "mine" ? "Resolved — kept mine" : how === "server" ? "Resolved — kept server" : "Resolved — merged";
    setItems((prev) => prev.map((i) => (i.id === selected.id ? { ...i, status, detail: how === "merge" ? "Flagged for supervisor spot-check" : undefined } : i)));

    if (how === "mine") {
      setOutcome({
        tone: "success",
        title: `Kept mine — device values written for ${selected.ref}.`,
        body: <>Server values overwritten and retained in the audit trail: {differing.map((c) => <span key={c.field}><span className="font-medium">{c.field}</span> was “{c.server}”; </span>)}</>,
      });
    } else if (how === "server") {
      setOutcome({
        tone: "warning",
        title: `Kept server — server values written for ${selected.ref}.`,
        body: (
          <>
            Discarded device values — re-enter them if they were field-verified:
            <ul className="mt-1 list-disc pl-5">{differing.map((c) => <li key={c.field}><span className="font-medium">{c.field}</span>: “{c.device}” (server kept “{c.server}”)</li>)}</ul>
          </>
        ),
      });
    } else {
      setOutcome({
        tone: "info",
        title: `Merged ${selected.ref} — flagged for supervisor spot-check.`,
        body: (
          <>
            Per-field provenance recorded:
            <ul className="mt-1 list-disc pl-5">
              {cf.map((c) => <li key={c.field}><span className="font-medium">{c.field}</span>: {c.device === c.server ? "identical" : merge[c.field] === "device" ? `device value “${c.device}”` : `server value “${c.server}”`}</li>)}
            </ul>
          </>
        ),
      });
    }
    setSelected(null);
  };

  const columns: Column<QueueItem>[] = [
    { key: "entity", header: <FilterDropdown label="Item" allLabel="All items" options={entityOptions} selected={filters.entity} onApply={setFilter("entity")} />, cell: (i) => <span><span className="font-medium text-ink">{i.entity}</span><span className="block text-[12.5px] text-muted">{i.ref}</span></span> },
    { key: "captured", header: "Captured", cell: (i) => <span className="whitespace-nowrap text-[13px] text-muted">{i.capturedAt}</span> },
    { key: "size", header: "Size", cell: (i) => <span className="text-[13px] text-ink-soft">{i.size}</span> },
    { key: "status", header: <FilterDropdown label="Status" allLabel="All Status" options={statusOptions} selected={filters.status} onApply={setFilter("status")} />, cell: (i) => <div className="flex flex-col items-start gap-1"><Pill tone={QUEUE_TONE[i.status]} dot>{i.status}</Pill>{i.detail && <span className="text-[12px] text-muted">{i.detail}</span>}</div> },
    {
      key: "actions", header: "Actions", align: "center",
      cell: (i) => i.status === "Conflict" ? (
        <RowAction tone="warning" onClick={() => openConflict(i)}>Needs you — resolve</RowAction>
      ) : i.status === "Failed" ? (
        <RowAction icon="retry" onClick={syncNow}>Retry</RowAction>
      ) : <span className="text-[12.5px] text-subtle">—</span>,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Awaiting sync" value={String(awaiting)} accent="border-l-amber-600" tile="bg-warning-wash text-amber-600" icon={icon("M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z")} />
        <StatCard label="Conflicts" value={String(conflicts)} hint="Need a decision" accent="border-l-violet-700" tile="bg-violet-50 text-violet-700" icon={icon("M12 8v4M12 16h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z")} />
        <StatCard label="Failed" value={String(failed)} hint="Auto-retry scheduled" accent="border-l-danger" tile="bg-danger-wash text-danger" icon={icon("M12 8v4M12 16h.01M12 22a10 10 0 100-20 10 10 0 000 20z")} />
        <StatCard label="Device storage" value="71%" hint="1.2 GB free" accent="border-l-brand-green" tile="bg-brand-tint text-brand-green" icon={icon("M22 12H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z")} />
      </div>

      {outcome && <Banner tone={outcome.tone} title={outcome.title} onDismiss={() => setOutcome(null)}>{outcome.body}</Banner>}

      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Device sync queue</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">Everything captured on this device that hasn&apos;t reached the server. Items awaiting a decision are never discarded.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

            <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />

            <button type="button" disabled={awaiting + failed === 0} onClick={syncNow} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center justify-center gap-2 rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white hover:bg-brand-green-dark disabled:opacity-50">
              {icon("M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15")}
              Sync now
            </button>
          </div>
        </div>
        <DataTable
          itemLabel="queued items"
          columns={columns}
          rows={rows}
          rowKey={(i) => i.id}
          minWidth="900px"
          emptyTitle={items.length === 0 ? "All caught up" : "No items match the selected filters"}
          emptyHint={items.length === 0 ? "Nothing is waiting on this device." : "Clear a filter or try a different search."}
        />

        <AdvancedFiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          fields={filterFields}
          filters={filters}
          onApply={(next) =>
            setFilters({
              entity: next.entity ?? new Set(),
              status: next.status ?? new Set(),
            })
          }
        />
      </Card>

      {selected && (
        <Modal isOpen onClose={() => setSelected(null)} title="Resolve sync conflict" subtitle={`${selected.entity} · ${selected.ref} · based on v${selected.version?.base}, server now v${selected.version?.server}`} size="xl"
          footer={<>
            <Button variant="outline" onClick={() => setSelected(null)}>Decide later</Button>
            <Button variant="outline" onClick={() => resolve("server")}>Keep server</Button>
            <Button variant="brandOutline" onClick={() => resolve("merge")}>Merge</Button>
            <Button variant="brand" onClick={() => resolve("mine")}>Keep mine</Button>
          </>}
        >
          <p className="text-[13.5px] text-ink-soft">This record changed on the device and on the server. Choose per field for a merge, or take one side entirely. Each choice leads to a distinct outcome — nothing is silently lost.</p>
          <div className="mt-4 overflow-hidden rounded-lg border border-line">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-surface text-[12.5px] text-slate-700"><tr><th className="px-3 py-2 font-medium">Field</th><th className="px-3 py-2 font-medium">Device (mine)</th><th className="px-3 py-2 font-medium">Server</th><th className="px-3 py-2 text-center font-medium">Merge uses</th></tr></thead>
              <tbody>
                {(selected.conflicts ?? []).map((c: FieldConflict) => {
                  const same = c.device === c.server;
                  return (
                    <tr key={c.field} className="border-t border-line-soft">
                      <td className="px-3 py-2 font-medium text-ink">{c.field}</td>
                      <td className={cn("px-3 py-2", !same && "font-medium text-amber-700")}>{c.device}</td>
                      <td className={cn("px-3 py-2", !same && "font-medium text-blue-700")}>{c.server}</td>
                      <td className="px-3 py-2 text-center">
                        {same ? <Pill tone="slate">identical</Pill> : (
                          <div className="inline-flex rounded-md border border-zinc-200 p-0.5">
                            {(["device", "server"] as const).map((side) => (
                              <button key={side} type="button" onClick={() => setMerge((m) => ({ ...m, [c.field]: side }))} className={cn("h-7 rounded px-2.5 text-[12px] font-medium", merge[c.field] === side ? "bg-brand-green text-white" : "text-ink-soft")}>{side}</button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 space-y-1 text-[12.5px] text-muted">
            <li><span className="font-semibold text-ink">Keep mine</span> — device values written; server values shown as overwritten and kept in the audit trail.</li>
            <li><span className="font-semibold text-ink">Keep server</span> — server values written; discarded device values are listed so you can re-enter field-verified data.</li>
            <li><span className="font-semibold text-ink">Merge</span> — per-field provenance recorded; the merged record is flagged for supervisor spot-check.</li>
          </ul>
        </Modal>
      )}
    </>
  );
}
