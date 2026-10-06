import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { AGENT_PROFILE } from "@/features/farmers";
import { PersonAvatar } from "@/components/ui/PersonAvatar";

interface AgentHeaderProps {
  /** A submitted change is waiting for supervisor approval. */
  pending: boolean;
}

export function AgentHeader({ pending }: AgentHeaderProps) {
  const p = AGENT_PROFILE;

  return (
    <Card className="flex flex-col gap-4 px-6 py-5 shadow-card sm:flex-row sm:items-center sm:gap-5">
      <div className="h-[64px] w-[64px] shrink-0">
        <PersonAvatar />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[20px] font-semibold tracking-tight text-ink sm:text-[22px]">{p.name}</h1>
          <Pill tone="green">{p.status}</Pill>
          {pending && <Pill tone="amber">Change pending approval</Pill>}
        </div>
        <p className="text-[13.5px] text-slate-600">
          {p.role} · {p.agentId} · {p.location}
        </p>
        <p className="text-[13.5px] text-slate-600">
          {p.email} · {p.phone} · Joined {p.joinedOn}
        </p>
      </div>
    </Card>
  );
}
