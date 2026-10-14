import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { AGENTS, MY_DA_ID, WOREDA_AGRONOMISTS, WOREDA_SUPERVISORS, getTeam, type TeamSupervisor } from "@/features/agents";
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

function ContactCard({ label, person }: { label: string; person: TeamSupervisor }) {
  return (
    <Card className="flex flex-col gap-3 px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[14px] font-semibold text-brand-green">
          {person.name.split(" ").map((p) => p[0]).join("")}
        </span>
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className="text-[15px] font-semibold text-ink">{person.name}</p>
          <p className="text-[13px] text-ink-soft">{person.title} · {person.woreda}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-[13.5px] sm:items-end">
        <a href={`tel:${person.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-ink-soft hover:text-brand-green">
          <ContactIcon d={PHONE_ICON} />
          {person.phone}
        </a>
        <a href={`mailto:${person.email}`} className="flex items-center gap-2 text-ink-soft hover:text-brand-green">
          <ContactIcon d={MAIL_ICON} />
          {person.email}
        </a>
      </div>
    </Card>
  );
}

export default function MyTeamsPage() {
  const me = AGENTS.find((a) => a.daId === MY_DA_ID);
  // A DA's team works one kebele, so every member shows the signed-in DA's kebele.
  const team = getTeam(MY_DA_ID).map((a) => (me ? { ...a, kebele: me.kebele } : a));
  const supervisor = me ? WOREDA_SUPERVISORS[me.woreda] : undefined;
  const agronomist = me ? WOREDA_AGRONOMISTS[me.woreda] : undefined;

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="My Teams"
        description={me ? `Development Agents in ${me.woreda} Woreda, ${me.region}` : "Your Woreda team"}
        actions={
          <Link href="/advisors" className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md bg-brand-green px-5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-green-dark">
            Advisors
          </Link>
        }
      />

      {(supervisor || agronomist) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {supervisor && <ContactCard label="Your supervisor" person={supervisor} />}
          {agronomist && <ContactCard label="Your agronomist" person={agronomist} />}
        </div>
      )}

      <TeamTable team={team} myDaId={MY_DA_ID} />
    </div>
  );
}
