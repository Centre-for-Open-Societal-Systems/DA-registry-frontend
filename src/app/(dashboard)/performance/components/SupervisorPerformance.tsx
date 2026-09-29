"use client";

import { useState } from "react";
import { SupervisorPerformanceHeader } from "./SupervisorPerformanceHeader";
import { SupervisorPerformanceStats } from "./SupervisorPerformanceStats";
import { PerformanceTiers } from "./PerformanceTiers";
import { PERFORMANCE_REGISTRY_ID, PerformanceRegistry } from "./PerformanceRegistry";
import type { TierCode } from "@/features/performance";

// Supervisor view: woreda-wide KPIs, tiers and the agent registry, linked by a shared tier filter.
export function SupervisorPerformance() {
  const [tierFilter, setTierFilter] = useState<Set<string>>(new Set());

  // "View N DAs" on a tier card narrows the registry to that tier and brings it into view.
  const viewTier = (tier: TierCode) => {
    setTierFilter(new Set([tier]));
    requestAnimationFrame(() => document.getElementById(PERFORMANCE_REGISTRY_ID)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <SupervisorPerformanceHeader />
      <SupervisorPerformanceStats />
      <PerformanceTiers onViewTier={viewTier} />
      <PerformanceRegistry tierFilter={tierFilter} onTierFilterChange={setTierFilter} />
    </div>
  );
}
