import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { FARMER_PAGE_TABS } from "@/features/farmers";
import { AssignmentsWorkspace } from "./components/AssignmentsWorkspace";

export const metadata: Metadata = {
  title: "Agent Assignment | OpenAgriNet",
  description: "Assign and reassign Development Agents to kebeles with geofence validation.",
};

export default function AssignmentsPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        tabs={FARMER_PAGE_TABS}
        activeHref="/assignments"
        title="Agent Assignment"
        description="Links a DA to their Kebele of operation and, through it, to the farmers they serve. Assign or reassign with an effective date; geofence validation runs on commit."
      />
      <AssignmentsWorkspace />
    </div>
  );
}
