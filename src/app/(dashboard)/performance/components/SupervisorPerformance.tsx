"use client";

import { useState } from "react";
import { SupervisorPerformanceHeader } from "./SupervisorPerformanceHeader";
import { SupervisorPerformanceStats } from "./SupervisorPerformanceStats";
import { PerformanceTiers } from "./PerformanceTiers";
import { PerformanceRegistry } from "./PerformanceRegistry";

// Supervisor view: woreda-wide KPIs, tiers and the agent registry (filterable by tier).
export function SupervisorPerformance() {
  const [tierFilter, setTierFilter] = useState<Set<string>>(new Set());

  return (
    <div className="flex w-full flex-col gap-4">
      <SupervisorPerformanceHeader />
      <SupervisorPerformanceStats />
      <PerformanceTiers />
      <PerformanceRegistry tierFilter={tierFilter} onTierFilterChange={setTierFilter} />
    </div>
  );
}
