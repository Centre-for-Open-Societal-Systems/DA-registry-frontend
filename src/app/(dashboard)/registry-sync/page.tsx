import type { Metadata } from "next";
import { AgentsPageHeader, ModuleStrip } from "@/features/agents";
import { SyncEvents } from "./components/SyncEvents";

export const metadata: Metadata = {
  title: "Registry Sync | OpenAgriNet",
  description: "MoA ⇄ OAN registry synchronisation events, retries and reconciliation.",
};

export default function RegistrySyncPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <AgentsPageHeader />
      <ModuleStrip activeHref="/registry-sync" />
      <SyncEvents />
    </div>
  );
}
