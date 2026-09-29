import { useState } from "react";
import { dateOf, dayOfDate, longDate, monthYear, weekLabel, weekStartOf } from "./calendar";

// View, cursor and selection state for the visits calendar.
export function useWeekCalendar() {
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

  const clearSelection = () => {
    setSelectedDay(null);
    setSelectedVisit(null);
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

  const goToday = () => {
    setCursor(0);
    setSelectedDay(null);
  };

  const changeView = (next: string) => {
    if (next === "Day" && selectedDay != null) setCursor(selectedDay);
    setView(next);
  };

  const weekStart = weekStartOf(cursor);
  const cursorDate = dateOf(cursor);
  const label = view === "Day" ? longDate(cursor) : view === "Month" ? monthYear(cursorDate) : weekLabel(weekStart);
  const unit = view === "Day" ? "day" : view === "Month" ? "month" : "week";
  const onCurrent = view === "Day" ? cursor === 0 : view === "Month" ? monthYear(cursorDate) === monthYear(dateOf(0)) : weekStart === 0;

  return {
    view,
    setView,
    changeView,
    cursor,
    weekStart,
    label,
    unit,
    onCurrent,
    step,
    goToday,
    selectedDay,
    selectedVisit,
    setSelectedVisit,
    selectDay,
    clearSelection,
  };
}
