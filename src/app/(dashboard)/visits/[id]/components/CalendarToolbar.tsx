"use client";

import { Dropdown } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";
import { LEGEND, VIEWS } from "./calendar";

interface CalendarToolbarProps {
  label: string;
  unit: string;
  onCurrent: boolean;
  onStep: (dir: -1 | 1) => void;
  onToday: () => void;
  view: string;
  onViewChange: (view: string) => void;
}

export function CalendarToolbar({ label, unit, onCurrent, onStep, onToday, view, onViewChange }: CalendarToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-line px-5 py-3.5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onStep(-1)} aria-label={`Previous ${unit}`} className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 text-slate-600 transition-colors hover:bg-zinc-50">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="px-1 text-[15px] font-semibold text-ink" aria-live="polite">{label}</span>
        <button type="button" onClick={() => onStep(1)} aria-label={`Next ${unit}`} className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 text-slate-600 transition-colors hover:bg-zinc-50">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        {!onCurrent && (
          <button type="button" onClick={onToday} className="ml-1 text-[13px] font-semibold text-brand-green hover:underline">
            Today
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-slate-600">
          {LEGEND.map((item) => (
            <li key={item.status} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", item.dot)} />
              {item.label}
            </li>
          ))}
        </ul>
        <label htmlFor="calendar-view" className="sr-only">Calendar view</label>
        <Dropdown
          id="calendar-view"
          value={view}
          onChange={onViewChange}
          options={VIEWS}
          align="right"
          className="w-[120px] [&>button]:h-9 [&>button]:text-[13.5px]"
        />
      </div>
    </div>
  );
}
