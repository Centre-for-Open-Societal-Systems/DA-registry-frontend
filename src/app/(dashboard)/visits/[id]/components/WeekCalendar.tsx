"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";
import { PLANNER_DAYS, PLANNER_WEEK } from "@/features/visits/data";
import type { PlannerStatus, PlannerVisit } from "@/features/visits/types";

const LEGEND: { status: PlannerStatus; label: string; dot: string }[] = [
  { status: "scheduled", label: "Scheduled", dot: "bg-[#2563EB]" },
  { status: "completed", label: "Completed", dot: "bg-brand-green" },
  { status: "overdue", label: "Overdue", dot: "bg-[#D97706]" },
];

const VISIT_STYLES: Record<PlannerStatus, { card: string; time: string; dot: string }> = {
  scheduled: { card: "border-[#BFDBFE] bg-[#EFF6FF]", time: "text-[#2563EB]", dot: "bg-[#2563EB]" },
  completed: { card: "border-[#A7E3C7] bg-[#EBFAF2]", time: "text-brand-green", dot: "bg-brand-green" },
  overdue: { card: "border-[#FCD9A8] bg-[#FFF7EB]", time: "text-[#B45309]", dot: "bg-[#D97706]" },
};

const VIEWS = ["Week", "Day", "Month"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_LABELS = PLANNER_DAYS.map((d) => d.label);
const DAY_MS = 86_400_000;

// Days are counted from the planner's first column (the "today" week's Monday = 0), so any week can be derived from it.
const [anchorMonth, anchorYear] = PLANNER_WEEK.month.split(" ");
const ANCHOR = Date.UTC(Number(anchorYear), MONTHS.indexOf(anchorMonth), PLANNER_DAYS[0].dayOfMonth);

const dateOf = (day: number) => new Date(ANCHOR + day * DAY_MS);
const dayOfDate = (d: Date) => Math.round((d.getTime() - ANCHOR) / DAY_MS);
const weekStartOf = (day: number) => Math.floor(day / 7) * 7;
const weekdayLabel = (day: number) => DAY_LABELS[((day % 7) + 7) % 7];
// Sample data only covers the current week; other weeks have no visits yet.
const visitsOn = (day: number): PlannerVisit[] => (day >= 0 && day < PLANNER_DAYS.length ? PLANNER_DAYS[day].visits : []);
const isToday = (day: number) => day >= 0 && day < PLANNER_DAYS.length && !!PLANNER_DAYS[day].isToday;

const monthYear = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const longDate = (day: number) => {
  const d = dateOf(day);
  const label = weekdayLabel(day);
  return `${label.charAt(0)}${label.slice(1).toLowerCase()} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

function weekLabel(start: number) {
  const a = dateOf(start);
  const b = dateOf(start + 6);
  if (a.getUTCMonth() === b.getUTCMonth()) return monthYear(a);
  if (a.getUTCFullYear() === b.getUTCFullYear()) return `${MONTHS[a.getUTCMonth()].slice(0, 3)} – ${MONTHS[b.getUTCMonth()].slice(0, 3)} ${b.getUTCFullYear()}`;
  return `${MONTHS[a.getUTCMonth()].slice(0, 3)} ${a.getUTCFullYear()} – ${MONTHS[b.getUTCMonth()].slice(0, 3)} ${b.getUTCFullYear()}`;
}

function VisitCard({ visit, onClick, active }: { visit: PlannerVisit; onClick?: () => void; active?: boolean }) {
  const style = VISIT_STYLES[visit.status];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("w-full rounded-md border px-2.5 py-2 text-left transition-shadow hover:shadow-sm", style.card, active && "ring-2 ring-brand-green/40")}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-[13px] font-semibold", style.time)}>{visit.time}</span>
        <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      </div>
      <p className="mt-1 text-[13px] font-semibold text-[#1a2b3c]">{visit.farmerName}</p>
      <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-[#475569]">
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        {visit.kebele}
      </p>
    </button>
  );
}

function NoVisits() {
  return (
    <div className="flex h-[74px] items-center justify-center rounded-md border border-dashed border-[#E2E8F0] text-[13px] text-[#64748b]">
      No visits
    </div>
  );
}

export function WeekCalendar() {
  const [view, setView] = useState("Week");
  // The day the calendar is showing (its week / the day itself / its month).
  const [cursor, setCursor] = useState(0);
  // Day and visit the user clicked in the grid.
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);

  const selectDay = (day: number, visitKey: string | null = null) => {
    setSelectedDay(day);
    setSelectedVisit(visitKey);
    setCursor(day);
  };

  const step = (dir: -1 | 1) => {
    if (view === "Day") {
      setCursor((c) => c + dir);
      setSelectedDay(null);
    } else if (view === "Month") {
      const d = dateOf(cursor);
      setCursor(dayOfDate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + dir, 1))));
    } else {
      setCursor((c) => weekStartOf(c) + dir * 7);
    }
  };

  const changeView = (next: string) => {
    if (next === "Day" && selectedDay != null) setCursor(selectedDay);
    setView(next);
  };

  const weekStart = weekStartOf(cursor);
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i);
  const cursorDate = dateOf(cursor);
  const label = view === "Day" ? longDate(cursor) : view === "Month" ? monthYear(cursorDate) : weekLabel(weekStart);
  const unit = view === "Day" ? "day" : view === "Month" ? "month" : "week";
  const onCurrent = view === "Day" ? cursor === 0 : view === "Month" ? monthYear(cursorDate) === monthYear(dateOf(0)) : weekStart === 0;

  // Month grid: blanks up to the first day's column, then every day of the month.
  const firstOfMonth = dayOfDate(new Date(Date.UTC(cursorDate.getUTCFullYear(), cursorDate.getUTCMonth(), 1)));
  const daysInMonth = new Date(Date.UTC(cursorDate.getUTCFullYear(), cursorDate.getUTCMonth() + 1, 0)).getUTCDate();
  const leading = ((firstOfMonth % 7) + 7) % 7;
  const selectedVisits = selectedDay != null ? visitsOn(selectedDay) : [];

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] px-5 py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} aria-label={`Previous ${unit}`} className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 text-[#475569] transition-colors hover:bg-zinc-50">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="px-1 text-[15px] font-semibold text-[#1a2b3c]" aria-live="polite">{label}</span>
          <button type="button" onClick={() => step(1)} aria-label={`Next ${unit}`} className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 text-[#475569] transition-colors hover:bg-zinc-50">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
          {!onCurrent && (
            <button
              type="button"
              onClick={() => {
                setCursor(0);
                setSelectedDay(null);
              }}
              className="ml-1 text-[13px] font-semibold text-brand-green hover:underline"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-[#475569]">
            {LEGEND.map((item) => (
              <li key={item.status} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", item.dot)} />
                {item.label}
              </li>
            ))}
          </ul>
          <label htmlFor="calendar-view" className="sr-only">Calendar view</label>
          <Dropdown
            id="calendar-view"
            value={view}
            onChange={changeView}
            options={VIEWS}
            align="right"
            className="w-[120px] [&>button]:h-9 [&>button]:text-[13.5px]"
          />
        </div>
      </div>

      {view === "Week" && (
        <div className="overflow-x-auto p-4 sm:p-6">
          <div className="grid min-w-[900px] grid-cols-7 gap-2.5">
            {weekDays.map((day) => {
              const today = isToday(day);
              const selected = selectedDay === day;
              const visits = visitsOn(day);
              return (
                <div
                  key={day}
                  className={cn(
                    "flex min-h-[310px] flex-col gap-2.5 rounded-lg p-2.5",
                    today ? "border border-[#E5E7EB] bg-[#F8FAFC]" : "",
                    selected && "border border-brand-green/50 bg-[#F0FAF5]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => selectDay(day)}
                    aria-pressed={selected}
                    aria-label={`Select ${longDate(day)}`}
                    className="flex flex-col items-center gap-1 rounded-md py-1 transition-colors hover:bg-white/70"
                  >
                    <span className={cn("text-[12px] font-semibold tracking-wide", today || selected ? "text-brand-green" : "text-[#475569]")}>
                      {weekdayLabel(day)}
                    </span>
                    <span
                      className={cn(
                        "flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[13.5px] font-semibold",
                        today ? "bg-brand-green text-white" : selected ? "bg-[#DCFCE7] text-brand-green" : "text-[#1a2b3c]",
                      )}
                    >
                      {dateOf(day).getUTCDate()}
                    </span>
                  </button>

                  {visits.length === 0 ? (
                    <NoVisits />
                  ) : (
                    visits.map((v) => {
                      const key = `${day}-${v.time}`;
                      return <VisitCard key={key} visit={v} active={selectedVisit === key} onClick={() => selectDay(day, key)} />;
                    })
                  )}
                </div>
              );
            })}
          </div>

          {selectedDay != null && (
            <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-[#1a2b3c]">
                  {longDate(selectedDay)} · {selectedVisits.length === 0 ? "no visits" : `${selectedVisits.length} visit${selectedVisits.length === 1 ? "" : "s"}`}
                </p>
                <div className="flex items-center gap-3">
                  <Link href="/visits" className="text-[13px] font-semibold text-brand-green hover:underline">
                    Visits log &rarr;
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDay(null);
                      setSelectedVisit(null);
                    }}
                    aria-label="Clear selected day"
                    className="rounded p-0.5 text-[#64748b] hover:text-[#1a2b3c]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                </div>
              </div>
              {selectedVisits.length === 0 ? (
                <p className="mt-1 text-[13px] text-[#64748b]">Nothing planned — use Plan visit to arrange one with a farmer.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1.5">
                  {selectedVisits.map((v) => {
                    const key = `${selectedDay}-${v.time}`;
                    return (
                      <li key={key} className={cn("flex items-center gap-2.5 rounded-md px-2 py-1 text-[13px] text-[#334155]", selectedVisit === key && "bg-[#F0FAF5]")}>
                        <span className={cn("h-2 w-2 rounded-full", VISIT_STYLES[v.status].dot)} />
                        <span className={cn("font-semibold", VISIT_STYLES[v.status].time)}>{v.time}</span>
                        <span className="font-medium text-[#1a2b3c]">{v.farmerName}</span>
                        <span className="text-[#64748b]">· {v.kebele} kebele · {v.status}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {view === "Day" && (
        <div className="flex flex-col gap-2.5 p-4 sm:p-6">
          {visitsOn(cursor).length === 0 ? (
            <NoVisits />
          ) : (
            visitsOn(cursor).map((v) => {
              const key = `${cursor}-${v.time}`;
              return <VisitCard key={key} visit={v} active={selectedVisit === key} onClick={() => setSelectedVisit(key)} />;
            })
          )}
        </div>
      )}

      {view === "Month" && (
        <div className="overflow-x-auto p-4 sm:p-6">
          <div className="grid min-w-[560px] grid-cols-7 gap-1.5">
            {DAY_LABELS.map((d) => (
              <span key={d} className="py-1 text-center text-[12px] font-semibold tracking-wide text-[#475569]">{d}</span>
            ))}
            {Array.from({ length: leading }, (_, i) => <span key={`blank-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = firstOfMonth + i;
              const visits = visitsOn(day);
              const today = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    selectDay(day);
                    setView("Week");
                  }}
                  aria-label={`${longDate(day)}, ${visits.length} visits`}
                  className={cn(
                    "flex h-16 flex-col items-start gap-1 rounded-md border px-2 py-1.5 text-left transition-colors hover:border-brand-green/50",
                    today ? "border-[#E5E7EB] bg-[#F8FAFC]" : "border-[#F1F5F9]",
                    selectedDay === day && "border-brand-green/50 bg-[#F0FAF5]",
                  )}
                >
                  <span className={cn("flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[13px] font-semibold", today ? "bg-brand-green text-white" : "text-[#1a2b3c]")}>
                    {i + 1}
                  </span>
                  {visits.length > 0 && (
                    <span className="flex items-center gap-1">
                      {visits.map((v) => <span key={v.time} className={cn("h-1.5 w-1.5 rounded-full", VISIT_STYLES[v.status].dot)} />)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
