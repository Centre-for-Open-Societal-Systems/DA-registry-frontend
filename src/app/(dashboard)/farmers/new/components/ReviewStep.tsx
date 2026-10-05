"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { RowAction } from "@/components/ui/RowAction";
import { cn } from "@/lib/utils";

interface ReviewStepProps {
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

const UserIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0Z" />
  </svg>
);

const SECTIONS = [
  { step: 1, title: "Personal Details", description: "Review the profile information", icon: FolderIcon },
  { step: 2, title: "Location and kebele", description: "Review the Location and kebele", icon: FolderIcon },
  { step: 3, title: "ID and documents", description: "Review the ID and documents", icon: FolderIcon },
  { step: 4, title: "Specialisation & qualifications", description: "Review the Specialisation & qualifications", icon: UserIcon },
];

export function ReviewStep({ confirmed, onConfirmedChange, onEditStep }: ReviewStepProps) {
  const [openStep, setOpenStep] = useState<number | null>(null);

  return (
    <Card className="min-h-[480px] p-0 shadow-card">
      <div className="border-b border-line px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-ink">Review and submit</h2>
      </div>

      <div className="flex flex-col gap-3 px-5 py-4">
        {SECTIONS.map((section) => {
          const isOpen = openStep === section.step;
          return (
            <div key={section.step} className="overflow-hidden rounded-lg border border-line bg-surface-alt">
              <button
                type="button"
                onClick={() => setOpenStep(isOpen ? null : section.step)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-green">
                  {section.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-semibold text-ink">{section.title}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-soft">{section.description}</p>
                </div>
                <Pill tone="green" className="shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Complete
                </Pill>
                <svg
                  className={cn("h-5 w-5 shrink-0 text-gray-400 transition-transform", isOpen && "rotate-180")}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="flex items-center justify-between border-t border-line bg-white px-5 py-3">
                  <p className="text-[13px] text-ink-soft">All required fields for this section are filled in.</p>
                  <RowAction tone="brand" icon="edit" onClick={() => onEditStep(section.step)}>
                    Edit this step
                  </RowAction>
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
