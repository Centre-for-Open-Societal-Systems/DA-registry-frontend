// Retirement form copy and clearance checklist, until the lifecycle API is wired.
import { LIFECYCLE_DA, formatDate, type TransitionCopy } from "./lifecycle";

export const RETIREMENT_TYPES = ["Voluntary retirement", "Statutory retirement (age)", "Medical retirement"];
/** ISO date the DA joined the service (the snapshot's "Service since"). */
export const SERVICE_SINCE = "2023-01-12";

/** "3 yrs 11 mths" from the service start to the last working day. */
export function lengthOfService(lastDay: string) {
  const [sy, sm, sd] = SERVICE_SINCE.split("-").map(Number);
  const [ey, em, ed] = lastDay.split("-").map(Number);
  const months = (ey - sy) * 12 + (em - sm) - (ed < sd ? 1 : 0);
  return `${Math.floor(months / 12)} yrs ${months % 12} mths`;
}

/** "Voluntary" from "Voluntary retirement", "Statutory" from "Statutory retirement (age)". */
export const retirementKind = (type: string) => type.replace(/ retirement.*$/, "");

/** What must be cleared before the DA leaves; the registry reports two items still open. */
export const CLEARANCE_ITEMS = [
  { label: "Open visits closed or reassigned", status: "0 open", passed: true },
  { label: "Farmer records handed over", status: `${LIFECYCLE_DA.farmers.split(" ")[0]} pending`, passed: false },
  { label: "Devices and ID card returned", status: "Pending", passed: false },
  { label: "Pending KPI submissions closed", status: "Done", passed: true },
];
export const openItems = (items: { passed: boolean }[]) => items.filter((c) => !c.passed).length;
export const OPEN_CLEARANCE = openItems(CLEARANCE_ITEMS);
export const clearanceLine = (items: { passed: boolean }[] = CLEARANCE_ITEMS) => `${items.length - openItems(items)} of ${items.length} items cleared`;

const becomesSeparated = (d: string) => `Status becomes Separated · retired after ${d}.`;

export const RETIREMENT_FORM: TransitionCopy = {
  slug: "retirement",
  code: "RT",
  summary: "End of service by retirement. The DA becomes Separated · retired once handover and clearance are complete.",
  previewCurrent: "Active · Bako Tibe kebele",
  previewAfter: () => "Separated · retired",
  effectiveNote: () => "Status becomes Separated · retired after the last working day.",
  requestNote: becomesSeparated,
  next: () => ["System access is withdrawn at the end of the last working day.", "Farmers move to the successor DA on the effective date.", "The DA record is kept read-only for audit."],
  approvedNext: (r) => [
    OPEN_CLEARANCE ? `Clear the ${OPEN_CLEARANCE} open items on the clearance checklist.` : "Clearance is complete.",
    becomesSeparated(formatDate(r.effective)),
    "System access is withdrawn at the end of the last working day.",
  ],
};
