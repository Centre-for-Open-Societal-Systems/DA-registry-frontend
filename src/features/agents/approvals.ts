// Sample Woreda approval queue: DA self-initiated changes awaiting verification, until the approvals API is wired.
import type { PillTone } from "@/components/ui/Pill";

export type ApprovalKind = "Onboarding" | "Profile change" | "Assignment" | "Specialization";
export type ApprovalRequestStatus = "Awaiting verification" | "Changes requested" | "Approved" | "Rejected";

export const APPROVAL_REQUEST_TONE: Record<ApprovalRequestStatus, PillTone> = {
  "Awaiting verification": "amber",
  "Changes requested": "purple",
  Approved: "green",
  Rejected: "red",
};

export interface ApprovalTrailStep {
  label: string;
  detail: string;
  at: string;
  /** The step the request is currently waiting on. */
  current?: boolean;
}

export interface ApprovalRequest {
  id: string; // submission id
  kind: ApprovalKind;
  title: string;
  /** Short place shown in the queue row, e.g. "Adama" or "Assigned kebele 12". */
  place: string;
  kebele: string;
  woreda: string;
  submittedAt: string;
  submittedBy: { name: string; agentId: string; initials: string };
  status: ApprovalRequestStatus;
  data: { label: string; value: string; verified?: boolean }[];
  trail: ApprovalTrailStep[];
}

const trail = (submittedAt: string, by: string, check: string): ApprovalTrailStep[] => [
  { label: "Submitted", detail: `by ${by} (Development Agent)`, at: submittedAt },
  { label: "Auto-checked", detail: check, at: submittedAt },
  { label: "Awaiting review", detail: "Woreda Extension Officer — Dr. Tewodros M. · Adama woreda", at: "Current", current: true },
];

export const APPROVAL_REQUESTS: ApprovalRequest[] = [
  {
    id: "SUB-89410-ET",
    kind: "Onboarding",
    title: "DA onboarding — Meseret Bekele (DA-00012351)",
    place: "Adama",
    kebele: "Kebele 05",
    woreda: "Adama woreda",
    submittedAt: "Today, 9:40 AM",
    submittedBy: { name: "Almaz Wolde", agentId: "DA-4402", initials: "AW" },
    status: "Awaiting verification",
    data: [
      { label: "Full name", value: "Meseret Bekele" },
      { label: "Assigned kebele", value: "Adama · Kebele 05" },
      { label: "DA-ID", value: "DA-00012351" },
      { label: "Education tier", value: "Diploma" },
      { label: "Phone", value: "+251 92 345 6789" },
      { label: "Fayda ID", value: "3641-2205-9910" },
      { label: "Fayda match", value: "Verified", verified: true },
    ],
    trail: [
      { label: "Submitted", detail: "by Almaz Wolde (Development Agent)", at: "Today, 9:40 AM" },
      { label: "Auto-checked", detail: "Geographical bounds & phone format verified", at: "Today, 9:41 AM" },
      { label: "Awaiting review", detail: "Woreda Extension Officer — Dr. Tewodros M. · Adama woreda", at: "Current", current: true },
    ],
  },
  {
    id: "SUB-89402-ET",
    kind: "Profile change",
    title: "Education updated → Degree (BSc)",
    place: "Assigned kebele 12",
    kebele: "Kebele 12",
    woreda: "Adama woreda",
    submittedAt: "Today, 8:15 AM",
    submittedBy: { name: "Bekele Negash", agentId: "DA-4388", initials: "BN" },
    status: "Awaiting verification",
    data: [
      { label: "Field changed", value: "Education tier" },
      { label: "Previous value", value: "Diploma" },
      { label: "New value", value: "Degree (BSc)" },
      { label: "Institution", value: "Haramaya University" },
      { label: "Certificate", value: "Attached (PDF)", verified: true },
    ],
    trail: trail("Today, 8:15 AM", "Bekele Negash", "Certificate file attached and readable"),
  },
  {
    id: "SUB-89377-ET",
    kind: "Profile change",
    title: "Mobile number updated — verify",
    place: "Assigned kebele 07",
    kebele: "Kebele 07",
    woreda: "Adama woreda",
    submittedAt: "Yesterday, 4:30 PM",
    submittedBy: { name: "Chaltu Dida", agentId: "DA-4371", initials: "CD" },
    status: "Awaiting verification",
    data: [
      { label: "Field changed", value: "Phone" },
      { label: "Previous value", value: "+251 91 118 2045" },
      { label: "New value", value: "+251 93 440 7812" },
      { label: "OTP confirmation", value: "Confirmed", verified: true },
    ],
    trail: trail("Yesterday, 4:30 PM", "Chaltu Dida", "Phone format verified · OTP confirmed"),
  },
  {
    id: "SUB-89351-ET",
    kind: "Assignment",
    title: "Reassignment — Assigned kebele 05 → Assigned kebele 09",
    place: "Adama",
    kebele: "Kebele 09",
    woreda: "Adama woreda",
    submittedAt: "Yesterday, 2:10 PM",
    submittedBy: { name: "Almaz Wolde", agentId: "DA-4402", initials: "AW" },
    status: "Awaiting verification",
    data: [
      { label: "Current kebele", value: "Adama · Kebele 05" },
      { label: "Requested kebele", value: "Adama · Kebele 09" },
      { label: "Reason", value: "Closer to residence" },
      { label: "Farmers affected", value: "212" },
    ],
    trail: trail("Yesterday, 2:10 PM", "Almaz Wolde", "Kebele 09 has an open DA slot"),
  },
  {
    id: "SUB-89210-ET",
    kind: "Specialization",
    title: "Specialization — Livestock health",
    place: "Chefe",
    kebele: "Chefe",
    woreda: "Adama woreda",
    submittedAt: "Oct 24, 11:05 AM",
    submittedBy: { name: "Tadesse Alemu", agentId: "DA-4290", initials: "TA" },
    status: "Awaiting verification",
    data: [
      { label: "Specialization", value: "Livestock health" },
      { label: "Training course", value: "Animal Health Basics (ATI)" },
      { label: "Course status", value: "Completed", verified: true },
    ],
    trail: trail("Oct 24, 11:05 AM", "Tadesse Alemu", "Course completion record found"),
  },
];

export type ApprovalTab = "all" | "onboarding" | "profile" | "assignment";

export const APPROVAL_TABS: { key: ApprovalTab; label: string; kinds: ApprovalKind[] | null }[] = [
  { key: "all", label: "All", kinds: null },
  { key: "onboarding", label: "Onboarding changes", kinds: ["Onboarding"] },
  { key: "profile", label: "Profile changes", kinds: ["Profile change", "Specialization"] },
  { key: "assignment", label: "Assignments", kinds: ["Assignment"] },
];

export const APPROVAL_KEBELES = [...new Set(APPROVAL_REQUESTS.map((r) => r.kebele))];
