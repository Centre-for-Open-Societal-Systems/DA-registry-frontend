"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getFarmer } from "@/features/farmers/data";
import { VISIT_TIMELINE } from "../data";
import type { VisitRecord } from "../types";
import { VisitFarmerCard } from "./VisitFarmerCard";
import { VisitStatusPill } from "./VisitStatusPill";

interface VisitDetailsModalProps {
  visit: VisitRecord | null;
  onClose: () => void;
  onReschedule: (visit: VisitRecord) => void;
}

export function VisitDetailsModal({ visit, onClose, onReschedule }: VisitDetailsModalProps) {
  if (!visit) return null;
  const farmer = getFarmer(visit.farmerId);

  const info: { label: string; value: string; highlight?: boolean; small?: boolean }[] = [
    { label: "Agent", value: visit.agent },
    { label: "Purpose", value: visit.purpose },
    { label: "Date & time", value: `Today - ${visit.time}`, highlight: true },
    { label: "Plot reference", value: visit.plotRef, small: true },
    { label: "Kebele", value: visit.kebele, small: true },
    { label: "Estimated duration", value: `${visit.durationMin} min`, highlight: true },
  ];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Visit details"
      titleAddon={<VisitStatusPill status={visit.status} className="min-w-0" />}
      size="xl"
      footer={
        <>
          <Link
            href={`/visits/${visit.id}`}
            className="mr-auto text-[13.5px] font-semibold text-brand-green hover:underline"
          >
            Open visit planner &rarr;
          </Link>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="brand" onClick={() => onReschedule(visit)}>
            Reschedule
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <VisitFarmerCard visit={visit} phone={farmer?.phone} />

        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-[#E5E7EB] md:grid-cols-2">
          {/* Visit information */}
          <section className="border-b border-[#E5E7EB] md:border-b-0 md:border-r">
            <h3 className="border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-[14.5px] font-semibold text-[#1a2b3c]">
              Visit Information
            </h3>
            <dl>
              {info.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] px-4 py-3.5 last:border-0">
                  <dt className={cn("text-[#475569]", row.small ? "text-[12.5px]" : "text-[14px]")}>{row.label}</dt>
                  <dd className={cn("text-[14px] font-semibold", row.highlight ? "text-brand-green" : "text-[#1a2b3c]")}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Status timeline */}
          <section>
            <h3 className="border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-[14.5px] font-semibold text-[#1a2b3c]">
              Status timeline
            </h3>
            <ol className="px-4 py-4">
              {VISIT_TIMELINE.map((entry, index) => {
                const isLast = index === VISIT_TIMELINE.length - 1;
                return (
                  <li key={entry.label} className={cn("relative pl-6", !isLast && "pb-5")}>
                    <span
                      className={cn(
                        "absolute left-0 top-1.5 h-3 w-3 rounded-full border-2",
                        entry.done ? "border-brand-green bg-brand-green" : "border-[#CBD5E1] bg-white",
                      )}
                    />
                    {!isLast && <span className="absolute bottom-0 left-[5px] top-[18px] w-px bg-[#E2E8F0]" />}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={cn("text-[14px]", entry.done ? "font-semibold text-[#1a2b3c]" : "text-[#475569]")}>{entry.label}</p>
                        {entry.by && <p className="mt-0.5 text-[13px] text-[#64748b]">{entry.by}</p>}
                      </div>
                      <p className="shrink-0 text-[12.5px] text-[#64748b]">{entry.when}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </Modal>
  );
}
