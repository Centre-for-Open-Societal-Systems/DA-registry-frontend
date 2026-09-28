import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReportsList } from "./components/ReportsList";

export const metadata: Metadata = {
  title: "Reports | OpenAgriNet",
  description: "Exportable registry, coverage, sync and activity reports.",
};

export default function ReportsPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader title="Reports" description="Role-scoped exports. Registry search/filter and exports respond within 3 s under normal load; large exports are queued." />
      <ReportsList />
    </div>
  );
}
