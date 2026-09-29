"use client";

import { Card } from "@/components/ui/Card";
import { visitsOn } from "./calendar";
import { CalendarToolbar } from "./CalendarToolbar";
import { MonthView } from "./MonthView";
import { useWeekCalendar } from "./useWeekCalendar";
import { NoVisits, VisitCard } from "./VisitCard";
import { WeekView } from "./WeekView";

export function WeekCalendar() {
  const c = useWeekCalendar();
  const dayVisits = visitsOn(c.cursor);

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <CalendarToolbar label={c.label} unit={c.unit} onCurrent={c.onCurrent} onStep={c.step} onToday={c.goToday} view={c.view} onViewChange={c.changeView} />

      {c.view === "Week" && (
        <WeekView weekStart={c.weekStart} selectedDay={c.selectedDay} selectedVisit={c.selectedVisit} onSelectDay={c.selectDay} onClearSelection={c.clearSelection} />
      )}

      {c.view === "Day" && (
        <div className="flex flex-col gap-2.5 p-4 sm:p-6">
          {dayVisits.length === 0 ? (
            <NoVisits />
          ) : (
            dayVisits.map((v) => {
              const key = `${c.cursor}-${v.time}`;
              return <VisitCard key={key} visit={v} active={c.selectedVisit === key} onClick={() => c.setSelectedVisit(key)} />;
            })
          )}
        </div>
      )}

      {c.view === "Month" && (
        <MonthView
          cursor={c.cursor}
          selectedDay={c.selectedDay}
          onPickDay={(day) => {
            c.selectDay(day);
            c.setView("Week");
          }}
        />
      )}
    </Card>
  );
}
