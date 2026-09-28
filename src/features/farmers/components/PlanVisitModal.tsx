"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { FARMERS } from "../data";
import type { Farmer } from "../types";
import { FarmerAvatar } from "./FarmerAvatar";

// "Advisory" visits belong to the Part 2 Advisory module and are hidden until it ships.
const VISIT_TYPES = ["Crop Survey", "Livestock Survey", "Services", "Follow-up"];
const DURATIONS = ["30 min", "45 min", "60 min", "90 min"];
const PRIORITIES = ["High — overdue by 4 days", "Medium — due this week", "Low — routine"];
const PRIORITY_BY_LEVEL = { high: PRIORITIES[0], medium: PRIORITIES[1], low: PRIORITIES[2] } as const;

/** Pre-filled reason for a visit, e.g. from a Priority-list flag. */
export interface VisitPreset {
  reason: string;
  visitType: string;
  level: keyof typeof PRIORITY_BY_LEVEL;
}
const QUICK_FILTERS = ["Registered", "Input voucher redeemed this season"];

// One entry per distinct farmer (the mock list repeats names to fill a page).
const FARMER_CHOICES = FARMERS.filter((f, i, all) => all.findIndex((o) => o.name === f.name) === i);

// Mock registry id derived from the record (no registry backend yet).
const registryCode = (farmer: Farmer) => `FR-${(88000 + farmer.name.length * 31 + farmer.kebele.length * 7).toString().slice(0, 5)}`;

interface PlanVisitModalProps {
  /** Preselected farmer; when omitted the form starts with a search. */
  farmer?: Farmer;
  isOpen: boolean;
  onClose: () => void;
  /** "schedule" is the Priority-list flavour: same form, different copy and warning. */
  mode?: "plan" | "schedule";
  /** Reason, visit type and priority to preselect (the farmer comes from `farmer`). */
  preset?: VisitPreset;
}

