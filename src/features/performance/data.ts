// Sample performance data for the signed-in agent until the performance API is wired.

export interface PerformanceStat {
  key: string;
  label: string;
  value: string;
  hint: string;
  accent: string; // border-l-* class
  tile: string; // icon tile bg/text classes
  icon: "calendar" | "users" | "check" | "hourglass" | "tasks" | "megaphone" | "clock" | "star" | "map";
}

export const QUARTERS = ["Q3 2026 (Jul - Sep)", "Q2 2026 (Apr - Jun)", "Q1 2026 (Jan - Mar)", "Q4 2025 (Oct - Dec)"];

export const AGENT_SUMMARY = {
  name: "Tadesse Alemu",
  role: "Development Agent",
  kebele: "Bako Tibe kebele",
};

export const PERFORMANCE_STATS: PerformanceStat[] = [
  { key: "visits", label: "Visits this week", value: "12", hint: "Target: 10 visits", accent: "border-l-blue-600", tile: "bg-info-tint text-blue-600", icon: "calendar" },
  { key: "farmers", label: "Farmers supported", value: "148", hint: "Active this quarter", accent: "border-l-violet-600", tile: "bg-violet-tint text-violet-600", icon: "users" },
  { key: "registrations", label: "Registrations completed", value: "34", hint: "All records verified", accent: "border-l-brand-green", tile: "bg-brand-tint text-brand-green", icon: "check" },
  { key: "tasks", label: "Tasks completed", value: "27 / 31", hint: "4 remaining", accent: "border-l-brand-green", tile: "bg-brand-tint text-brand-green", icon: "tasks" },
  { key: "grievances", label: "Grievances resolved", value: "9", hint: "2 still open", accent: "border-l-danger", tile: "bg-danger-tint text-danger", icon: "megaphone" },
  { key: "response", label: "Avg. response time", value: "1.8 d", hint: "On farmer queries", accent: "border-l-cyan-600", tile: "bg-cyan-50 text-cyan-600", icon: "clock" },
  { key: "satisfaction", label: "Farmer satisfaction", value: "4.6 / 5", hint: "From 62 surveys", accent: "border-l-yellow-600", tile: "bg-yellow-100 text-yellow-600", icon: "star" },
  { key: "fieldDays", label: "Field days", value: "38", hint: "This quarter", accent: "border-l-blue-600", tile: "bg-info-tint text-blue-600", icon: "map" },
];

export type GoalStatus = "On track" | "Needs attention" | "At risk";

export interface Goal {
  id: string;
  title: string;
  target: string;
  due: string;
  progress: number; // 0-100
  status: GoalStatus;
}

export const GOALS: Goal[] = [
  { id: "g1", title: "Deliver crop protection workshops to local cooperatives", target: "5 workshops", due: "30 Oct 2026", progress: 80, status: "On track" },
  { id: "g2", title: "Register new households for the early warning alert system", target: "50 farmers", due: "15 Nov 2026", progress: 60, status: "On track" },
  { id: "g3", title: "Complete Meher harvest yield surveys for linked farmers", target: "40 farmers", due: "20 Nov 2026", progress: 25, status: "At risk" },
  { id: "g4", title: "Conduct soil testing assessments for plot distribution", target: "15 plots", due: "10 Nov 2026", progress: 35, status: "Needs attention" },
  { id: "g5", title: "Distribution and auditing of high-yield wheat seeds", target: "1,200 kg", due: "31 Oct 2026", progress: 92, status: "On track" },
];

export const FARMER_SATISFACTION = {
  score: 4.6,
  outOf: 5,
  note: "Based on feedback surveys from recent site visits and workshops. Keep up the open coaching communication!",
};

export const UPCOMING_REVIEWS = [
  { id: "r1", title: "Quarterly review", detail: "15 Oct 2026 with Supervisor Almaz Tesfaye" },
];

export const SUPERVISOR_FEEDBACK =
  "Tadesse has shown great dedication in supporting the Bako Tibe community this quarter. His seed distribution reports were exceptionally detailed and timely.";
