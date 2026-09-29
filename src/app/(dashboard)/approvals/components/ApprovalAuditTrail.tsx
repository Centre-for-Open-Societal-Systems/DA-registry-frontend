import { cn } from "@/lib/utils";
import type { ApprovalRequest } from "@/features/agents";

export function ApprovalAuditTrail({ trail }: { trail: ApprovalRequest["trail"] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-line">
      <h3 className="border-b border-line bg-surface px-4 py-3 text-[14px] font-semibold text-ink">Audit trail</h3>
      <ol className="px-4 py-4">
        {trail.map((step, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={`${step.label}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
              {!last && <span className="absolute left-[5px] top-4 h-[calc(100%-12px)] w-px bg-slate-300" aria-hidden="true" />}
              <span className={cn("mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-brand-green", step.current ? "bg-brand-green" : "bg-white")} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={cn("text-[14px] font-semibold", step.current ? "text-brand-green" : "text-ink")}>{step.label}</p>
                  <span className="shrink-0 text-[12px] text-ink-soft">{step.at}</span>
                </div>
                <p className="mt-0.5 text-[12.5px] text-ink-soft">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
