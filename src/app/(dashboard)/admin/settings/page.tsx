import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsWorkspace } from "./components/SettingsWorkspace";

export const metadata: Metadata = {
  title: "Settings | OpenAgriNet",
  description: "Sync configuration, routing, master data and audit access.",
};

export default function SettingsPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader title="Settings" description="Administrator configuration: MoA/Fayda sync, routing of proposals and issues, administrative master data, and the immutable audit log." />
      <SettingsWorkspace />
    </div>
  );
}
