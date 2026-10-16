import type { PillTone } from "@/components/ui/Pill";

// FR-05 Agent Assignment & Reassignment.
export type AssignmentStatus = "Proposed" | "Validated" | "Flagged" | "Effective" | "Superseded";
export type AgentAssignStatus = "Active" | "Unassigned" | "On-leave" | "Separated";
export type AssociationMode = "Automatic" | "Manual";
/** "Not checked" when no DA position or Kebele boundary was available for the check. */
export type Geofence = "In-boundary" | "Out-of-bounds" | "Not checked";

export interface AgentAssignment {
  daId: string;
  agent: string;
  woreda: string;
  /** Woreda code (e.g. "ET04-W01"); API rows only. */
  woredaCode?: string;
  kebele: string | null;
  /** Kebele code (e.g. "ET04-W01-K01"); API rows only. */
  kebeleCode?: string;
  farmers: number;
  status: AgentAssignStatus;
  assignmentStatus: AssignmentStatus;
  effectiveDate: string;
  geofence: Geofence | null;
  geofenceReason?: string;
  mode: AssociationMode | null;
  /** Supervisor who made this assignment; absent until one is committed. */
  assignedBy?: string;
}

export const ASSIGNMENT_TONE: Record<AssignmentStatus, PillTone> = { Proposed: "slate", Validated: "green", Flagged: "red", Effective: "green", Superseded: "slate" };
export const AGENT_STATUS_TONE: Record<AgentAssignStatus, PillTone> = { Active: "green", Unassigned: "amber", "On-leave": "blue", Separated: "slate" };
