import type { PillTone } from "@/components/ui/Pill";

// FR-05 Agent Assignment & Reassignment.
export type AssignmentStatus = "Proposed" | "Validated" | "Flagged" | "Effective" | "Superseded";
export type AgentAssignStatus = "Active" | "Unassigned" | "On-leave";
export type AssociationMode = "Automatic" | "Manual";
export type Geofence = "In-boundary" | "Out-of-bounds";

export interface AgentAssignment {
  daId: string;
  agent: string;
  woreda: string;
  kebele: string | null;
  farmers: number;
  status: AgentAssignStatus;
  assignmentStatus: AssignmentStatus;
  effectiveDate: string;
  geofence: Geofence | null;
  geofenceReason?: string;
  mode: AssociationMode | null;
}

export const ASSIGNMENT_TONE: Record<AssignmentStatus, PillTone> = { Proposed: "slate", Validated: "green", Flagged: "red", Effective: "green", Superseded: "slate" };
export const AGENT_STATUS_TONE: Record<AgentAssignStatus, PillTone> = { Active: "green", Unassigned: "amber", "On-leave": "blue" };

export const ASSIGNMENTS: AgentAssignment[] = [
  { daId: "DA-OR-000341", agent: "Tadesse Alemu", woreda: "Bako Tibe", kebele: "Bako 01", farmers: 248, status: "Active", assignmentStatus: "Effective", effectiveDate: "12 Mar 2019", geofence: "In-boundary", mode: "Automatic" },
  { daId: "DA-OR-000342", agent: "Hana Girma", woreda: "Bako Tibe", kebele: "Dambi Gobu", farmers: 193, status: "Active", assignmentStatus: "Effective", effectiveDate: "03 Jul 2020", geofence: "In-boundary", mode: "Automatic" },
  { daId: "DA-OR-000347", agent: "Kebede Alemu", woreda: "Bako Tibe", kebele: "Koye Feche", farmers: 211, status: "On-leave", assignmentStatus: "Effective", effectiveDate: "21 Jan 2017", geofence: "In-boundary", mode: "Manual" },
  { daId: "DA-OR-000355", agent: "Selamawit Haile", woreda: "Bako Tibe", kebele: "Amarti Gibe", farmers: 176, status: "Active", assignmentStatus: "Flagged", effectiveDate: "16 Aug 2026", geofence: "Out-of-bounds", geofenceReason: "Home GPS 2.4 km outside Amarti Gibe boundary", mode: "Automatic" },
  { daId: "DA-OR-000352", agent: "Meseret Bekele", woreda: "Bako Tibe", kebele: null, farmers: 0, status: "Unassigned", assignmentStatus: "Proposed", effectiveDate: "—", geofence: null, mode: null },
  { daId: "DA-OR-000353", agent: "Yohannes Tesfaye", woreda: "Bako Tibe", kebele: null, farmers: 0, status: "Unassigned", assignmentStatus: "Proposed", effectiveDate: "—", geofence: null, mode: null },
  { daId: "DA-OR-000361", agent: "Abebe Wolde", woreda: "Ambo", kebele: "Awaro", farmers: 230, status: "Active", assignmentStatus: "Effective", effectiveDate: "09 Feb 2015", geofence: "In-boundary", mode: "Automatic" },
  { daId: "DA-OR-000362", agent: "Rahel Mulugeta", woreda: "Dendi", kebele: "Ginchi", farmers: 204, status: "Active", assignmentStatus: "Effective", effectiveDate: "30 Nov 2021", geofence: "In-boundary", mode: "Automatic" },
];

// Read-only Kebele coverage summary (§3.5) — managed separately, never edited from the assignment screen.
export const KEBELE_COVERAGE = [
  { kebele: "Bako 01", woreda: "Bako Tibe", agents: 1, farmers: 248, households: 302, coverage: "Full" },
  { kebele: "Bako 02", woreda: "Bako Tibe", agents: 0, farmers: 0, households: 188, coverage: "Uncovered" },
  { kebele: "Dambi Gobu", woreda: "Bako Tibe", agents: 1, farmers: 193, households: 241, coverage: "Full" },
  { kebele: "Koye Feche", woreda: "Bako Tibe", agents: 1, farmers: 211, households: 265, coverage: "Agent on leave" },
  { kebele: "Amarti Gibe", woreda: "Bako Tibe", agents: 1, farmers: 176, households: 220, coverage: "Flagged" },
];
