import type { Metadata } from "next";
import { AgentsPageHeader, ModuleStrip } from "@/features/agents";
import { ExceptionsPanel } from "@/features/agents";
import { IssuancePipeline } from "./components/IssuancePipeline";

export const metadata: Metadata = {
  title: "DA-ID Management | OpenAgriNet",
  description: "DA-ID issuance states and data-quality exceptions.",
};

export default function DaidPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <AgentsPageHeader />
      <ModuleStrip activeHref="/agents/daid" />
      <IssuancePipeline />
      <ExceptionsPanel compact />
    </div>
  );
}
