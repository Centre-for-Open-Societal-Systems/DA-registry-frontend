"use client";

import { cn } from "@/lib/utils";
import type { PlannerVisit } from "@/features/visits";
import { VISIT_STYLES } from "./calendar";

export function VisitCard({ visit, onClick, active }: { visit: PlannerVisit; onClick?: () => void; active?: boolean }) {
  const style = VISIT_STYLES[visit.status];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("w-full rounded-md border px-2.5 py-2 text-left transition-shadow hover:shadow-sm", style.card, active && "ring-2 ring-brand-green/40")}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-[13px] font-semibold", style.time)}>{visit.time}</span>
        <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      </div>
      <p className="mt-1 text-[13px] font-semibold text-ink">{visit.farmerName}</p>
      <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-slate-600">
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        {visit.kebele}
      </p>
    </button>
  );
}

export function NoVisits() {
  return (
    <div className="flex h-[74px] items-center justify-center rounded-md border border-dashed border-slate-200 text-[13px] text-muted">
      No visits
    </div>
  );
}
