import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { AlertsInbox } from "./components/AlertsInbox";

export const metadata: Metadata = {
  title: "Alerts | OpenAgriNet",
  description: "Inbound signal triage — weather source, emergency, knowledge and grievance signals.",
};

export default function AlertsPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader title="Alerts — inbox" description="Inbound triage of knowledge snippets, emergency alerts, weather alerts (source only) and informational signals. Dismiss, or craft a response in Broadcast." />
      <AlertsInbox />
    </div>
  );
}
