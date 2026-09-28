import { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ServiceStatusBanner } from "./components/ServiceStatusBanner";
import { GrievancesTable } from "./components/GrievancesTable";
import { RaiseGrievanceButton } from "./components/RaiseGrievanceButton";

export const metadata: Metadata = {
  title: "Grievances | OpenAgriNet",
  description: "Raise and track grievances for yourself or on behalf of a farmer.",
};

export default function GrievancesPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="Grievances"
        description="Raise and track grievances for yourself or on behalf of a farmer. Triage and resolution happen in the external Grievance Service — this surface is read-only for case handling."
        actions={<RaiseGrievanceButton />}
      />
      <ServiceStatusBanner />
      <GrievancesTable />
    </div>
  );
}
