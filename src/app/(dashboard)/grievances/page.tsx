import { Metadata } from "next";
import { GrievancesTable } from "./components/GrievancesTable";

export const metadata: Metadata = {
  title: "Grievances | OpenAgriNet",
  description: "Raise and track grievances for yourself or on behalf of a farmer.",
};

export default function GrievancesPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <GrievancesTable />
    </div>
  );
}
