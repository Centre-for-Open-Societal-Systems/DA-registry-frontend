"use client";

import { cn } from "@/lib/utils";
import { MODES, type Mode } from "./kpiEntry";

export function EntryModeSwitch({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div role="radiogroup" aria-label="Entry method" className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {MODES.map((m) => {
        const selected = mode === m.value;
        return (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(m.value)}
            className={cn(
              "flex items-center justify-between gap-4 rounded-xl border bg-white px-3 py-3 text-left transition-all",
              selected ? "border-brand-green" : "border-line hover:border-brand-green/30 hover:shadow-sm",
            )}
          >
            <span>
              <span className="block text-[14px] font-semibold text-ink">{m.title}</span>
              <span className="mt-0.5 block text-[12.5px] text-ink-soft">{m.description}</span>
            </span>
            <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", selected ? "border-brand-green" : "border-zinc-400")}>
              {selected && <span className="h-2 w-2 rounded-full bg-brand-green" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
