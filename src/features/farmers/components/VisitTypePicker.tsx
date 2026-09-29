"use client";

import { cn } from "@/lib/utils";
import { VISIT_TYPES } from "./planVisit";

export function VisitTypePicker({ value, onChange }: { value: string; onChange: (type: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] font-medium text-ink">
        Visit type <span className="text-danger">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {VISIT_TYPES.map((type) => {
          const active = type === value;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors",
                active
                  ? "border-brand-border bg-brand-mint font-semibold text-brand-green"
                  : "border-line bg-white text-ink hover:border-slate-300",
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
  );
}
