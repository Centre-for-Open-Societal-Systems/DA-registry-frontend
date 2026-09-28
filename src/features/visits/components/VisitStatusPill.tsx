import { Pill, type PillTone } from "@/components/ui/Pill";
import type { VisitStatus } from "../types";

const TONES: Record<VisitStatus, PillTone> = {
  Confirmed: "green",
  Planned: "blue",
  Completed: "slate",
  Missed: "red",
};

export function VisitStatusPill({ status, className }: { status: VisitStatus; className?: string }) {
  return (
    <Pill tone={TONES[status]} className={className}>
      {status}
    </Pill>
  );
}
