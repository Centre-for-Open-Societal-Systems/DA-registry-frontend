"use client";

import { useState } from "react";
import { HERDS } from "@/features/farmers";
import type { Herd, VaccinationStatus } from "@/features/farmers";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Pill, type PillTone } from "@/components/ui/Pill";
import { SectionCard } from "./SectionCard";

const VACCINATION_TONE: Record<VaccinationStatus, PillTone> = { "Up to date": "green", Due: "amber", Overdue: "red" };

// Livestock counterpart of HoldingsSection: one row per herd or flock, with a details modal.
export function LivestockSection() {
  const [viewing, setViewing] = useState<Herd | null>(null);

  return (
    <SectionCard title="Livestock and Herds" bodyClassName="flex flex-col gap-3">
      {HERDS.map((herd) => (
        <div
          key={herd.code}
          className="flex items-center justify-between rounded-lg border border-line-soft bg-surface px-4 py-3"
        >
          <div>
            <p className="text-[14px] font-semibold text-ink">
              {herd.code} · {herd.animal}
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              {herd.heads} heads · {herd.breed} · {herd.purpose}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone={VACCINATION_TONE[herd.vaccination]}>{herd.vaccination}</Pill>
            <button
              type="button"
              aria-label={`View ${herd.code} details`}
              title="Herd details"
              onClick={() => setViewing(herd)}
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-white hover:text-brand-green"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {viewing && (
        <Modal
          isOpen
          onClose={() => setViewing(null)}
          title={`${viewing.code} · ${viewing.animal}`}
          subtitle={`${viewing.breed} · ${viewing.heads} heads`}
          footer={<Button variant="outline" onClick={() => setViewing(null)}>Close</Button>}
        >
          <dl className="grid grid-cols-2 gap-4">
            {[
              ["Animal", viewing.animal],
              ["Heads", String(viewing.heads)],
              ["Breed", viewing.breed],
              ["Purpose", viewing.purpose],
              ["Housing / grazing", viewing.housing],
              ["Last vaccinated", viewing.lastVaccinated],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[12px] font-medium uppercase tracking-wider text-muted">{label}</dt>
                <dd className="mt-1 text-[14px] text-ink">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-[12px] font-medium uppercase tracking-wider text-muted">Vaccination</dt>
              <dd className="mt-1"><Pill tone={VACCINATION_TONE[viewing.vaccination]}>{viewing.vaccination}</Pill></dd>
            </div>
          </dl>
          <p className="mt-4 text-[12.5px] text-muted">
            Head counts and vaccination dates are DA-recorded during Livestock Survey visits.
          </p>
        </Modal>
      )}
    </SectionCard>
  );
}
