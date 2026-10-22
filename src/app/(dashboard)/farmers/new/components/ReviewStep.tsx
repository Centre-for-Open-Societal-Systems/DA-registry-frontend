"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { RowAction } from "@/components/ui/RowAction";
import { cn } from "@/lib/utils";
import { isFieldVisible, LOCATION_HIERARCHY_FIELDS, REGISTRY_TABS } from "../registrySpec";

interface ReviewStepProps {
  /** Everything entered so far, keyed by registry field name */
  values: Record<string, string>;
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
  /** Jump back to a step so the agent can edit it */
  onEditStep: (step: number) => void;
}

const FolderIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7a2 2 0 0 1 2-2h4l2 2h10a2 2 0 0 1 2 2v1H2Z" />
    <path d="M2 10h20l-1.5 8.5a2 2 0 0 1-2 1.5H5.5a2 2 0 0 1-2-1.5L2 10Z" />
  </svg>
);

interface ReviewRow {
  label: string;
  value: string;
  required?: boolean;
}

function rowsFor(tabKey: string, values: Record<string, string>): ReviewRow[] {
  const tab = REGISTRY_TABS.find((item) => item.key === tabKey)!;
  const rows: ReviewRow[] = [];
  if (tabKey === "location") {
    // Kebele is the leaf of the hierarchy, so it is the one the registry needs
    for (const field of LOCATION_HIERARCHY_FIELDS) {
      rows.push({ label: field.label, value: values[field.name] ?? "", required: field.name === "kebele" });
    }
  }
  for (const section of tab.sections) {
    for (const field of section.fields) {
      if (isFieldVisible(field, values)) rows.push({ label: field.label, value: values[field.name] ?? "", required: field.required });
    }
  }
  return rows;
}

export function ReviewStep({ values, confirmed, onConfirmedChange, onEditStep }: ReviewStepProps) {
  const [openStep, setOpenStep] = useState<number | null>(null);

  return (
    <Card className="p-0 shadow-card">
      <div className="border-b border-line px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-ink">Review and submit</h2>
      </div>

      <div className="flex flex-col gap-3 px-5 py-4">
        {REGISTRY_TABS.map((tab, index) => {
          const step = index + 1;
          const isOpen = openStep === step;
          const rows = rowsFor(tab.key, values);
          const filled = rows.filter((row) => row.value).length;
          const missing = rows.filter((row) => row.required && !row.value).length;
          return (
            <div key={tab.key} className="overflow-hidden rounded-lg border border-line bg-surface-alt">
              <button
                type="button"
                onClick={() => setOpenStep(isOpen ? null : step)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-green">
                  {FolderIcon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-semibold text-ink">{tab.label}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-soft">{filled} of {rows.length} fields filled</p>
                </div>
                {missing > 0 ? (
                  <Pill tone="amber" className="shrink-0">{missing} required missing</Pill>
                ) : (
                  <Pill tone="green" className="shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Complete
                  </Pill>
                )}
                <svg
                  className={cn("h-5 w-5 shrink-0 text-gray-400 transition-transform", isOpen && "rotate-180")}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="border-t border-line bg-white px-5 py-4">
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
                    {rows.map((row) => (
                      <div key={row.label}>
                        <dt className="text-[12.5px] text-ink-soft">{row.label}</dt>
                        <dd className={cn("text-[14px]", row.value ? "font-medium text-ink" : "text-gray-400")}>{row.value || "Not provided"}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex justify-end">
                    <RowAction tone="brand" icon="edit" onClick={() => onEditStep(step)}>
                      Edit this step
                    </RowAction>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <label className="flex cursor-pointer items-start gap-3 border-t border-line px-5 py-5">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirmedChange(e.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-gray-300 accent-brand-green"
        />
        <span className="text-[14.5px] leading-snug text-ink">
          I confirm the information provided is accurate to the best of my knowledge and consent to it being verified by the
          Woreda office and recorded in the master DA Registry.
        </span>
      </label>
    </Card>
  );
}
