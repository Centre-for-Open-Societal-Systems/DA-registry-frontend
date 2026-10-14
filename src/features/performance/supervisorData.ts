// Sample woreda performance data until the KPI aggregation API is wired.
import type { FilterFieldConfig } from "@/components/ui/AdvancedFiltersDrawer";
import type { FilterOption } from "@/components/ui/FilterDropdown";
import type { PillTone } from "@/components/ui/Pill";

export const REGIONS = ["Oromia", "Amhara", "Sidama", "SNNP", "Tigray"];
export const PERIODS = ["Last 7 days", "Last 30 days", "Last 90 days", "This quarter", "This year"];

export const WOREDA_SUMMARY = {
  woreda: "Adama woreda",
  agentCount: 24,
};

export interface SupervisorPerformanceStat {
  key: string;
  label: string;
  value: string;
  accent: string; // border-l-* class
  tile: string; // icon tile bg/text classes
  icon: "calendar" | "userCheck" | "handshake" | "alert" | "training";
}

export const SUPERVISOR_PERFORMANCE_STATS: SupervisorPerformanceStat[] = [
  { key: "agents", label: "Agents", value: "24", accent: "border-l-blue-600", tile: "bg-info-tint text-blue-600", icon: "calendar" },
  { key: "active", label: "Active today", value: "19", accent: "border-l-brand-green", tile: "bg-brand-tint text-brand-green", icon: "userCheck" },
  { key: "visits", label: "Visits (week)", value: "312", accent: "border-l-orange-600", tile: "bg-orange-50 text-orange-600", icon: "handshake" },
  { key: "reviews", label: "Pending reviews", value: "6", accent: "border-l-danger", tile: "bg-danger-tint text-danger", icon: "alert" },
  { key: "training", label: "Training", value: "88%", accent: "border-l-violet-600", tile: "bg-violet-tint text-violet-600", icon: "training" },
];

export type TierCode = "T1" | "T2" | "T3" | "T4";

export interface PerformanceTier {
  code: TierCode;
  name: string;
  count: number;
  rule: string;
  tone: "green" | "blue" | "amber" | "red";
}

// Proposed 4-tier scheme — tiers are auto-assigned by the backend KPI engine each period.
export const PERFORMANCE_TIERS: PerformanceTier[] = [
  { code: "T1", name: "Star performer", count: 6, tone: "green", rule: "Quality ≥ 90% · Visits ≥ 100% of target · Training 100% · 0 open grievances" },
  { code: "T2", name: "On track", count: 11, tone: "blue", rule: "Quality 75–89% · Visits ≥ 80% of target · Training ≥ 80%" },
  { code: "T3", name: "Needs support", count: 5, tone: "amber", rule: "Quality 60–74% OR Visits < 80% target OR Training < 80%" },
  { code: "T4", name: "At risk", count: 2, tone: "red", rule: "Quality < 60% OR Training < 60% OR mandatory course overdue OR SLA breach" },
];

/** Editable thresholds behind the 4 tier rules (percentages). */
export interface TierThresholds {
  t1Quality: number;
  t1Visits: number;
  t1Training: number;
  t2Quality: number;
  t2Visits: number;
  t2Training: number;
  t3Quality: number;
  t4Training: number;
}

export const DEFAULT_TIER_THRESHOLDS: TierThresholds = {
  t1Quality: 90,
  t1Visits: 100,
  t1Training: 100,
  t2Quality: 75,
  t2Visits: 80,
  t2Training: 80,
  t3Quality: 60,
  t4Training: 60,
};

/** Rule text per tier, as shown on the tier cards. */
export function tierRules(t: TierThresholds): Record<TierCode, string> {
  return {
    T1: `Quality ≥ ${t.t1Quality}% · Visits ≥ ${t.t1Visits}% of target · Training ${t.t1Training >= 100 ? "100%" : `≥ ${t.t1Training}%`} · 0 open grievances`,
    T2: `Quality ${t.t2Quality}–${t.t1Quality - 1}% · Visits ≥ ${t.t2Visits}% of target · Training ≥ ${t.t2Training}%`,
    T3: `Quality ${t.t3Quality}–${t.t2Quality - 1}% OR Visits < ${t.t2Visits}% target OR Training < ${t.t2Training}%`,
    T4: `Quality < ${t.t3Quality}% OR Training < ${t.t4Training}% OR mandatory course overdue OR SLA breach`,
  };
}

export type AgentPerformanceStatus = "On track" | "Needs support" | "Check in";

export const PERFORMANCE_STATUS_TONE: Record<AgentPerformanceStatus, PillTone> = {
  "On track": "green",
  "Needs support": "red",
  "Check in": "amber",
};

