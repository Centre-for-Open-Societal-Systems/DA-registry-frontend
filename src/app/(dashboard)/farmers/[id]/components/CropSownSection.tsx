"use client";

import { useState } from "react";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import type { CropSownTab } from "@/features/farmers";
import { SectionCard } from "./SectionCard";

// Crop Sown Registry record for the farmer: one sub-tab per registry stage, each stage's sections as read-only field grids.
export function CropSownSection({ tabs }: { tabs: CropSownTab[] }) {
  const [active, setActive] = useState(tabs[0].key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className="flex flex-col gap-0">
      <SegmentTabs label="Crop Sown stages" tabs={tabs.map(({ key, label }) => ({ key, label }))} active={active} onChange={setActive} />

      <div key={current.key} className="flex animate-fade-in flex-col gap-5">
        {current.sections.map((section, index) => (
          <SectionCard
            key={section.title}
            title={section.title}
            collapsible
            className={index === 0 ? "rounded-t-none rounded-b-xl border-t-0" : undefined}
          >
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.fields.map((field) => (
                <div key={`${field.key}-${field.label}`} className="min-w-0">
                  <dt className="text-[12px] font-medium uppercase tracking-wider text-muted">{field.label}</dt>
                  <dd className="mt-1 break-words text-[15px] font-bold text-ink">{field.value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
