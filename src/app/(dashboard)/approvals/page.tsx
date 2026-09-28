import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApprovalsWorkspace } from "./components/ApprovalsWorkspace";

export const metadata: Metadata = {
  title: "Approvals | OpenAgriNet",
  description: "Woreda verification of DA self-initiated changes before publishing to the master DA Registry.",
};

export default function ApprovalsPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="Approvals"
        description="DA self-initiated changes → routed to your Woreda → verify → approve & publish to the master DA Registry"
      />
      <ApprovalsWorkspace />
    </div>
  );
}
