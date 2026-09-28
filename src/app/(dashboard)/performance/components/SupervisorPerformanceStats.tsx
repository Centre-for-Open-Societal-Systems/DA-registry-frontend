import type { ReactNode } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { PERFORMANCE_STATS, type PerformanceStat } from "@/features/performance/supervisorData";

const ICONS: Record<PerformanceStat["icon"], ReactNode> = {
  calendar: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  ),
  userCheck: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="8" r="4" /><path d="M3 21v-1a6 6 0 016-6h2a6 6 0 016 6v1" /><path d="M16 5l2 2 4-4" />
    </svg>
  ),
  handshake: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 17l2 2a1 1 0 003-3" /><path d="M14 14l2.5 2.5a1 1 0 003-3l-3.88-3.88a3 3 0 00-4.24 0l-.88.88a1 1 0 11-3-3l2.81-2.81a5.79 5.79 0 017.06-.87l.47.28a2 2 0 001.42.25L21 4" /><path d="M21 3l1 11h-2" /><path d="M3 3L2 14l6.5 6.5a1 1 0 003-3" /><path d="M3 4h8" />
    </svg>
  ),
  alert: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /><path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  training: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h10a2 2 0 012 2v8a2 2 0 01-2 2h-5" /><circle cx="8" cy="11" r="3" /><path d="M3 21v-1a5 5 0 0110 0v1" /><path d="M13 10l3-3 2 2" />
    </svg>
  ),
};

export function SupervisorPerformanceStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {PERFORMANCE_STATS.map((stat) => (
        <StatCard
          key={stat.key}
          label={stat.label}
          value={stat.value}
          accent={stat.accent}
          tile={stat.tile}
          icon={ICONS[stat.icon]}
        />
      ))}
    </div>
  );
}
