import type { Metadata } from "next";
import { SettingsWorkspace } from "./components/SettingsWorkspace";

export const metadata: Metadata = {
  title: "Settings | OpenAgriNet",
  description: "Sync configuration, routing, master data and audit access.",
};

export default function SettingsPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <SettingsWorkspace />
    </div>
  );
}
