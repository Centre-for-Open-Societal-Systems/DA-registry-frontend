"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { Pill } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { SmsPreview } from "@/features/communication";
import { DISPATCHES, SIGNAL_TONE, SIGNALS, type Audience, type Channel, type Dispatch, type SignalSource } from "@/features/communication";
import { useAuthStore } from "@/store/useAuthStore";
import { matchesQuery, searchPlaceholder } from "@/lib/search";

const AUDIENCES: { value: Audience; size: number }[] = [
  { value: "All DAs — Bako Tibe", size: 38 },
  { value: "My linked farmers", size: 248 },
  { value: "Farmers — Bako 01", size: 248 },
  { value: "Farmers — Koye Feche", size: 211 },
  { value: "Cooperative members — Bako", size: 96 },
  { value: "Drought-response kebeles", size: 387 },
];
const SOURCES: SignalSource[] = ["Knowledge", "Emergency", "Weather", "Informational"];
const CHANNELS: Channel[] = ["SMS", "Telegram"];

const SEARCH_PLACEHOLDER = searchPlaceholder(["Dispatch", "Message", "Source", "Audience", "Channels", "Dispatched"]);

const optionsOf = (values: string[], order: readonly string[]): FilterOption[] =>
  order.map((value) => ({ value, label: value, count: values.filter((v) => v === value).length }));

interface HistoryFilters extends FilterSelection {
  source: Set<string>;
  audience: Set<string>;
  channel: Set<string>;
}
const EMPTY: HistoryFilters = { source: new Set(), audience: new Set(), channel: new Set() };

