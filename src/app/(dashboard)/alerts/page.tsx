import type { Metadata } from "next";
import { AlertsInbox } from "./components/AlertsInbox";

export const metadata: Metadata = {
  title: "Alerts | OpenAgriNet",
  description: "Inbound signal triage — weather source, emergency, knowledge and grievance signals.",
};

export default function AlertsPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <AlertsInbox />
    </div>
  );
}
