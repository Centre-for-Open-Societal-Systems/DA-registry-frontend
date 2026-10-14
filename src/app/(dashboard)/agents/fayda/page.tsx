import type { Metadata } from "next";
import { AgentsPageHeader, ModuleStrip } from "@/features/agents";
import { FaydaVerification } from "./components/FaydaVerification";

export const metadata: Metadata = {
  title: "Fayda Verification | OpenAgriNet",
  description: "Identity match and duplicate resolution against Fayda ID.",
};

export default function FaydaPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <AgentsPageHeader />
      <ModuleStrip activeHref="/agents/fayda" />
      <FaydaVerification />
    </div>
  );
}
