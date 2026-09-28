"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { PLANNER_WEEK, TODAYS_VISITS } from "@/features/visits/data";
import type { ArrivalState, TodaysVisit } from "@/features/visits/types";
import { StartVisitButton } from "./StartVisitButton";

// Parcel coordinates when known, otherwise the kebele name.
const mapsUrl = (v: TodaysVisit) => {
  const query = v.lat != null && v.lng != null ? `${v.lat},${v.lng}` : `${v.kebele ?? v.farmerName}, Ethiopia`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const STATE_STYLES: Record<ArrivalState, { step: string; pill: string }> = {
  done: { step: "bg-[#E2E8F0] text-[#475569]", pill: "border-[#A7E3C7] bg-[#EBFAF2] text-brand-green" },
  confirmed: { step: "bg-brand-green text-white", pill: "border-[#A7E3C7] bg-[#EBFAF2] text-brand-green" },
  tentative: { step: "bg-brand-green text-white", pill: "border-[#FCD9A8] bg-[#FFF7EB] text-[#B45309]" },
};

export function TodaysVisits({ visitId }: { visitId: string }) {
  const next = TODAYS_VISITS.find((v) => v.state !== "done");
  const [locationsOpen, setLocationsOpen] = useState(false);

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
        <div>
          <h3 className="text-[15px] font-semibold text-[#1a2b3c]">Today&apos;s visits</h3>
          <p className="mt-0.5 text-[13.5px] text-[#4a5568]">Visits you&apos;ve arranged with farmers for {PLANNER_WEEK.todayLabel}</p>
        </div>
        <button type="button" onClick={() => setLocationsOpen(true)} className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-green hover:underline">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3" />
          </svg>
          View locations
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex gap-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-[13px] leading-snug text-[#475569]">
          <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
          </svg>
          <p>You arrange and order visits directly with farmers based on their availability - the app does not assign or optimise routes.</p>
        </div>

        <ol className="flex flex-col gap-2 px-1">
          {TODAYS_VISITS.map((v, index) => {
            const style = STATE_STYLES[v.state];
            return (
              <li key={v.farmerName} className="flex items-start gap-3 py-1 sm:items-center sm:gap-4">
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold", style.step)}>
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold text-[#1a2b3c]">{v.farmerName}</p>
                    <p className="mt-0.5 text-[13px] text-[#64748b]">Planned arrival · {v.plannedArrival}</p>
                  </div>
                  {v.state === "done" && (
                    <span className="w-fit rounded-full border border-[#A7E3C7] bg-[#EBFAF2] px-3 py-0.5 text-[12.5px] font-medium text-brand-green">Done</span>
                  )}
                  <span className={cn("w-fit rounded-full border px-3 py-1 text-[12.5px] font-medium sm:ml-auto sm:shrink-0", style.pill)}>{v.note}</span>
                </div>
              </li>
            );
          })}
        </ol>

        <StartVisitButton visitId={visitId} next={next} />
      </div>

      <Modal
        isOpen={locationsOpen}
        onClose={() => setLocationsOpen(false)}
        title="Today's visit locations"
        subtitle={`${TODAYS_VISITS.length} visits · ${PLANNER_WEEK.todayLabel} · in the order you arranged them`}
        size="lg"
        footer={
          <Button type="button" variant="outline" onClick={() => setLocationsOpen(false)}>
            Close
          </Button>
        }
      >
        <ol className="flex flex-col gap-2.5">
          {TODAYS_VISITS.map((v, index) => {
            const style = STATE_STYLES[v.state];
            return (
              <li key={v.farmerName} className="flex flex-wrap items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3">
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold", style.step)}>
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold text-[#1a2b3c]">{v.farmerName}</p>
                  <p className="mt-0.5 text-[13px] text-[#64748b]">
                    Planned arrival · {v.plannedArrival}
                    {v.kebele && ` · ${v.kebele} kebele`}
                    {v.parcel && ` · parcel ${v.parcel}`}
                  </p>
                  {v.lat != null && v.lng != null && (
                    <p className="mt-0.5 text-[12.5px] text-[#94A3B8]">
                      {v.lat.toFixed(4)}°N, {v.lng.toFixed(4)}°E
                    </p>
                  )}
                </div>
                <a
                  href={mapsUrl(v)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 whitespace-nowrap h-8 items-center gap-1.5 rounded-md border border-brand-green bg-white px-3 text-[13px] font-semibold text-brand-green transition-colors hover:bg-[#F0FAF5]"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  Open in Maps
                </a>
              </li>
            );
          })}
        </ol>
      </Modal>
    </Card>
  );
}
