import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { AGENT_PROFILE } from "@/features/farmers";
import { getInitials } from "@/features/farmers";

interface AgentHeaderProps {
  /** A submitted change is waiting for supervisor approval. */
  pending: boolean;
  onEdit: () => void;
}

export function AgentHeader({ pending, onEdit }: AgentHeaderProps) {
  const p = AGENT_PROFILE;

  return (
    <Card className="flex flex-col gap-5 px-4 py-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div
          className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full bg-brand-tint text-[24px] font-semibold text-brand-green"
          aria-hidden="true"
        >
          {getInitials(p.name)}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[20px] font-semibold tracking-tight text-ink sm:text-[22px]">{p.name}</h1>
            <Pill tone="green" dot>
              {p.status}
            </Pill>
            {pending && <Pill tone="amber">Change pending approval</Pill>}
          </div>
          <p className="text-[13.5px] text-slate-600">
            {p.role} · {p.agentId} · {p.location}
          </p>
          <p className="text-[13.5px] text-slate-600">
            {p.email} · {p.phone} · Joined {p.joinedOn}
          </p>
        </div>
      </div>

      <Button variant="brand" size="md" className="w-fit gap-2" onClick={onEdit}>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
        Edit profile
      </Button>
    </Card>
  );
}
