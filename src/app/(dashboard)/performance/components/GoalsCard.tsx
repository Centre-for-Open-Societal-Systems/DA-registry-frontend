import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";
import { GOALS, type GoalStatus } from "@/features/performance";

const STATUS_STYLES: Record<GoalStatus, { pill: string; bar: string; pct: string }> = {
  "On track": { pill: "border-brand-border bg-brand-mint text-brand-green", bar: "bg-brand-green", pct: "text-brand-green" },
  "Needs attention": { pill: "border-blue-200 bg-blue-50 text-blue-700", bar: "bg-danger", pct: "text-brand-green" },
  "At risk": { pill: "border-red-200 bg-red-50 text-danger", bar: "bg-danger", pct: "text-danger" },
};

export function GoalsCard() {
  return (
    <Card className="p-0 shadow-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-ink">My goals</h2>
        <span className="flex items-center gap-2 text-[13px] text-muted">
          Coaching plan metrics <Pill tone="slate">Part 2 preview</Pill>
        </span>
      </div>

      <ul>
        {GOALS.map((goal) => {
          const styles = STATUS_STYLES[goal.status];
          return (
            <li key={goal.id} className="border-b border-line px-5 py-4 last:border-b-0">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[14.5px] font-medium text-ink">{goal.title}</p>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap", styles.pill)}>
                    {goal.status}
                  </span>
                  <span className={cn("w-10 text-right text-[14px] font-semibold", styles.pct)}>{goal.progress}%</span>
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={goal.progress} aria-valuemin={0} aria-valuemax={100}>
                <div className={cn("h-full rounded-full", styles.bar)} style={{ width: `${goal.progress}%` }} />
              </div>

              <div className="mt-2 flex items-center justify-between text-[13px] text-ink-soft">
                <span>Target: {goal.target}</span>
                <span>Due: {goal.due}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
