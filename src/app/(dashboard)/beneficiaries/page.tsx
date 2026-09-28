import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { BeneficiariesWorkspace } from "./components/BeneficiariesWorkspace";

export const metadata: Metadata = {
  title: "Beneficiaries | OpenAgriNet",
  description: "Rule-based beneficiary segments linked to schemes.",
};

export default function BeneficiariesPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="Beneficiaries"
        description="Rule-based segments that link farmers to schemes. Removing a link never deletes a Farmer Registry record."
      />
      <BeneficiariesWorkspace />
    </div>
  );
}
