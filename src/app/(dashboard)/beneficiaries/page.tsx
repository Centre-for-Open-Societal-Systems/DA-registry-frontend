import type { Metadata } from "next";
import { BeneficiariesWorkspace } from "./components/BeneficiariesWorkspace";

export const metadata: Metadata = {
  title: "Beneficiaries | OpenAgriNet",
  description: "Rule-based beneficiary segments linked to schemes.",
};

export default function BeneficiariesPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <BeneficiariesWorkspace />
    </div>
  );
}
