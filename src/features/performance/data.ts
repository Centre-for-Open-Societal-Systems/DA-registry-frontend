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

export const QUARTERS = ["Q2 2024 (Apr - Jun)", "Q1 2024 (Jan - Mar)", "Q4 2023 (Oct - Dec)", "Q3 2023 (Jul - Sep)"];

export const AGENT_SUMMARY = {
  name: "Tadesse Alemu",
  role: "Development Agent",
  kebele: "Bako Tibe kebele",
};

export const PERFORMANCE_STATS: PerformanceStat[] = [
  { key: "visits", label: "Visits this week", value: "12", hint: "Target: 10 visits", accent: "border-l-[#2563EB]", tile: "bg-[#E6F0FD] text-[#2563EB]", icon: "calendar" },
  { key: "farmers", label: "Farmers supported", value: "148", hint: "Active this quarter", accent: "border-l-[#7C3AED]", tile: "bg-[#F1EAFE] text-[#7C3AED]", icon: "users" },
  { key: "registrations", label: "Registrations completed", value: "34", hint: "All records verified", accent: "border-l-brand-green", tile: "bg-[#E6F5F0] text-brand-green", icon: "check" },
  { key: "training", label: "Training hours", value: "18", hint: "Target: 15 hours", accent: "border-l-[#EA580C]", tile: "bg-[#FFF1E6] text-[#EA580C]", icon: "hourglass" },
  { key: "tasks", label: "Tasks completed", value: "27 / 31", hint: "4 remaining", accent: "border-l-brand-green", tile: "bg-[#E6F5F0] text-brand-green", icon: "tasks" },
  { key: "grievances", label: "Grievances resolved", value: "9", hint: "2 still open", accent: "border-l-[#DC2626]", tile: "bg-[#FEECEC] text-[#DC2626]", icon: "megaphone" },
  { key: "response", label: "Avg. response time", value: "1.8 d", hint: "SLA: 3 days", accent: "border-l-[#0891B2]", tile: "bg-[#E0F7FA] text-[#0891B2]", icon: "clock" },
  { key: "satisfaction", label: "Farmer satisfaction", value: "4.6 / 5", hint: "From 62 surveys", accent: "border-l-[#CA8A04]", tile: "bg-[#FEF9C3] text-[#CA8A04]", icon: "star" },
  { key: "fieldDays", label: "Field days", value: "38", hint: "This quarter", accent: "border-l-[#2563EB]", tile: "bg-[#E6F0FD] text-[#2563EB]", icon: "map" },
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
  { id: "g1", title: "Deliver crop protection workshops to local cooperatives", target: "5 workshops", due: "30 Jun 2024", progress: 80, status: "On track" },
  { id: "g2", title: "Register new households for the early warning alert system", target: "50 farmers", due: "15 Jul 2024", progress: 60, status: "On track" },
  { id: "g3", title: "Register new households for the early warning alert system", target: "50 farmers", due: "15 Jul 2024", progress: 60, status: "On track" },
  { id: "g4", title: "Conduct soil testing assessments for plot distribution", target: "15 plots", due: "10 Jul 2024", progress: 35, status: "Needs attention" },
  { id: "g5", title: "Distribution and auditing of high-yield wheat seeds", target: "1,200 kg", due: "05 Jul 2024", progress: 92, status: "On track" },
];

export const FARMER_SATISFACTION = {
  score: 4.6,
  outOf: 5,
  note: "Based on feedback surveys from recent site visits and workshops. Keep up the open coaching communication!",
};

export const UPCOMING_REVIEWS = [
  { id: "r1", title: "Quarterly review", detail: "15 Jul 2024 with Supervisor Abebe" },
];

export const SUPERVISOR_FEEDBACK =
  "Tadesse has shown great dedication in supporting the Bako Tibe community this quarter. His seed distribution reports were exceptionally detailed and timely.";
