import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { AGENTS, MY_DA_ID, WOREDA_SUPERVISORS, getTeam } from "@/features/agents";
import { TeamTable } from "./components/TeamTable";

export const metadata: Metadata = {
  title: "My Teams | OpenAgriNet",
  description: "The Development Agents in your Woreda and your supervisor.",
};

export default function MyTeamsPage() {
  const me = AGENTS.find((a) => a.daId === MY_DA_ID);
  const team = getTeam(MY_DA_ID);
  const supervisor = me ? WOREDA_SUPERVISORS[me.woreda] : undefined;

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader title="My Teams" description={me ? `Development Agents in ${me.woreda} Woreda, ${me.region}` : "Your Woreda team"} />

      {supervisor && (
        <Card className="flex flex-col gap-3 px-5 py-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[14px] font-semibold text-brand-green">
              {supervisor.name.split(" ").map((p) => p[0]).join("")}
            </span>
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-muted">Your supervisor</p>
              <p className="text-[15px] font-semibold text-ink">{supervisor.name}</p>
              <p className="text-[13px] text-ink-soft">{supervisor.title} · {supervisor.woreda}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-[13.5px] sm:items-end">
            <a href={`tel:${supervisor.phone.replace(/\s/g, "")}`} className="text-ink-soft hover:text-brand-green">{supervisor.phone}</a>
            <a href={`mailto:${supervisor.email}`} className="text-ink-soft hover:text-brand-green">{supervisor.email}</a>
          </div>
        </Card>
      )}

      <TeamTable team={team} myDaId={MY_DA_ID} />
    </div>
  );
}
