import { Pill, type PillTone } from "@/components/ui/Pill";
import type { GrievancePriority, GrievanceStatus } from "../types";

const STATUS_TONES: Record<GrievanceStatus, PillTone> = {
  "Pending Submit": "amber",
  Submitted: "slate",
  "More Info Needed": "amber",
  Assigned: "blue",
  "In Progress": "blue",
  "Under Review": "purple",
  Resolved: "green",
  Rejected: "red",
  "Pending Submitter": "amber",
  Closed: "slate",
};

const PRIORITY_TONES: Record<GrievancePriority, PillTone> = {
  Critical: "red",
  High: "amber",
  Medium: "blue",
  Low: "green",
};

export function GrievanceStatusPill({ status, className }: { status: GrievanceStatus; className?: string }) {
  return <Pill tone={STATUS_TONES[status]} className={className}>{status}</Pill>;
}

export function GrievancePriorityPill({ priority, className }: { priority: GrievancePriority; className?: string }) {
  return <Pill tone={PRIORITY_TONES[priority]} className={className}>{priority}</Pill>;
}
