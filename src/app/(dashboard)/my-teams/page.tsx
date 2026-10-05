import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { AGENTS, MY_DA_ID, WOREDA_SUPERVISORS, getTeam } from "@/features/agents";
import { TeamTable } from "./components/TeamTable";

export const metadata: Metadata = {
  title: "My Teams | OpenAgriNet",
  description: "The Development Agents in your Woreda and your supervisor.",
};

const PHONE_ICON = "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z";
const MAIL_ICON = "M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6";

function ContactIcon({ d }: { d: string }) {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function MyTeamsPage() {
  const me = AGENTS.find((a) => a.daId === MY_DA_ID);
  const team = getTeam(MY_DA_ID);
  const supervisor = me ? WOREDA_SUPERVISORS[me.woreda] : undefined;

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader title="My Teams" description={me ? `Development Agents in ${me.woreda} Woreda, ${me.region}` : "Your Woreda team"} />

      {supervisor && (
        <Card className="flex flex-col gap-3 px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
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
            <a href={`tel:${supervisor.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-ink-soft hover:text-brand-green">
              <ContactIcon d={PHONE_ICON} />
              {supervisor.phone}
            </a>
            <a href={`mailto:${supervisor.email}`} className="flex items-center gap-2 text-ink-soft hover:text-brand-green">
              <ContactIcon d={MAIL_ICON} />
              {supervisor.email}
            </a>
          </div>
        </Card>
      )}

      <TeamTable team={team} myDaId={MY_DA_ID} />
    </div>
  );
}
