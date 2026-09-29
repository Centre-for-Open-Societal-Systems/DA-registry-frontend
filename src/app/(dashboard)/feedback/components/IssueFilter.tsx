"use client";

import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";
import type { IssueStatus } from "../types";

export const FILTER_OPTIONS = ["Open", "Resolved", "In Review", "Assigned", "Submitted", "Queued (offline)"] as const;
export type IssueFilterValue = (typeof FILTER_OPTIONS)[number];

const OPEN_STATUSES: IssueStatus[] = ["New", "In Review", "Assigned", "In Progress"];

/** True when an issue's status satisfies at least one selected filter. Empty selection = all. */
export function matchesFilter(status: IssueStatus, selected: Set<IssueFilterValue>) {
  if (selected.size === 0) return true;
  for (const f of selected) {
    if (f === "Open" ? OPEN_STATUSES.includes(status) : status === f) return true;
  }
  return false;
}

interface IssueFilterProps {
  selected: Set<IssueFilterValue>;
  onChange: (next: Set<IssueFilterValue>) => void;
}

export function IssueFilter({ selected, onChange }: IssueFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const allSelected = selected.size === 0;

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const toggle = (value: IssueFilterValue) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    // Ticking every option is the same as "All"
    onChange(next.size === FILTER_OPTIONS.length ? new Set() : next);
  };

  const summary = allSelected
    ? "All"
    : selected.size === 1
      ? [...selected][0]
      : `${selected.size} selected`;

  return (
    <div ref={rootRef} className="relative flex items-center gap-3">
      <span className="text-[13.5px] font-medium text-ink">Filter</span>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex h-9 min-w-[86px] items-center justify-between gap-2 rounded-lg border bg-white px-3 text-[13.5px] text-ink transition-colors",
          isOpen ? "border-brand-green ring-1 ring-brand-green" : "border-zinc-200 hover:bg-zinc-50"
        )}
      >
        <span className="truncate">{summary}</span>
        <svg className={cn("h-4 w-4 shrink-0 text-ink transition-transform", isOpen && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-multiselectable
          className="absolute left-0 top-full z-30 mt-1.5 w-[190px] overflow-hidden rounded-lg sm:left-auto sm:right-0 border border-line bg-white text-[14px] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]"
        >
          <li className="border-b border-line-soft">
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface">
              <Checkbox checked={allSelected} onChange={() => onChange(new Set())} aria-label="All" />
              <span className="text-ink-soft">All</span>
            </label>
          </li>
          {FILTER_OPTIONS.map((option) => (
            <li key={option} className="border-b border-line-soft last:border-0">
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface">
                <Checkbox checked={selected.has(option)} onChange={() => toggle(option)} aria-label={option} />
                <span className="text-ink-soft">{option}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
