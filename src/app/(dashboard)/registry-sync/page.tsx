import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ModuleStrip } from "@/features/agents";
import { SyncEvents } from "./components/SyncEvents";

export const metadata: Metadata = {
  title: "Registry Sync | OpenAgriNet",
  description: "MoA ⇄ OAN registry synchronisation events, retries and reconciliation.",
};

export default function RegistrySyncPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="Registry sync"
        description="Bidirectional synchronisation with the MoA master registry. Each event records entity, direction, timestamp and outcome; failures can be retried or bulk-reconciled."
      />
      <ModuleStrip activeHref="/registry-sync" />
      <SyncEvents />
    </div>
  );
}
