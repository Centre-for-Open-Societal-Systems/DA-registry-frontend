import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SegmentTab<K extends string> {
  key: K;
  label: string;
  count?: number;
}

// In-page state tabs (no routing). Same look as PageTabs so hub link-tabs and local tabs read alike.
// `actions` sits at the right end of the tab bar (e.g. an "Add" button for the whole card).
export function SegmentTabs<K extends string>({ tabs, active, onChange, className, actions }: { tabs: SegmentTab<K>[]; active: K; onChange: (key: K) => void; className?: string; actions?: ReactNode }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 border-b border-line", className)}>
    <div role="tablist" className="flex min-w-0 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 px-4 py-3.5 text-[14px] transition-colors",
              isActive ? "-mb-px border-b-2 border-brand-green bg-brand-wash font-medium text-brand-green" : "text-ink-soft hover:text-ink",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn("rounded-full px-1.5 py-px text-[11px] font-semibold", isActive ? "bg-brand-green text-white" : "bg-line-soft text-slate-600")}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2 py-2 pr-4">{actions}</div>}
    </div>
  );
}
