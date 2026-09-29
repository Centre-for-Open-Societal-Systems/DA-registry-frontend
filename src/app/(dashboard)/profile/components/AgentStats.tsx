import { StatCard } from "@/components/ui/StatCard";
import { AGENT_STATS } from "@/features/farmers";

// Smaller round icon tiles than the default StatCard, per the profile mockup.
const TILE = "h-10 w-10 rounded-full";

export function AgentStats() {
  const s = AGENT_STATS;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Years of service"
        value={s.yearsOfService}
        hint={s.serviceSince}
        accent="border-l-brand-green"
        tile={`${TILE} bg-brand-tint text-brand-green`}
        icon={
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        }
      />
      <StatCard
        label="Kebeles assigned"
        value={String(s.kebelesAssigned)}
        hint={s.kebeles}
        accent="border-l-blue-600"
        tile={`${TILE} bg-info-tint text-blue-600`}
        icon={
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2l4 4-4 4-4-4 4-4z" />
            <path d="M12 10v12M8 22h8" />
          </svg>
        }
      />
      <StatCard
        label="Certifications"
        value={String(s.certifications)}
        hint={`${s.certificationsPending} pending verification`}
        accent="border-l-violet-600"
        tile={`${TILE} bg-purple-100 text-violet-600`}
        icon={
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6M8 13h8M8 17h5" />
          </svg>
        }
      />
      <StatCard
        label="Performance tier"
        value={s.performanceTier}
        hint={s.performanceNote}
        accent="border-l-amber-500"
        tile={`${TILE} bg-amber-100 text-amber-600`}
        icon={
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" />
            <path d="M7 6H4a2 2 0 0 0 0 4h3M17 6h3a2 2 0 0 1 0 4h-3" />
          </svg>
        }
      />
    </div>
  );
}
