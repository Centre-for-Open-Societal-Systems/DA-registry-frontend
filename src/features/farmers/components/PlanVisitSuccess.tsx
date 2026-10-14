import type { PlanVisitResult } from "./planVisit";

interface PlanVisitSuccessProps {
  result: PlanVisitResult;
  visitType: string;
  isSchedule: boolean;
  /** Questions captured on an Advisory visit; 0 for other visit types. */
  questionCount?: number;
}

export function PlanVisitSuccess({ result, visitType, isSchedule, questionCount = 0 }: PlanVisitSuccessProps) {
  const questions = questionCount > 0 ? ` with ${questionCount} farmer question${questionCount === 1 ? "" : "s"}` : "";
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <span className="flex h-14 w-14 animate-check-pop items-center justify-center rounded-full bg-brand-tint text-brand-green">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <h3 className="mt-4 text-[17px] font-semibold text-ink">
        {result.kind === "draft" ? "Draft saved" : isSchedule ? "Visit scheduled" : "Visit planned"}
      </h3>
      <p className="mt-2 max-w-[420px] text-[14px] leading-relaxed text-ink-soft">
        {result.kind === "draft"
          ? `${visitType} visit${result.farmer ? ` with ${result.farmer}` : ""} for ${result.when}${questions} is saved as a draft on this device. Open Plan visit again to finish it.`
          : `${visitType} visit${result.farmer ? ` with ${result.farmer}` : ""} on ${result.when}${questions}. The farmer is notified by SMS; the visit is queued and syncs when you are online.`}
      </p>
    </div>
  );
}
