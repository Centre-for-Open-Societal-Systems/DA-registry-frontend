import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ModuleStrip } from "@/features/agents/components/ModuleStrip";
import { FaydaVerification } from "./components/FaydaVerification";

export const metadata: Metadata = {
  title: "Fayda Verification | OpenAgriNet",
  description: "Identity match and duplicate resolution against Fayda ID.",
};

export default function FaydaPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="Fayda verification"
        description="Identity match against Ethiopia's national ID, with duplicate resolution (Merge / Keep / Escalate). Fayda is the external authority; the registry only records outcomes."
      />
      <ModuleStrip activeHref="/agents/fayda" />
      <FaydaVerification />
    </div>
  );
}
