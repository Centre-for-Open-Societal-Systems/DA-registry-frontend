"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { PerformanceHeader } from "./PerformanceHeader";
import { PerformanceStats } from "./PerformanceStats";
import { GoalsCard } from "./GoalsCard";
import { StatusCard, SupervisorFeedbackCard, UpcomingReviewsCard } from "./SidePanels";
import { SupervisorPerformanceHeader } from "./SupervisorPerformanceHeader";
import { SupervisorPerformanceStats } from "./SupervisorPerformanceStats";
import { PerformanceTiers } from "./PerformanceTiers";
import { PERFORMANCE_REGISTRY_ID, PerformanceRegistry } from "./PerformanceRegistry";
import type { TierCode } from "@/features/performance/supervisorData";

// Supervisor sees woreda-wide KPIs, tiers and the agent registry; DA sees their own goals.
export function RolePerformance() {
  const role = useAuthStore((s) => s.role);
  const [tierFilter, setTierFilter] = useState<Set<string>>(new Set());

  // "View N DAs" on a tier card narrows the registry to that tier and brings it into view.
  const viewTier = (tier: TierCode) => {
    setTierFilter(new Set([tier]));
    requestAnimationFrame(() => document.getElementById(PERFORMANCE_REGISTRY_ID)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  if (role === "Supervisor") {
    return (
      <div className="flex w-full flex-col gap-4">
        <SupervisorPerformanceHeader />
        <SupervisorPerformanceStats />
        <PerformanceTiers onViewTier={viewTier} />
        <PerformanceRegistry tierFilter={tierFilter} onTierFilterChange={setTierFilter} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <PerformanceHeader />
      <PerformanceStats />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
        <GoalsCard />
        <div className="flex flex-col gap-4">
          <StatusCard />
          <UpcomingReviewsCard />
          <SupervisorFeedbackCard />
        </div>
      </div>
    </div>
  );
}
