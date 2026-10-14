import type { PillTone } from "@/components/ui/Pill";
import { WOREDA_HEALTH, statusFor, type KebeleStatus } from "./supervisor";

// Executive (Regional) home — read-only roll-up one level above the Supervisor view (FSD §2.4).
// Figures are derived from the same kebele rows the Supervisor sees, so the two views never disagree.

export interface WoredaRollup {
  woreda: string;
  kebeles: number;
  farmers: number;
  agents: number;
  /** Farmer-weighted visit coverage across the woreda's kebeles. */
  visitPct: number;
  dataQuality: number;
  openGrievances: number;
  atRisk: number;
  status: KebeleStatus;
  updatedAt: string;
}

const weightedVisitPct = (kebeles: { farmers: number; visitPct: number }[]) => {
  const farmers = kebeles.reduce((s, k) => s + k.farmers, 0);
  if (farmers === 0) return 0;
  return Math.round(kebeles.reduce((s, k) => s + k.visitPct * k.farmers, 0) / farmers);
};

export const WOREDA_ROLLUPS: WoredaRollup[] = WOREDA_HEALTH.map((w) => {
  const visitPct = weightedVisitPct(w.kebeles);
  return {
    woreda: w.woreda,
    kebeles: w.kebeles.length,
    farmers: w.stats.farmers,
    agents: w.stats.activeAgents,
    visitPct,
    dataQuality: w.stats.dataQuality,
    openGrievances: w.stats.openGrievances,
    atRisk: w.kebeles.filter((k) => k.status === "At risk").length,
    status: statusFor(visitPct),
    updatedAt: w.updatedAt,
  };
});

export interface RegionSummary {
  region: string;
  woredas: number;
  kebeles: number;
  farmers: number;
  agents: number;
  visitPct: number;
  dataQuality: number;
  openGrievances: number;
  atRiskKebeles: number;
  updatedAt: string;
}

const allKebeles = WOREDA_HEALTH.flatMap((w) => w.kebeles);

export const REGION_SUMMARY: RegionSummary = {
  region: "Oromia",
  woredas: WOREDA_ROLLUPS.length,
  kebeles: allKebeles.length,
  farmers: WOREDA_ROLLUPS.reduce((s, w) => s + w.farmers, 0),
  agents: WOREDA_ROLLUPS.reduce((s, w) => s + w.agents, 0),
  visitPct: weightedVisitPct(allKebeles),
  // Farmer-weighted so a small woreda cannot swing the regional score.
  dataQuality: Math.round(
    WOREDA_ROLLUPS.reduce((s, w) => s + w.dataQuality * w.farmers, 0) / WOREDA_ROLLUPS.reduce((s, w) => s + w.farmers, 0),
  ),
  openGrievances: WOREDA_ROLLUPS.reduce((s, w) => s + w.openGrievances, 0),
  atRiskKebeles: allKebeles.filter((k) => k.status === "At risk").length,
  updatedAt: "15 Sep 2026",
};

/** Kebeles needing regional attention, worst coverage first. */
export const REGION_WATCHLIST = WOREDA_HEALTH.flatMap((w) =>
  w.kebeles.filter((k) => k.status !== "On track").map((k) => ({ ...k, woreda: w.woreda })),
).sort((a, b) => a.visitPct - b.visitPct);

export const TREND_TONE: Record<"up" | "down" | "flat", PillTone> = { up: "green", down: "red", flat: "slate" };