// FR-10 / §4.4: Communications Officer crafts a message with a live SMS preview, picks audience + channels, dispatches; logged to history.
export function BroadcastWorkspace() {
  const role = useAuthStore((s) => s.role);
  const canDispatch = role === "CommsOfficer" || role === "Admin";
  const params = useSearchParams();
  const signal = SIGNALS.find((s) => s.id === params.get("signal"));

  const [source, setSource] = useState<SignalSource>(signal?.source ?? "Informational");
  const [message, setMessage] = useState(signal ? `${signal.title}. ${signal.detail} — Bako Tibe Woreda` : "");
  const [audience, setAudience] = useState<Audience>(signal?.source === "Weather" || signal?.source === "Emergency" ? "Drought-response kebeles" : "All DAs — Bako Tibe");
  const [channels, setChannels] = useState<Set<Channel>>(new Set<Channel>(["SMS"]));
  const [history, setHistory] = useState<Dispatch[]>(DISPATCHES);
  const [notice, setNotice] = useState<string | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof HistoryFilters) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));

  const sourceOptions = optionsOf(history.map((d) => d.source), Object.keys(SIGNAL_TONE));
  const audienceOptions = optionsOf(history.map((d) => d.audience), AUDIENCES.map((a) => a.value));
  const channelOptions = optionsOf(history.flatMap((d) => d.channels), CHANNELS);
  const filterFields: FilterFieldConfig[] = [
    { key: "source", label: "Source", allLabel: "All sources", placeholder: "All sources", options: sourceOptions },
    { key: "audience", label: "Audience", allLabel: "All audiences", placeholder: "All audiences", options: audienceOptions },
    { key: "channel", label: "Channels", allLabel: "All channels", placeholder: "All channels", options: channelOptions },
  ];

  const historyRows = history.filter(
    (d) =>
      (filters.source.size === 0 || filters.source.has(d.source)) &&
      (filters.audience.size === 0 || filters.audience.has(d.audience)) &&
      (filters.channel.size === 0 || d.channels.some((c) => filters.channel.has(c))) &&
      matchesQuery(query, d),
  );

  const size = AUDIENCES.find((a) => a.value === audience)?.size ?? 0;
  const toggle = (c: Channel) => setChannels((prev) => { const n = new Set(prev); if (n.has(c)) n.delete(c); else n.add(c); return n; });

  const dispatch = () => {
    const d: Dispatch = { id: `bc-${2211 + history.length - DISPATCHES.length}`, message, source, channels: [...channels], audience, recipients: size, dispatchedBy: "Almaz Tesfaye", dispatchedAt: "Just now", delivery: { delivered: 0, failed: 0, pending: size } };
    setHistory((prev) => [d, ...prev]);
    setNotice(`Dispatched ${d.id} to ${size} recipients via ${d.channels.join(" + ")}. Delivery outcomes update in history as the gateway reports; ${signal ? `signal ${signal.id} is marked Dispatched.` : "the dispatch is logged."}`);
    setMessage("");
  };

  const columns: Column<Dispatch>[] = [
    { key: "id", header: "Dispatch", cell: (d) => <span className="font-mono text-[13px] font-medium text-ink">{d.id}</span> },
    { key: "msg", header: "Message", cell: (d) => <span className="line-clamp-2 max-w-[360px] text-[13px] text-ink">{d.message}</span> },
    { key: "src", header: <FilterDropdown label="Source" allLabel="All sources" options={sourceOptions} selected={filters.source} onApply={setFilter("source")} />, cell: (d) => <Pill tone={SIGNAL_TONE[d.source]}>{d.source}</Pill> },
    { key: "aud", header: <FilterDropdown label="Audience" allLabel="All audiences" options={audienceOptions} selected={filters.audience} onApply={setFilter("audience")} />, cell: (d) => <span>{d.audience}<span className="block text-[12px] text-muted">{d.recipients} recipients</span></span> },
    { key: "ch", header: <FilterDropdown label="Channels" allLabel="All channels" options={channelOptions} selected={filters.channel} onApply={setFilter("channel")} />, cell: (d) => <div className="flex gap-1">{d.channels.map((c) => <Pill key={c} tone="slate">{c}</Pill>)}</div> },
    { key: "delivery", header: "Delivery", cell: (d) => <span className="text-[12.5px]"><span className="font-medium text-brand-green">{d.delivery.delivered} ✓</span> · <span className="text-danger">{d.delivery.failed} ✗</span> · <span className="text-muted">{d.delivery.pending} pending</span></span> },
    { key: "by", header: "Dispatched", cell: (d) => <span className="text-[12.5px] text-muted">{d.dispatchedBy}<span className="block">{d.dispatchedAt}</span></span> },
  ];

  return (
    <>
      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}
      {signal && <Banner tone="info" title={`Crafting a response to signal ${signal.id}`}>{signal.title} — received {signal.receivedAt}.</Banner>}

      <Card className="shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="text-[15px] font-semibold text-ink">Compose</h2>
        {!canDispatch && <p className="mt-1 text-[12.5px] text-muted">Only a Communications Officer or Administrator can dispatch. You can preview.</p>}
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Signal source" htmlFor="bc-source" required hint="Weather appears only as a source feeding this engine.">
                <Select id="bc-source" value={source} onChange={(e) => setSource(e.target.value as SignalSource)}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</Select>
              </FormField>
              <FormField label="Audience" htmlFor="bc-audience" required hint={`${size} recipients`}>
                <Select id="bc-audience" value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>{AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.value}</option>)}</Select>
              </FormField>
            </div>
            <FormField label="Message" htmlFor="bc-message" required hint={`${message.length} characters · ${Math.max(1, Math.ceil(message.length / 160))} SMS segment${message.length > 160 ? "s" : ""} · Amharic + English supported`}>
              <Textarea id="bc-message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write the message farmers or DAs will receive…" />
            </FormField>
            <fieldset>
              <legend className="text-[14px] font-medium text-ink">Channels</legend>
              <div className="mt-2 flex gap-5">
                {(["SMS", "Telegram"] as Channel[]).map((c) => (
                  <label key={c} className="flex cursor-pointer items-center gap-2 text-[13.5px] text-slate-700"><Checkbox checked={channels.has(c)} onChange={() => toggle(c)} /> {c}</label>
                ))}
              </div>
            </fieldset>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setMessage("")} className="inline-flex shrink-0 whitespace-nowrap h-10 items-center rounded-md border border-zinc-200 bg-white px-4 text-[14px] font-medium text-ink-soft hover:bg-zinc-50">Clear</button>
              <button type="button" disabled={!canDispatch || channels.size === 0 || message.trim().length < 5} onClick={dispatch} className="inline-flex shrink-0 whitespace-nowrap h-10 items-center gap-2 rounded-md bg-brand-green px-4 text-[14px] font-semibold text-white hover:bg-brand-green-dark disabled:opacity-50">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                Send to {size}
              </button>
            </div>
          </div>
          <SmsPreview text={message} sender={source === "Knowledge" ? "OpenAgriNet" : "Bako Tibe Woreda"} />
        </div>
      </Card>

      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Dispatch history</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">Every dispatch is logged with audience, channels and per-channel delivery outcome.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

            <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
          </div>
        </div>
        <DataTable
          itemLabel="dispatches"
          columns={columns}
          rows={historyRows}
          rowKey={(d) => d.id}
          minWidth="1100px"
          emptyTitle={history.length === 0 ? "Nothing dispatched yet" : "No dispatches match the selected filters"}
          emptyHint={history.length === 0 ? undefined : "Clear a filter or try a different search."}
        />

        <AdvancedFiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          fields={filterFields}
          filters={filters}
          onApply={(next) =>
            setFilters({
              source: next.source ?? new Set(),
              audience: next.audience ?? new Set(),
              channel: next.channel ?? new Set(),
            })
          }
        />
      </Card>
    </>
  );
}
