"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { OVERVIEW_DOCUMENT_COUNT } from "@/features/farmers/data";
import { HoldingsSection } from "./HoldingsSection";
import { CropHistorySection } from "./CropHistorySection";
import { VisitHistorySection } from "./VisitHistorySection";
import { DocumentsSection } from "./DocumentsSection";

// Advisory notes are Part 2 (Advisory module) and stay hidden until it ships; AdvisoryNotesSection is kept for then.
const TABS = ["Overview", "Holdings", "Crop history", "Visit history", "Documents"] as const;
type Tab = (typeof TABS)[number];

export function ProfileTabs() {
  const [active, setActive] = useState<Tab>("Overview");

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex overflow-x-auto border-b border-[#E5E7EB]" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={cn(
              "whitespace-nowrap px-4 py-3.5 text-[14px] transition-colors",
              active === tab
                ? "-mb-px border-b-2 border-brand-green bg-[#F0FAF5] font-medium text-brand-green"
                : "text-[#4a5568] hover:text-[#1a2b3c]",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div key={active} className="animate-fade-in p-4">
        {active === "Overview" ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <HoldingsSection />
              <CropHistorySection />
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <VisitHistorySection showViewAll />
              <DocumentsSection limit={OVERVIEW_DOCUMENT_COUNT} />
            </div>
          </div>
        ) : (
          <div className="min-h-[560px]">
            {active === "Holdings" && <HoldingsSection />}
            {active === "Crop history" && <CropHistorySection />}
            {active === "Visit history" && <VisitHistorySection />}
            {active === "Documents" && <DocumentsSection />}
          </div>
        )}
      </div>
    </Card>
  );
}
