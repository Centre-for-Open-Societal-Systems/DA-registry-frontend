import type { Metadata } from "next";
import { BackLink } from "@/components/ui/BackLink";
import { CropReportForm } from "./components/CropReportForm";

export const metadata: Metadata = {
  title: "Submit Crop Report | OpenAgriNet",
  description: "Record a farmer's crop sown, planning, cultivation, sowing and harvest details.",
};

export default function CropReportPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href="/dashboard" />
      <CropReportForm />
    </div>
  );
}
