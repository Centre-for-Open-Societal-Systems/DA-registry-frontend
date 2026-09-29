import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { FARMER_SATISFACTION, SUPERVISOR_FEEDBACK, UPCOMING_REVIEWS } from "@/features/performance";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-semibold text-ink">{title}</h2>
      <div className="px-5 py-4">{children}</div>
    </Card>
  );
}

function ScoreRing({ score, outOf }: { score: number; outOf: number }) {
  const size = 72;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / outOf) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-line" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          className="stroke-brand-green" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-[16px] font-bold text-ink">{score}</span>
        <span className="mt-0.5 text-[10px] text-muted">/ {outOf}</span>
      </div>
    </div>
  );
}

export function StatusCard() {
  return (
    <Panel title="Status">
      <div className="flex items-start gap-4">
        <ScoreRing score={FARMER_SATISFACTION.score} outOf={FARMER_SATISFACTION.outOf} />
        <div>
          <p className="text-[15px] font-semibold text-ink">Farmer satisfaction</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{FARMER_SATISFACTION.note}</p>
        </div>
      </div>
    </Panel>
  );
}

export function UpcomingReviewsCard() {
  return (
    <Panel title="Upcoming reviews">
      <ul className="flex flex-col gap-3">
        {UPCOMING_REVIEWS.map((review) => (
          <li key={review.id} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand-green">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" />
              </svg>
            </span>
            <div>
              <p className="text-[14.5px] font-semibold text-ink">{review.title}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">{review.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function SupervisorFeedbackCard() {
  return (
    <Panel title="Supervisor feedback">
      <blockquote className="rounded-lg bg-surface px-4 py-3 text-[13.5px] leading-relaxed text-ink-soft">
        &ldquo;{SUPERVISOR_FEEDBACK}&rdquo;
      </blockquote>
    </Panel>
  );
}
