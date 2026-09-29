import Link from "next/link";
import { VISITS } from "@/features/farmers";
import { cn } from "@/lib/utils";
import { SectionCard } from "./SectionCard";

export function VisitHistorySection({ showViewAll = false }: { showViewAll?: boolean }) {
  return (
    <SectionCard
      title="Visit History"
      action={
        showViewAll && (
          <Link href="/visits" className="text-[13.5px] font-semibold text-brand-green hover:underline">
            View all visits
          </Link>
        )
      }
      bodyClassName="px-5 py-4"
    >
      <ol className="flex flex-col">
        {VISITS.map((visit, index) => {
          const isLatest = index === 0;
          return (
            <li key={visit.title} className="relative pb-5 pl-7 last:pb-2">
              {/* Timeline rail: the connector spans the whole row (including padding) so it meets the next dot */}
              <span
                className={cn(
                  "absolute left-0 top-1.5 z-10 block h-3 w-3 rounded-full border-2 bg-white",
                  isLatest ? "border-brand-green" : "border-slate-300",
                )}
              />
              <span className="absolute bottom-0 left-[5px] top-[18px] w-px bg-slate-200" />

              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink">{visit.title}</p>
                  <p className="mt-0.5 truncate text-[13px] text-muted">{visit.summary}</p>
                </div>
                <p className="shrink-0 text-right text-[12.5px] leading-tight text-slate-600">
                  {visit.date}
                  <br />
                  {visit.time}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}
