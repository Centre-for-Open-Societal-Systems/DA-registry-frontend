import type { Metadata } from "next";
import { LivestockReportForm } from "./components/LivestockReportForm";

export const metadata: Metadata = {
  title: "Submit Livestock Report | OpenAgriNet",
  description: "Record a farmer's herd composition, animal health and vaccination, feeding and water, production and sales.",
};

export default function LivestockReportPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <LivestockReportForm />
    </div>
  );
}
