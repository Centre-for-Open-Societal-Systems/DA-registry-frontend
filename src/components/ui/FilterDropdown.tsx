"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Checkbox } from "./Checkbox";

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterDropdownProps {
  /** Column/field name, e.g. "Kebele". */
  label: string;
  /** Label for the "select all" row, e.g. "All kebeles". */
  allLabel: string;
  options: FilterOption[];
  /** Applied selection; an empty set means "all". */
  selected: Set<string>;
  onApply: (next: Set<string>) => void;
  /** "header" renders the table-column trigger; "select" renders a select-box style trigger. */
  variant?: "header" | "select";
  /** Text shown in the select-box trigger when nothing is selected. */
  placeholder?: string;
  id?: string;
}

/** Where the portal panel sits: below the trigger, or above it when the viewport has no room underneath. */
interface PanelPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
}

const VIEWPORT_MARGIN = 8;
const PREFERRED_HEIGHT = 420;

const setsEqual = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((v) => b.has(v));

export function FilterDropdown({
  label,
  allLabel,
  options,
  selected,
  onApply,
  variant = "header",
  placeholder = "All",
  id,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<Set<string>>(selected);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<PanelPosition>({ top: 0, left: 0, width: 300, maxHeight: 460 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const totalCount = options.reduce((sum, o) => sum + o.count, 0);
  const allSelected = draft.size === 0;
  const isDirty = !setsEqual(draft, selected);
  const isActive = selected.size > 0;
  const q = query.trim().toLowerCase();
  const visibleOptions = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  const open = () => {
    setDraft(new Set(selected));
    setQuery("");
    setIsOpen(true);
  };

  // Anchor the panel under the trigger via a portal so scroll containers (table, drawer) don't clip it.
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = variant === "select" ? 6 : 8;
    const width = variant === "select" ? rect.width : 300;
    const left = Math.max(VIEWPORT_MARGIN, Math.min(variant === "select" ? rect.left : rect.left - 12, window.innerWidth - width - VIEWPORT_MARGIN));
    const spaceBelow = window.innerHeight - rect.bottom - gap - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - gap - VIEWPORT_MARGIN;
    // Flip above the trigger when the list would run off the bottom of the screen (e.g. filters on a short table near the fold).
    const openUp = spaceBelow < PREFERRED_HEIGHT && spaceAbove > spaceBelow;
    setPosition(
      openUp
        ? { bottom: window.innerHeight - rect.top + gap, left, width, maxHeight: Math.min(PREFERRED_HEIGHT, spaceAbove) }
        : { top: rect.bottom + gap, left, width, maxHeight: Math.min(PREFERRED_HEIGHT, spaceBelow) },
    );
  }, [isOpen, variant]);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    // Scrolling the option list itself must not close the panel; any other scroll would detach it from the trigger.
    const onScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      close();
    };
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  const toggleOption = (value: string) =>
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      // Selecting every option is the same as "all".
      return next.size === options.length ? new Set() : next;
    });

  const apply = () => {
    onApply(draft);
    setIsOpen(false);
  };

  const selectedLabels = options.filter((o) => selected.has(o.value)).map((o) => o.label);
  const selectSummary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2}`;

  return (
    <>
      {variant === "select" ? (
        <button
          ref={triggerRef}
          id={id}
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : open())}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={cn(
            "flex h-12 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left text-[14px] text-ink transition-colors",
            isOpen ? "border-brand-green ring-1 ring-brand-green" : "border-zinc-300 hover:border-zinc-400",
          )}
        >
          <span className="truncate">{selectSummary}</span>
          <svg
            className={cn("h-4 w-4 shrink-0 text-subtle transition-transform", isOpen && "rotate-180")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : open())}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md py-0.5 pr-1 text-left font-medium transition-colors hover:text-ink",
            isActive && "text-brand-green",
          )}
        >
          {label}
          <svg
            className={cn("h-3.5 w-3.5", isActive ? "text-brand-green" : "text-muted")}
            viewBox="0 0 24 24"
            fill={isActive ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
        </button>
      )}

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={`Filter by ${label}`}
            style={{ top: position.top, bottom: position.bottom, left: position.left, width: position.width, maxHeight: position.maxHeight }}
            className="fixed z-[120] flex animate-dropdown-in flex-col overflow-hidden rounded-xl border border-line bg-white text-[14px] font-normal shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]"
          >
            {/* "All" row */}
            <label
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-3 border-b border-line px-4 py-2.5",
                allSelected ? "bg-brand-mint" : "bg-white hover:bg-surface",
              )}
            >
              <Checkbox checked={allSelected} onChange={() => setDraft(new Set())} aria-label={allLabel} />
              <span className={cn("flex flex-1 items-center gap-1.5 font-semibold", allSelected ? "text-brand-green" : "text-ink")}>
                {allLabel}
                {allSelected && (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-3.5-3.5 1.4-1.4 2.1 2.1 4.6-4.6 1.4 1.4-6 6z" />
                  </svg>
                )}
              </span>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[13px] font-semibold",
                  allSelected ? "bg-emerald-100 text-brand-green" : "bg-line-soft text-slate-600",
                )}
              >
                {totalCount.toLocaleString()}
              </span>
            </label>

            <div className="shrink-0 border-b border-line px-3 py-2.5">
              <label className="relative block">
                <svg className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}…`}
                  aria-label={`Search ${label}`}
                  autoFocus
                  className="h-9 w-full rounded-md border border-zinc-200 bg-surface pl-8 pr-3 text-[13.5px] text-ink placeholder:text-muted focus:border-brand-green focus:outline-none"
                />
              </label>
            </div>

            <ul className="max-h-[240px] min-h-0 overflow-y-auto overscroll-contain green-scrollbar">
              {visibleOptions.length === 0 && <li className="px-4 py-4 text-center text-[13px] text-muted">No matches for “{query.trim()}”</li>}
              {visibleOptions.map((option) => {
                const checked = draft.has(option.value);
                return (
                  <li key={option.value} className="border-b border-line-soft last:border-0">
                    <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface">
                      <Checkbox checked={checked} onChange={() => toggleOption(option.value)} aria-label={option.label} />
                      <span className="flex-1 text-ink">{option.label}</span>
                      <span className="rounded-md bg-line-soft px-2 py-0.5 text-[13px] font-semibold text-slate-600">
                        {option.count.toLocaleString()}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>

            {isDirty && (
              <div className="flex shrink-0 justify-end border-t border-line bg-surface px-4 py-3">
                <button
                  type="button"
                  onClick={apply}
                  className="h-9 shrink-0 whitespace-nowrap rounded-md bg-brand-green px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark"
                >
                  Apply
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