export function PlanVisitModal({ farmer, isOpen, onClose, mode = "plan", preset }: PlanVisitModalProps) {
  const [selected, setSelected] = useState<Farmer | undefined>(farmer);
  const [visitType, setVisitType] = useState(preset && VISIT_TYPES.includes(preset.visitType) ? preset.visitType : VISIT_TYPES[0]);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  // Outcome shown in place of the form after Plan/Schedule or Save as draft (no visits API yet).
  const [result, setResult] = useState<{ kind: "planned" | "draft"; farmer?: string; when: string } | null>(null);

  const readWhen = () => {
    const date = (document.getElementById("visit-date") as HTMLInputElement | null)?.value;
    const time = (document.getElementById("visit-time") as HTMLInputElement | null)?.value;
    if (!date) return "the chosen date";
    const label = new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    return time ? `${label} at ${time}` : label;
  };

  const isSchedule = mode === "schedule";
  const title = isSchedule ? "Schedule visit" : "Plan a visit";
  const subtitle = isSchedule ? "Schedule a field visit and notify the farmer" : "Plan a field visit and notify the farmer";
  const primaryLabel = isSchedule ? "Schedule" : "Plan visit";
  const formId = "plan-visit-form";

  const term = query.trim().toLowerCase();
  const matches = term ? FARMER_CHOICES.filter((f) => `${f.name} ${f.phone} ${f.kebele}`.toLowerCase().includes(term)) : FARMER_CHOICES;

  // Search button / Enter: show the results list (even if a farmer was already picked); a single hit is picked straight away.
  const runSearch = () => {
    setSearched(true);
    if (term && matches.length === 1) setSelected(matches[0]);
    else setSelected(undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="lg"
      icon={
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[16px] font-semibold text-[#2563EB]">
          FP
        </span>
      }
      bodyClassName="px-4 py-4 sm:px-6"
      footer={
        result ? (
          <Button type="button" variant="brand" onClick={onClose}>
            Done
          </Button>
        ) : (
        <>
          <Button type="button" variant="outline" className="mr-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={() => setResult({ kind: "draft", farmer: selected?.name, when: readWhen() })}>
            Save as draft
          </Button>
          <Button type="submit" form={formId} variant="brand" className="gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 13l4 4L19 7" />
            </svg>
            {primaryLabel}
          </Button>
        </>
        )
      }
    >
      {result ? (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="flex h-14 w-14 animate-check-pop items-center justify-center rounded-full bg-[#E6F7EE] text-brand-green">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <h3 className="mt-4 text-[17px] font-semibold text-[#1a2b3c]">
            {result.kind === "draft" ? "Draft saved" : isSchedule ? "Visit scheduled" : "Visit planned"}
          </h3>
          <p className="mt-2 max-w-[420px] text-[14px] leading-relaxed text-[#4a5568]">
            {result.kind === "draft"
              ? `${visitType} visit${result.farmer ? ` with ${result.farmer}` : ""} for ${result.when} is saved as a draft on this device. Open Plan visit again to finish it.`
              : `${visitType} visit${result.farmer ? ` with ${result.farmer}` : ""} on ${result.when}. The farmer is notified by SMS; the visit is queued and syncs when you are online.`}
          </p>
        </div>
      ) : (
      <form
        id={formId}
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setResult({ kind: "planned", farmer: selected?.name, when: readWhen() });
        }}
      >
        {/* Farmer search */}
        <div className="flex gap-2.5">
          <label className="relative block flex-1">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearched(false);
              }}
              onKeyDown={(e) => {
                // Enter searches instead of submitting the visit form.
                if (e.key === "Enter") {
                  e.preventDefault();
                  runSearch();
                }
              }}
              aria-label="Search farmers"
              placeholder="Search name, phone, kebele..."
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-3 text-[14px] text-[#1a2b3c] placeholder:text-[#64748b] focus:border-brand-green focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={runSearch}
            className="h-10 shrink-0 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-[#1a2b3c] transition-colors hover:bg-zinc-50"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((label) => (
            <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12.5px] text-[#1a2b3c]">
              <svg className="h-3.5 w-3.5 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 13l4 4L19 7" />
              </svg>
              {label}
            </span>
          ))}
        </div>

        {/* Farmer */}
        <div className="flex flex-col gap-2">
          <p className="text-[14px] font-medium text-[#1a2b3c]">
            Farmer <span className="text-[#DC2626]">*</span>
          </p>
          {selected ? (
            <div className="flex items-center gap-3 rounded-lg border border-[#A7E3C7] bg-[#EBFAF2] px-3.5 py-3">
              <FarmerAvatar name={selected.name} avatar={selected.avatar} className="h-9 w-9 text-[13px] bg-white" />
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold text-[#1a2b3c]">{selected.name}</p>
                <p className="mt-0.5 truncate text-[13px] text-[#475569]">
                  {registryCode(selected)} · {selected.kebele} · {selected.crop} {selected.landHa} ha · last visit 34 days ago
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(undefined)}
                className="h-8 rounded-md border border-brand-green bg-white px-3 text-[13px] font-semibold text-brand-green transition-colors hover:bg-[#F0FAF5]"
              >
                Change
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-5 text-center">
              <p className="text-[14px] font-semibold text-[#1a2b3c]">No farmers match &ldquo;{query.trim()}&rdquo;</p>
              <p className="text-[13px] text-[#64748b]">Check the spelling, or search by phone number or kebele.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearched(false);
                }}
                className="mt-1 text-[13px] font-semibold text-brand-green hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-[#E5E7EB]">
              {searched && term && (
                <li className="border-b border-[#F1F3F4] bg-[#F8FAFC] px-3.5 py-2 text-[12.5px] text-[#64748b]" aria-live="polite">
                  {matches.length} farmer{matches.length === 1 ? "" : "s"} match &ldquo;{query.trim()}&rdquo;
                </li>
              )}
              {matches.map((f) => (
                <li key={f.id} className="border-b border-[#F1F3F4] last:border-0">
                  <button
                    type="button"
                    onClick={() => setSelected(f)}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-[#F8FAFC]"
                  >
                    <FarmerAvatar name={f.name} avatar={f.avatar} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-[#1a2b3c]">{f.name}</span>
                      <span className="block truncate text-[12.5px] text-[#64748b]">
                        {registryCode(f)} · {f.kebele} · {f.crop} {f.landHa} ha
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Visit type */}
        <div className="flex flex-col gap-2">
          <p className="text-[14px] font-medium text-[#1a2b3c]">
            Visit type <span className="text-[#DC2626]">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {VISIT_TYPES.map((type) => {
              const active = type === visitType;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVisitType(type)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors",
                    active
                      ? "border-[#A7E3C7] bg-[#EBFAF2] font-semibold text-brand-green"
                      : "border-[#E5E7EB] bg-white text-[#1a2b3c] hover:border-[#CBD5E1]",
                  )}
                >
                  {active && (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <FormField label="Purpose / objective" htmlFor="visit-purpose" required>
          <Input id="visit-purpose" className="h-10" defaultValue={preset ? `${preset.reason} — inspect and agree next steps` : "Planning-round crop survey — record plot boundary and crop split"} required />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Date" htmlFor="visit-date" required>
            <Input id="visit-date" type="date" className="h-10" defaultValue="2026-08-25" required />
          </FormField>
          <FormField label="Time" htmlFor="visit-time" required>
            <Input id="visit-time" type="time" className="h-10" defaultValue="09:00" required />
          </FormField>
          <FormField label="Duration" htmlFor="visit-duration">
            <Select id="visit-duration" className="h-10" defaultValue="45 min">
              {DURATIONS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Location" htmlFor="visit-location" hint="Auto-filled from the farmer's registered parcel">
            <Input
              id="visit-location"
              className="h-10 border-transparent bg-[#F1F5F9] text-[#1a2b3c]"
              value={selected ? `${selected.kebele} 01 · plot 8.191°N, 37.052°E` : ""}
              placeholder="Select a farmer first"
              readOnly
              endAdornment={
                <svg className="h-4 w-4 text-[#64748b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              }
            />
          </FormField>
          <FormField label="Priority" htmlFor="visit-priority">
            <Select id="visit-priority" className="h-10" defaultValue={preset ? PRIORITY_BY_LEVEL[preset.level] : PRIORITIES[0]}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </FormField>
        </div>

        {isSchedule && (!preset || preset.level === "high") ? (
          <Banner tone="error">{preset ? `Flagged for ${preset.reason.toLowerCase()} — high priority, aim to schedule within 48 hours.` : "This farmer is flagged as high priority — aim to schedule within 48 hours."}</Banner>
        ) : (
          <Banner tone="warning">Planned offline — the visit is queued on this device and syncs when a connection is available.</Banner>
        )}
      </form>
      )}
    </Modal>
  );
}
