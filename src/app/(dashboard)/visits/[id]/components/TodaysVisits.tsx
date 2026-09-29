import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { PLANNER_WEEK, TODAYS_VISITS } from "@/features/visits";
import { ARRIVAL_STYLES } from "./arrivalStyles";
import { StartVisitButton } from "./StartVisitButton";
import { VisitLocationsButton } from "./VisitLocationsButton";

export function TodaysVisits({ visitId }: { visitId: string }) {
  const next = TODAYS_VISITS.find((v) => v.state !== "done");

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">Today&apos;s visits</h3>
          <p className="mt-0.5 text-[13.5px] text-ink-soft">Visits you&apos;ve arranged with farmers for {PLANNER_WEEK.todayLabel}</p>
        </div>
        <VisitLocationsButton />
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex gap-2.5 rounded-lg border border-line bg-surface px-4 py-3 text-[13px] leading-snug text-slate-600">
          <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
          </svg>
          <p>You arrange and order visits directly with farmers based on their availability - the app does not assign or optimise routes.</p>
        </div>

        <ol className="flex flex-col gap-2 px-1">
          {TODAYS_VISITS.map((v, index) => {
            const style = ARRIVAL_STYLES[v.state];
            return (
              <li key={v.farmerName} className="flex items-start gap-3 py-1 sm:items-center sm:gap-4">
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold", style.step)}>
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold text-ink">{v.farmerName}</p>
                    <p className="mt-0.5 text-[13px] text-muted">Planned arrival · {v.plannedArrival}</p>
                  </div>
                  {v.state === "done" && (
                    <span className="w-fit rounded-full border border-brand-border bg-brand-mint px-3 py-0.5 text-[12.5px] font-medium text-brand-green">Done</span>
                  )}
                  <span className={cn("w-fit rounded-full border px-3 py-1 text-[12.5px] font-medium sm:ml-auto sm:shrink-0", style.pill)}>{v.note}</span>
                </div>
              </li>
            );
          })}
        </ol>

        <StartVisitButton visitId={visitId} next={next} />
      </div>
    </Card>
  );
}
