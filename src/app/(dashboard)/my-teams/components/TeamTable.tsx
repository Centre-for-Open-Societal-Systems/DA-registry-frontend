"use client";

import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { ACTIVE_TONE, type Agent } from "@/features/agents";

const UNASSIGNED = "—";

// The DA's Woreda team. Read-only: DAs see their colleagues' work contacts, not registry records (no row links).
export function TeamTable({ team, myDaId }: { team: Agent[]; myDaId: string }) {
  const columns: Column<Agent>[] = [
    {
      key: "name",
      header: "Name",
      cell: (a) => (
        <span className="flex flex-col">
          <span className="flex items-center gap-2 font-medium text-ink">
            {a.fullName}
            {a.daId === myDaId && <Pill tone="green">You</Pill>}
          </span>
          <span className="font-mono text-[12px] text-muted">{a.daId}</span>
        </span>
      ),
    },
    { key: "kebele", header: "Kebele", cell: (a) => (a.kebele === UNASSIGNED ? <span className="text-subtle">Unassigned</span> : a.kebele) },
    { key: "specialisation", header: "Specialisation", cell: (a) => a.specialisation },
    { key: "tier", header: "Education", cell: (a) => a.educationTier },
    { key: "farmers", header: "Farmers", align: "right", cell: (a) => a.farmerCount.toLocaleString() },
    { key: "status", header: "Status", cell: (a) => <Pill tone={ACTIVE_TONE[a.activeStatus]} dot>{a.activeStatus}</Pill> },
    { key: "phone", header: "Phone", cell: (a) => <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="whitespace-nowrap text-ink-soft hover:text-brand-green">{a.phone}</a> },
    { key: "joined", header: "Joined", cell: (a) => <span className="whitespace-nowrap text-[13px] text-muted">{a.joinedAt}</span> },
  ];

  return (
    <Card className="overflow-hidden p-0 shadow-card">
      <DataTable
        searchable
        title={
          <div className="flex items-center gap-2.5">
            <h2 className="text-[15px] font-semibold text-ink">Team members</h2>
            <span className="text-[13px] text-muted">{team.length} agents</span>
          </div>
        }
        itemLabel="agents" columns={columns} rows={team} rowKey={(a) => a.daId} minWidth="960px" emptyTitle="No team members yet" emptyHint="You will see your Woreda colleagues here once your assignment is published." />
    </Card>
  );
}
