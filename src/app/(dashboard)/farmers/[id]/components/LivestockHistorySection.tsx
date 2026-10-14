"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { LIVESTOCK_HISTORY } from "@/features/farmers";
import { StatusPill } from "@/features/farmers";
import { SectionCard } from "./SectionCard";

type LivestockRow = (typeof LIVESTOCK_HISTORY)[number];

const COLUMNS: Column<LivestockRow>[] = [
  { key: "season", header: "Season", cell: (row) => <span className="font-medium text-ink">{row.season}</span> },
  { key: "animal", header: "Livestock", cell: (row) => row.animal },
  { key: "production", header: "Production", cell: (row) => row.production },
  { key: "status", header: "Status", align: "center", cell: (row) => <StatusPill status={row.status} /> },
];

export function LivestockHistorySection() {
  return (
    <SectionCard title="Livestock History" bodyClassName="p-0">
      <DataTable
        columns={COLUMNS}
        rows={LIVESTOCK_HISTORY}
        rowKey={(row) => row.season}
        minWidth="440px"
        itemLabel="seasons"
        emptyTitle="No livestock history yet"
      />
    </SectionCard>
  );
}
