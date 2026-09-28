import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiEntryForm } from "./components/KpiEntryForm";

export const metadata: Metadata = {
  title: "KPI Entry | OpenAgriNet",
  description: "Manual entry form or Excel template import for development agent KPIs.",
};

export default function KpiEntryPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Link href="/performance" className="inline-flex w-fit items-center gap-2.5 text-[15px] font-medium text-[#1a2b3c] transition-colors hover:text-brand-green">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back
      </Link>
      <PageHeader
        title="KPI Data Entry & Bulk Import"
        description="Manual entry form or Excel template import for development agent performance KPIs."
      />
      <KpiEntryForm />
    </div>
  );
}
