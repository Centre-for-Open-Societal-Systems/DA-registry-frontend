import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import type { TrainingSession } from "@/features/performance";
import { cn } from "@/lib/utils";

// Dates are calendar days, so format in UTC to keep the day stable in every time zone.
const fmt = (iso: string, options: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", ...options });

function groupByMonth(sessions: TrainingSession[]) {
  const groups = new Map<string, TrainingSession[]>();
  for (const s of sessions) {
    const month = fmt(s.date, { month: "long", year: "numeric" });
    groups.set(month, [...(groups.get(month) ?? []), s]);
  }
  return [...groups.entries()];
}

function SessionRow({ session }: { session: TrainingSession }) {
  const full = session.seatsTaken >= session.seats;
  return (
    <li className="flex items-start gap-5 border-b border-line px-6 py-5 last:border-b-0">
      <div className="flex h-[70px] w-[70px] shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-white">
        <span className="text-[12.5px] font-semibold uppercase text-brand-green">{fmt(session.date, { weekday: "short" })}</span>
        <span className="text-[20px] font-bold leading-tight text-ink">{fmt(session.date, { day: "numeric" })}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <Pill tone="green" className="px-2.5 py-0.5 text-[12px]">{session.mode}</Pill>
          {session.course && <span className="text-[12.5px] text-muted">{session.course}</span>}
        </div>
        <p className="mt-1.5 text-[16px] font-semibold text-ink">{session.title}</p>
        <p className="mt-0.5 text-[14px] text-ink-soft">{session.time} · {session.venue}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("text-[14.5px] font-semibold", full ? "text-danger" : "text-ink")}>{session.seatsTaken}/{session.seats}</p>
        <p className="text-[13px] text-muted">{full ? "Full" : "seats taken"}</p>
      </div>
    </li>
  );
}

// Upcoming Agrilearn and woreda training sessions, grouped by month.
export function TrainingCalendar({ sessions }: { sessions: TrainingSession[] }) {
  return (
    <Card className="overflow-hidden p-0 shadow-card">
      <div className="flex items-baseline gap-3 px-6 py-5">
        <h2 className="text-[18px] font-semibold text-ink">Training calendar</h2>
        <span className="text-[14.5px] text-muted">{sessions.length} upcoming sessions</span>
      </div>
      {sessions.length === 0 ? (
        <EmptyState title="No sessions scheduled" hint="Sessions booked for you in the next 90 days will appear here." />
      ) : (
        groupByMonth(sessions).map(([month, rows]) => (
          <section key={month}>
            <h3 className="border-y border-line bg-surface px-6 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-ink-soft">{month}</h3>
            <ul>
              {rows.map((s) => <SessionRow key={s.id} session={s} />)}
            </ul>
          </section>
        ))
      )}
    </Card>
  );
}
