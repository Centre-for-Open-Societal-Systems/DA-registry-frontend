import { PLANNER_DAYS, PLANNER_WEEK } from "@/features/visits";
import type { PlannerStatus, PlannerVisit } from "@/features/visits";

export const LEGEND: { status: PlannerStatus; label: string; dot: string }[] = [
  { status: "scheduled", label: "Scheduled", dot: "bg-blue-600" },
  { status: "completed", label: "Completed", dot: "bg-brand-green" },
  { status: "overdue", label: "Overdue", dot: "bg-amber-600" },
];

export const VISIT_STYLES: Record<PlannerStatus, { card: string; time: string; dot: string }> = {
  scheduled: { card: "border-blue-200 bg-blue-50", time: "text-blue-600", dot: "bg-blue-600" },
  completed: { card: "border-brand-border bg-brand-mint", time: "text-brand-green", dot: "bg-brand-green" },
  overdue: { card: "border-warning-border bg-warning-wash", time: "text-amber-700", dot: "bg-amber-600" },
};

export const VIEWS = ["Week", "Day", "Month"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const DAY_LABELS = PLANNER_DAYS.map((d) => d.label);
const DAY_MS = 86_400_000;

// Days are counted from the planner's first column (the "today" week's Monday = 0), so any week can be derived from it.
const [anchorMonth, anchorYear] = PLANNER_WEEK.month.split(" ");
const ANCHOR = Date.UTC(Number(anchorYear), MONTHS.indexOf(anchorMonth), PLANNER_DAYS[0].dayOfMonth);

export const dateOf = (day: number) => new Date(ANCHOR + day * DAY_MS);
export const dayOfDate = (d: Date) => Math.round((d.getTime() - ANCHOR) / DAY_MS);
export const weekStartOf = (day: number) => Math.floor(day / 7) * 7;
export const weekdayLabel = (day: number) => DAY_LABELS[((day % 7) + 7) % 7];
// Sample data only covers the current week; other weeks have no visits yet.
export const visitsOn = (day: number): PlannerVisit[] => (day >= 0 && day < PLANNER_DAYS.length ? PLANNER_DAYS[day].visits : []);
export const isToday = (day: number) => day >= 0 && day < PLANNER_DAYS.length && !!PLANNER_DAYS[day].isToday;

export const monthYear = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const longDate = (day: number) => {
  const d = dateOf(day);
  const label = weekdayLabel(day);
  return `${label.charAt(0)}${label.slice(1).toLowerCase()} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

export function weekLabel(start: number) {
  const a = dateOf(start);
  const b = dateOf(start + 6);
  if (a.getUTCMonth() === b.getUTCMonth()) return monthYear(a);
  if (a.getUTCFullYear() === b.getUTCFullYear()) return `${MONTHS[a.getUTCMonth()].slice(0, 3)} – ${MONTHS[b.getUTCMonth()].slice(0, 3)} ${b.getUTCFullYear()}`;
  return `${MONTHS[a.getUTCMonth()].slice(0, 3)} ${a.getUTCFullYear()} – ${MONTHS[b.getUTCMonth()].slice(0, 3)} ${b.getUTCFullYear()}`;
}
