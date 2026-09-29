import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiEntryForm } from "./components/KpiEntryForm";
import { BackLink } from "@/components/ui/BackLink";

export const metadata: Metadata = {
  title: "KPI Entry | OpenAgriNet",
  description: "Manual entry form or Excel template import for development agent KPIs.",
};

export default function KpiEntryPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href="/performance" />
      <PageHeader
        title="KPI Data Entry & Bulk Import"
        description="Manual entry form or Excel template import for development agent performance KPIs."
      />
      <KpiEntryForm />
    </div>
  );
}
