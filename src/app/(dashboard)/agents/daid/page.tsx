import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ModuleStrip } from "@/features/agents/components/ModuleStrip";
import { ExceptionsPanel } from "@/features/agents/components/ExceptionsPanel";
import { IssuancePipeline } from "./components/IssuancePipeline";

export const metadata: Metadata = {
  title: "DA-ID Management | OpenAgriNet",
  description: "DA-ID issuance states and data-quality exceptions.",
};

export default function DaidPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="DA-ID management"
        description="Issuance states (Generated · Queued · Exception · Failed-retry) and the data-quality exceptions that block a DA-ID from being minted."
      />
      <ModuleStrip activeHref="/agents/daid" />
      <IssuancePipeline />
      <ExceptionsPanel compact />
    </div>
  );
}
