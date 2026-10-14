export const ISSUE_CATEGORIES = [
  "Operational",
  "Equipment / supplies",
  "Payment / incentive",
  "Safety",
  "Data / system",
  "HR",
] as const;
export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

export const ISSUE_SEVERITIES = ["Low", "Medium", "High"] as const;
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

export const ISSUE_STATUSES = [
  "Queued (offline)",
  "Submitted",
  "New",
  "In Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export interface Issue {
  id: string; // e.g. ISS-2041
  subject: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  relatedTo?: string;
  status: IssueStatus;
  submittedLabel: string; // relative time, e.g. "2 days ago"
  note: string; // e.g. "Assigned to Finance desk · SLA 3d"
}

export const RELATED_OPTIONS = [
  "Kebele: Bako Tibe",
  "Kebele: Gedo",
  "Kebele: Dendi",
  "Farmer: Abebe Kebede",
  "Visit: 12 Jun — Bako Tibe",
  "Not related to a specific record",
];

export const SAMPLE_ISSUES: Issue[] = [
  {
    id: "ISS-2041",
    subject: "Motorcycle repair delayed 2+ weeks",
    description: "Assigned motorcycle at Bako Tibe garage since 8 Jun. Blocking scheduled visits in 3 kebeles. Requested a loaner twice with no response.",
    category: "Equipment / supplies",
    severity: "High",
    relatedTo: "Kebele: Bako Tibe",
    status: "Queued (offline)",
    submittedLabel: "just now",
    note: "On this device · not yet sent",
  },
  {
    id: "ISS-2038",
    subject: "Incentive payment for May not received",
    description: "",
    category: "Payment / incentive",
    severity: "High",
    status: "In Progress",
    submittedLabel: "2 days ago",
    note: "Assigned to Finance desk · SLA 3d",
  },
  {
    id: "ISS-2033",
    subject: "ODK form rejects a valid Fayda ID",
    description: "",
    category: "Data / system",
    severity: "Medium",
    status: "In Review",
    submittedLabel: "4 days ago",
    note: "Supervisor: Kebede Alemu",
  },
  {
    id: "ISS-2027",
    subject: "Field tablet screen cracked",
    description: "",
    category: "Equipment / supplies",
    severity: "Medium",
    status: "Assigned",
    submittedLabel: "6 days ago",
    note: "Assigned to IT support",
  },
  {
    id: "ISS-2019",
    subject: "Request PPE for pesticide demonstrations",
    description: "",
    category: "Safety",
    severity: "Medium",
    status: "Submitted",
    submittedLabel: "12 days ago",
    note: "Awaiting triage",
  },
  {
    id: "ISS-2004",
    subject: "Duplicate farmer records in Koye Feche",
    description: "",
    category: "Data / system",
    severity: "Low",
    status: "Resolved",
    submittedLabel: "3 weeks ago",
    note: "Merged by data team",
  },
  {
    id: "ISS-1987",
    subject: "Fuel allowance form unavailable",
    description: "",
    category: "Operational",
    severity: "Low",
    status: "Closed",
    submittedLabel: "1 month ago",
    note: "Closed · form restored",
  },
];
