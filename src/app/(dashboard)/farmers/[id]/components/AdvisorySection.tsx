"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { useAdvisoryStore } from "@/features/farmers";
import { SectionCard } from "./SectionCard";

// Questions and answers captured on this farmer's Advisory visits (Plan a visit → Visit type: Advisory).
export function AdvisorySection({ farmerId }: { farmerId: string }) {
  const allEntries = useAdvisoryStore((s) => s.entries);
  const entries = allEntries.filter((e) => e.farmerId === farmerId);

  return (
    <SectionCard title="Advisory" bodyClassName={entries.length ? "flex flex-col gap-4" : undefined}>
      {entries.length === 0 ? (
        <EmptyState
          title="No advisory questions yet"
          hint="Use Plan a visit and choose the Advisory visit type to record the farmer's questions and your answers."
        />
      ) : (
        entries.map((entry) => (
          <article key={entry.id} className="overflow-hidden rounded-xl border border-line">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-4 py-2.5">
              <p className="text-[13.5px] font-semibold text-ink">Advisory visit · {entry.when}</p>
              <Pill tone={entry.status === "Planned" ? "green" : "amber"}>{entry.status}</Pill>
            </header>
            <ol>
              {entry.items.map((qa, i) => (
                <li key={i} className="flex gap-3 border-b border-line-soft px-4 py-3.5 last:border-0">
                  <span className="mt-0.5 flex h-6 shrink-0 items-center rounded-full bg-brand-mint px-2 text-[12px] font-semibold text-brand-green">Q{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-ink">{qa.question}</p>
                    <p className={qa.answer ? "mt-1 text-[13.5px] leading-relaxed text-slate-600" : "mt-1 text-[13.5px] italic text-muted"}>
                      {qa.answer || "Answer to be added during the visit"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </article>
        ))
      )}
    </SectionCard>
  );
}
