import { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { PageTabs } from "@/components/ui/PageTabs";
import { FARMER_PAGE_TABS } from "@/features/farmers/data";
import { PlanVisitButton } from "@/features/farmers/components/PlanVisitButton";
import { VisitsStats } from "./components/VisitsStats";
import { VisitsTable } from "./components/VisitsTable";

export const metadata: Metadata = {
  title: "Visits | OpenAgriNet",
  description: "Planned and completed field visits.",
};

export default function VisitsPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <PageTabs tabs={FARMER_PAGE_TABS} activeHref="/visits" />
        <div className="flex flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-[#1a2b3c] sm:text-[22px]">Visits</h1>
            <p className="mt-1 text-[13.5px] text-[#4a5568]">
              Planned and completed field visits. Visits are planned from farmer availability the DA gathers offline - no
              app-mandated routes.
            </p>
          </div>
          <PlanVisitButton className="shrink-0" />
        </div>
      </Card>

      <VisitsStats />
      <VisitsTable />
    </div>
  );
}
