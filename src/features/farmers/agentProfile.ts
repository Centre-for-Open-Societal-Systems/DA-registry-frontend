// The signed-in development agent's own profile — sample values until the profile / HR APIs land.

export const AGENT_PROFILE = {
  name: "Tadesse Alemu",
  role: "Development Agent",
  agentId: "DA-00012351",
  location: "Bako Tibe kebele, Adama woreda, Oromia",
  email: "tadesse.alemu@moa.gov.et",
  phone: "+251 91 234 5678",
  joinedOn: "12 Jul 2022",
  status: "Active",
};

export const AGENT_STATS = {
  yearsOfService: "3.2",
  serviceSince: "Since Jul 2022",
  kebelesAssigned: 2,
  kebeles: "Bako Tibe, Gedo",
  certifications: 3,
  certificationsPending: 1,
  performanceTier: "T1",
  performanceNote: "Star performer · Q2 2024",
};

// Read-only summary mirrored from Agrilearn.
export const LEARNING_SUMMARY = {
  completed: 6,
  assigned: 8,
  certificationsCurrent: 3,
  note: "1 mandatory course (Climate-Smart Agriculture) due 30 Sep. Reflected read-only from Agrilearn.",
  agrilearnUrl: "#",
};

export interface LeaveBalance {
  type: string;
  entitlement: number;
  used: number;
  /** Tailwind classes for the left accent bar, the progress fill and the card tint. */
  accent: string;
  bar: string;
  tint: string;
}

export const LEAVE_YEAR = 2026;

export const LEAVE_BALANCES: LeaveBalance[] = [
  { type: "Annual leave", entitlement: 20, used: 12, accent: "border-l-brand-green", bar: "bg-brand-green", tint: "border-brand-border bg-brand-wash" },
  { type: "Sick leave", entitlement: 15, used: 3, accent: "border-l-danger", bar: "bg-danger", tint: "border-danger-border bg-danger-wash" },
  { type: "Other / statutory", entitlement: 10, used: 0, accent: "border-l-blue-600", bar: "bg-blue-600", tint: "border-blue-200 bg-blue-50" },
];

export type LeaveStatus = "Pending" | "Approved" | "Taken";

export interface LeaveRecord {
  id: string;
  type: string;
  period: string;
  days: number;
  status: LeaveStatus;
  message?: string;
}

export const LEAVE_HISTORY: LeaveRecord[] = [
  { id: "1", type: "Annual leave", period: "15 – 19 Sep 2026", days: 5, status: "Pending", message: "Family vacation planned" },
  { id: "2", type: "Sick leave", period: "04 – 06 Aug 2026", days: 3, status: "Approved", message: "Doctor advised rest" },
  { id: "3", type: "Annual leave", period: "02 – 08 Jun 2026", days: 7, status: "Taken", message: "Personal time off" },
  { id: "4", type: "Maternity (statutory)", period: "02 Jan – 01 Apr 2024", days: 90, status: "Taken", message: "Maternity leave period" },
];
