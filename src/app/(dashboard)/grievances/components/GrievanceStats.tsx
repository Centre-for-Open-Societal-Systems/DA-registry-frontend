import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { GrievanceBucket } from "@/features/grievances";

export type StatKey = "All" | GrievanceBucket;

interface StatDef {
  key: StatKey;
  tile: string;
  /** Left accent bar, matching the tile colour. */
  accent: string;
  icon: ReactNode;
}

const STATS: StatDef[] = [
  {
    key: "All",
    accent: "border-l-blue-600",
    tile: "bg-info-tint text-blue-600",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 12l10 5 10-5M2 17l10 5 10-5" />
      </svg>
    ),
  },
  {
    key: "Assigned",
    accent: "border-l-violet-600",
    tile: "bg-violet-tint text-violet-600",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM17 11l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "In Progress",
    accent: "border-l-blue-600",
    tile: "bg-info-tint text-blue-600",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="3" r="1.8" /><circle cx="18.4" cy="5.6" r="1.8" /><circle cx="21" cy="12" r="1.8" />
        <circle cx="18.4" cy="18.4" r="1.8" /><circle cx="12" cy="21" r="1.8" /><circle cx="5.6" cy="18.4" r="1.8" />
        <circle cx="3" cy="12" r="1.8" /><circle cx="5.6" cy="5.6" r="1.8" />
      </svg>
    ),
  },
  {
    key: "More Info Needed",
    accent: "border-l-orange-500",
    tile: "bg-orange-50 text-orange-600",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
  {
    key: "Rejected",
    accent: "border-l-danger",
    tile: "bg-danger-tint text-danger",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
  },
  {
    key: "Resolved",
    accent: "border-l-brand-green",
    tile: "bg-green-100 text-brand-green",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-3.5-3.5 1.4-1.4 2.1 2.1 4.6-4.6 1.4 1.4-6 6z" />
      </svg>
    ),
  },
  {
    key: "Closed",
    accent: "border-l-slate-500",
    tile: "bg-slate-100 text-slate-600",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" />
      </svg>
    ),
  },
];

interface GrievanceStatsProps {
  active: StatKey;
  /** Counts of the table's currently filtered rows, so each card matches what clicking it shows. */
  counts: Record<StatKey, number>;
  onSelect: (key: StatKey) => void;
}

// Clicking a card filters the table to that status; "All" clears it.
export function GrievanceStats({ active, counts, onSelect }: GrievanceStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {STATS.map((stat) => {
        const isActive = active === stat.key;
        return (
          <button key={stat.key} type="button" onClick={() => onSelect(stat.key)} aria-pressed={isActive} className="text-left">
            <Card
              className={cn(
                "group flex h-full items-center justify-between gap-2 border-l-4 px-3 py-3.5 shadow-card transition-shadow hover:shadow-md sm:px-4 sm:py-4",
                stat.accent,
                isActive && "bg-surface ring-1 ring-brand-green"
              )}
            >
              <div className="min-w-0">
                <p className="text-[13px] leading-snug text-ink-soft sm:text-[14px]">{stat.key}</p>
                <p className="mt-1.5 text-[22px] font-semibold leading-none text-ink sm:text-[24px]">{counts[stat.key]}</p>
              </div>
              {/* Smaller tile on phones so two cards fit per row without the label being clipped */}
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1.5 group-hover:scale-[1.15] group-hover:shadow-sm [&>svg]:h-5 [&>svg]:w-5 sm:h-14 sm:w-14 sm:[&>svg]:h-6 sm:[&>svg]:w-6", stat.tile)}>{stat.icon}</div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
