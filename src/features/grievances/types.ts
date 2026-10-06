export type GrievanceStatus =
  | "Pending Submit"
  | "Submitted"
  | "More Info Needed"
  | "Assigned"
  | "In Progress"
  | "Under Review"
  | "Resolved"
  | "Rejected"
  | "Pending Submitter"
  | "Closed";

export type GrievancePriority = "Low" | "Medium" | "High" | "Critical";

export type GrievanceCategory = "Inputs" | "Schemes" | "Payments" | "Markets" | "Extension" | "Land";

export interface Grievance {
  ticketId: string;
  title: string;
  submitter: string;
  region: string;
  woreda: string;
  type: string;
  category: GrievanceCategory;
  status: GrievanceStatus;
  priority: GrievancePriority;
  submittedAt: string; // e.g. "May 28, 2026, 10:42 AM"
  attachments: number;
  responses: number;
  /** FR-12: whether the DA raised it (own or on behalf) or the farmer submitted directly. */
  raisedBy: "DA" | "Farmer";
}

/** Stat-card buckets derived from record statuses. */
export type GrievanceBucket = "Pending" | "In Progress" | "Under Review" | "Resolved" | "Rejected";

/** One entry in a grievance's communication thread. */
export type ThreadMessage =
  | {
      kind: "submission";
      id: string;
      author: string;
      role: string;
      at: string;
      body: string;
      attachments: string[];
    }
  | {
      kind: "dept-response";
      id: string;
      author: string;
      role: string;
      at: string;
      responseNo: number;
      outcome: string; // e.g. "Partially Resolved"
      actionTaken: string;
      resolutionSummary: string;
      proposedClosure: string; // ISO date
    }
  | {
      kind: "status-change";
      id: string;
      from: GrievanceStatus;
      to: GrievanceStatus;
      by: string;
      at: string;
    }
  | {
      kind: "internal-note";
      id: string;
      author: string;
      role: string;
      at: string;
      body: string;
    };

export interface GrievanceCase {
  grievance: Grievance;
  thread: ThreadMessage[];
  submitter: {
    name: string;
    kind: string; // "Individual Farmer"
    faydaId: string;
    avatar?: string;
    kebele: string;
    channel: string;
    submittedOn: string;
  };
  sla: {
    consumedPct: number;
    submittedOn: string;
    dueOn: string;
  };
}
