import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SyncQueue } from "./components/SyncQueue";

export const metadata: Metadata = {
  title: "Sync Queue | OpenAgriNet",
  description: "Offline capture queue and sync-conflict resolution.",
};

export default function SyncPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="Sync queue"
        description="Device-sync (app ⇄ server) for everything captured offline. Distinct from Registry Sync (OAN ⇄ MoA). Conflicts stay in a needs-you state until a person decides."
      />
      <SyncQueue />
    </div>
  );
}
