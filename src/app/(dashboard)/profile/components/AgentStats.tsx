import type { ReactNode } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Pill } from "@/components/ui/Pill";
import { AGENT_STATS } from "@/features/farmers";

// Rounded-square icon tiles, per the profile mockup.
const TILE = "h-12 w-12 rounded-xl";

const icon = (paths: ReactNode) => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths}
  </svg>
);

export function AgentStats() {
  const s = AGENT_STATS;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Years of service"
        value={s.yearsOfService}
        hint={s.serviceSince}
        accent="border-l-blue-600"
        tile={`${TILE} bg-info-tint text-blue-600`}
        icon={icon(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>)}
      />
      <StatCard
        label="Kebeles assigned"
        value={String(s.kebelesAssigned)}
        hint={s.kebeles}
        accent="border-l-orange-500"
        tile={`${TILE} bg-orange-50 text-orange-500`}
        icon={icon(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>)}
      />
      <StatCard
        label="Certifications"
        value={String(s.certifications)}
        hint={
          <span className="flex items-center gap-1.5">
            <Pill tone="red">{s.certificationsPending} Pending</Pill>
            verification
          </span>
        }
        accent="border-l-violet-600"
        tile={`${TILE} bg-purple-100 text-violet-600`}
        icon={icon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>)}
      />
      <StatCard
        label="Performance tier"
        value={s.performanceTier}
        hint={s.performanceNote}
        accent="border-l-brand-green"
        tile={`${TILE} bg-brand-tint text-brand-green`}
        icon={icon(<><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M7 6H4a2 2 0 0 0 0 4h3M17 6h3a2 2 0 0 1 0 4h-3" /></>)}
      />
    </div>
  );
}
