import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { GOALS, type GoalStatus } from "@/features/performance/data";

const STATUS_STYLES: Record<GoalStatus, { pill: string; bar: string; pct: string }> = {
  "On track": { pill: "border-[#A7E3C7] bg-[#EBFAF2] text-brand-green", bar: "bg-brand-green", pct: "text-brand-green" },
  "Needs attention": { pill: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]", bar: "bg-[#DC2626]", pct: "text-brand-green" },
  "At risk": { pill: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]", bar: "bg-[#DC2626]", pct: "text-[#DC2626]" },
};

export function GoalsCard() {
  return (
    <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-[#1a2b3c]">My goals</h2>
        <span className="text-[13px] text-[#64748b]">Coaching plan metrics</span>
      </div>

      <ul>
        {GOALS.map((goal) => {
          const styles = STATUS_STYLES[goal.status];
          return (
            <li key={goal.id} className="border-b border-[#E5E7EB] px-5 py-4 last:border-b-0">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[14.5px] font-medium text-[#1a2b3c]">{goal.title}</p>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap", styles.pill)}>
                    {goal.status}
                  </span>
                  <span className={cn("w-10 text-right text-[14px] font-semibold", styles.pct)}>{goal.progress}%</span>
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]" role="progressbar" aria-valuenow={goal.progress} aria-valuemin={0} aria-valuemax={100}>
                <div className={cn("h-full rounded-full", styles.bar)} style={{ width: `${goal.progress}%` }} />
              </div>

              <div className="mt-2 flex items-center justify-between text-[13px] text-[#4a5568]">
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
