import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ModuleStrip } from "@/features/agents";
import { ExceptionsPanel } from "@/features/agents";
import { AgentsRegistry } from "./components/AgentsRegistry";

export const metadata: Metadata = {
  title: "Agents | OpenAgriNet",
  description: "DA master registry — the single source of truth for the extension workforce.",
};

export default function AgentsPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="Agents"
        description="Single source of truth for Development Agents. Records enter by bulk import or MoA sync and are published after Woreda approval."
      />
      <ModuleStrip />
      <AgentsRegistry />
      <ExceptionsPanel />
    </div>
  );
}
