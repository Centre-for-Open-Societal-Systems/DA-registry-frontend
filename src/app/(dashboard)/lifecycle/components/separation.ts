// Separation form copy, clearance and the second approver, until the lifecycle API is wired.
import { LIFECYCLE_DA, formatDate, type TransitionCopy } from "./lifecycle";
import { CLEARANCE_ITEMS, openItems } from "./retirement";

export const SEPARATION_TYPES = ["Resignation", "Termination", "End of contract"];
export const NOTICE_OPTIONS = ["30 days served", "Waived", "Not served"];

/** Separation signs off at the Woreda first, then with zone / regional HR. */
export const SECOND_APPROVER = { role: "Zone / regional HR", name: "Zone HR", initials: "ZH", label: "Second approver" };
export const FIRST_APPROVER_NAME = LIFECYCLE_DA.approverName.replace(" (Woreda)", "");
export const APPROVERS_LINE = `${FIRST_APPROVER_NAME} → ${SECOND_APPROVER.role}`;

/** Retirement's handover items, with outstanding claims instead of KPI submissions. */
export const SEPARATION_CLEARANCE = [...CLEARANCE_ITEMS.slice(0, 3), { label: "Pending claims settled", status: "Pending", passed: false }];
export const OPEN_SEPARATION_ITEMS = openItems(SEPARATION_CLEARANCE);

export const SEPARATION_FORM: TransitionCopy = {
  slug: "separation",
  code: "SP",
  summary: "Permanent separation from service, such as resignation, termination or end of contract. Needs two approvals.",
  previewCurrent: "Active · Bako Tibe kebele",
  previewAfter: () => "Separated",
  effectiveNote: (d) => `Status becomes Separated on ${d} and access ends.`,
  requestNote: (d) => `Status becomes Separated on ${d}.`,
  next: () => ["System access is withdrawn at the end of the last working day.", "Farmers move to the successor DA on the effective date.", "The DA record is kept read-only for audit."],
  approvedNext: (r) => [
    OPEN_SEPARATION_ITEMS ? `Clear the ${OPEN_SEPARATION_ITEMS} open items on the clearance checklist.` : "Clearance is complete.",
    `Status becomes Separated after ${formatDate(r.effective)}.`,
    "System access ends at the end of the last working day.",
  ],
};