export interface AgentPerformanceRow {
  id: string;
  daId: string;
  name: string;
  kebele: string;
  visits: number;
  quality: number; // %
  training: number; // %
  status: AgentPerformanceStatus;
  /** Tier assigned by the KPI engine for the current period. */
  tier: TierCode;
}

export const AGENT_PERFORMANCE: AgentPerformanceRow[] = [
  { id: "p1", daId: "DA-OR-0412", name: "Almaz W.", kebele: "Kebele 05", visits: 18, quality: 94, training: 100, status: "On track", tier: "T1" },
  { id: "p2", daId: "DA-OR-0418", name: "Bekele N.", kebele: "Kebele 12", visits: 15, quality: 82, training: 92, status: "On track", tier: "T2" },
  { id: "p3", daId: "DA-OR-0431", name: "Chaltu D.", kebele: "Kebele 07", visits: 11, quality: 88, training: 84, status: "Check in", tier: "T2" },
  { id: "p4", daId: "DA-OR-0447", name: "Dawit G.", kebele: "Kebele 09", visits: 9, quality: 71, training: 76, status: "Needs support", tier: "T3" },
  { id: "p5", daId: "DA-OR-0452", name: "Hana T.", kebele: "Chefe", visits: 20, quality: 96, training: 100, status: "On track", tier: "T1" },
  { id: "p6", daId: "DA-OR-0463", name: "Kedir A.", kebele: "Kebele 01", visits: 16, quality: 79, training: 88, status: "On track", tier: "T2" },
  { id: "p7", daId: "DA-OR-0470", name: "Lensa M.", kebele: "Kebele 07", visits: 12, quality: 66, training: 82, status: "Check in", tier: "T3" },
  { id: "p8", daId: "DA-OR-0488", name: "Mulugeta F.", kebele: "Kebele 09", visits: 17, quality: 85, training: 95, status: "On track", tier: "T2" },
  { id: "p9", daId: "DA-OR-0491", name: "Selam K.", kebele: "Chefe", visits: 19, quality: 91, training: 100, status: "On track", tier: "T1" },
  { id: "p10", daId: "DA-OR-0503", name: "Yared B.", kebele: "Kebele 12", visits: 7, quality: 55, training: 52, status: "Needs support", tier: "T4" },
];

export const TOTAL_DA_IDENTIFIERS = 8412;

const optionsFor = (pick: (row: AgentPerformanceRow) => string): FilterOption[] => {
  const counts = new Map<string, number>();
  AGENT_PERFORMANCE.forEach((row) => counts.set(pick(row), (counts.get(pick(row)) ?? 0) + 1));
  return [...counts].map(([value, count]) => ({ value, label: value, count }));
};

export const PERFORMANCE_AGENT_OPTIONS = optionsFor((r) => r.name);
export const PERFORMANCE_KEBELE_OPTIONS = optionsFor((r) => r.kebele);
export const PERFORMANCE_STATUS_OPTIONS = optionsFor((r) => r.status);
export const PERFORMANCE_TIER_OPTIONS: FilterOption[] = PERFORMANCE_TIERS.map((t) => ({
  value: t.code,
  label: `${t.code} · ${t.name}`,
  count: AGENT_PERFORMANCE.filter((r) => r.tier === t.code).length,
}));

export const PERFORMANCE_FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "agent", label: "Agent", allLabel: "All agents", placeholder: "All Agents", options: PERFORMANCE_AGENT_OPTIONS },
  { key: "kebele", label: "Kebele", allLabel: "All kebeles", placeholder: "All Kebeles", options: PERFORMANCE_KEBELE_OPTIONS },
  { key: "status", label: "Status", allLabel: "All Status", placeholder: "All Status", options: PERFORMANCE_STATUS_OPTIONS },
  { key: "tier", label: "Tier", allLabel: "All tiers", placeholder: "All Tiers", options: PERFORMANCE_TIER_OPTIONS },
];

// KPI entry / import form options
export const REPORTING_PERIODS = ["Q3 2026 (Jul - Sep)", "Q2 2026 (Apr - Jun)", "Q1 2026 (Jan - Mar)", "Q4 2025 (Oct - Dec)"];
export const WOREDA_REGIONS = ["Adama Woreda, Oromia", "Bishoftu Woreda, Oromia", "Dendi Woreda, Oromia"];
export const DEVELOPMENT_AGENTS = ["Almaz Wolde", "Bekele Negash", "Chaltu Dida", "Tadesse Alemu"];
export const ASSIGNED_KEBELES = ["Adama, Kebele 01", "Adama, Kebele 05", "Adama, Kebele 07", "Adama, Kebele 12"];

export const KPI_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
