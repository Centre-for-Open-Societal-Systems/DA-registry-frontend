import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { GRIEVANCE_STATS } from "@/features/grievances/data";
import type { GrievanceBucket } from "@/features/grievances/types";

export type StatKey = "All" | GrievanceBucket;

interface StatDef {
  key: StatKey;
  tile: string;
  icon: ReactNode;
}

const STATS: StatDef[] = [
  {
    key: "All",
    tile: "bg-[#E6F0FD] text-[#2563EB]",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 12l10 5 10-5M2 17l10 5 10-5" />
      </svg>
    ),
  },
  {
    key: "Pending",
    tile: "bg-[#FFF1E6] text-[#EA580C]",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2h12M6 22h12M8 2v4l4 5 4-5V2M8 22v-4l4-5 4 5v4" />
      </svg>
    ),
  },
  {
    key: "In Progress",
    tile: "bg-[#E6F0FD] text-[#2563EB]",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="3" r="1.8" /><circle cx="18.4" cy="5.6" r="1.8" /><circle cx="21" cy="12" r="1.8" />
        <circle cx="18.4" cy="18.4" r="1.8" /><circle cx="12" cy="21" r="1.8" /><circle cx="5.6" cy="18.4" r="1.8" />
        <circle cx="3" cy="12" r="1.8" /><circle cx="5.6" cy="5.6" r="1.8" />
      </svg>
    ),
  },
  {
    key: "Under Review",
    tile: "bg-[#F1EAFE] text-[#7C3AED]",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    ),
  },
  {
    key: "Resolved",
    tile: "bg-[#DDF5EA] text-brand-green",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-3.5-3.5 1.4-1.4 2.1 2.1 4.6-4.6 1.4 1.4-6 6z" />
      </svg>
    ),
  },
  {
    key: "Rejected",
    tile: "bg-[#FEECEC] text-[#DC2626]",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
  },
];

interface GrievanceStatsProps {
  active: StatKey;
  onSelect: (key: StatKey) => void;
}

// Clicking a card filters the table to that bucket; "All" clears it.
export function GrievanceStats({ active, onSelect }: GrievanceStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {STATS.map((stat) => {
        const isActive = active === stat.key;
        return (
          <button key={stat.key} type="button" onClick={() => onSelect(stat.key)} aria-pressed={isActive} className="text-left">
            <Card
              className={cn(
                "group flex items-center justify-between gap-2 px-3 py-3.5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md sm:px-4 sm:py-4",
                isActive && "border-brand-green ring-1 ring-brand-green"
              )}
            >
              <div className="min-w-0">
                <p className="text-[13px] leading-snug text-[#4a5568] sm:text-[14px]">{stat.key}</p>
                <p className="mt-1.5 text-[22px] font-semibold leading-none text-[#1a2b3c] sm:text-[24px]">{GRIEVANCE_STATS[stat.key]}</p>
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
