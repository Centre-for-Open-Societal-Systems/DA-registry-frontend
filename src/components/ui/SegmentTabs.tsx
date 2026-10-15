import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { tabClass } from "./PageTabs";

export interface SegmentTab<K extends string> {
  key: K;
  label: string;
  count?: number;
}

// In-page state tabs (no routing). Same look as PageTabs so hub link-tabs and local tabs read alike.
// Page-level tabs go in PageHeader's `tabBar`; `actions` sits at the right end of the bar (e.g. an "Add" button for the whole card).
export function SegmentTabs<K extends string>({ tabs, active, onChange, className, actions, label }: { tabs: SegmentTab<K>[]; active: K; onChange: (key: K) => void; className?: string; actions?: ReactNode; label?: string }) {
  return (
    <div className={cn("flex w-full items-center justify-between rounded-t-xl border border-line bg-white shadow-card overflow-hidden", className)}>
      <div role="tablist" aria-label={label} className="flex min-w-0 flex-1 items-center overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button key={tab.key} type="button" role="tab" aria-selected={isActive} onClick={() => onChange(tab.key)} className={tabClass(isActive)}>
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", isActive ? "bg-brand-green text-white" : "bg-line-soft text-slate-600")}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 py-2 pr-4">{actions}</div>}
    </div>
  );
}
