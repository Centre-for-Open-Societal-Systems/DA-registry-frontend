import type { Metadata } from "next";
import { AssignmentsWorkspace } from "./components/AssignmentsWorkspace";

export const metadata: Metadata = {
  title: "Agent Assignment | OpenAgriNet",
  description: "Assign and reassign Development Agents to kebeles with geofence validation.",
};

// The page header lives in AssignmentsWorkspace so its "Assign agent" action can open the workspace's modal.
export default function AssignmentsPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <AssignmentsWorkspace />
    </div>
  );
}
