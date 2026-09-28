import { DataTable, type Column } from "@/components/ui/DataTable";
import { CROP_HISTORY } from "@/features/farmers/data";
import { StatusPill } from "@/features/farmers/components/StatusPill";
import { SectionCard } from "./SectionCard";

type CropRow = (typeof CROP_HISTORY)[number];

const COLUMNS: Column<CropRow>[] = [
  { key: "season", header: "Season", cell: (row) => <span className="font-medium text-[#1a2b3c]">{row.season}</span> },
  { key: "crop", header: "Crop", cell: (row) => row.crop },
  { key: "yield", header: "Yield", cell: (row) => row.yield },
  { key: "status", header: "Status", align: "center", cell: (row) => <StatusPill status={row.status} /> },
];

export function CropHistorySection() {
  return (
    <SectionCard title="Crop History" bodyClassName="p-0">
      <DataTable
        columns={COLUMNS}
        rows={CROP_HISTORY}
        rowKey={(row) => row.season}
        minWidth="440px"
        itemLabel="seasons"
        emptyTitle="No crop history yet"
      />
    </SectionCard>
  );
}
