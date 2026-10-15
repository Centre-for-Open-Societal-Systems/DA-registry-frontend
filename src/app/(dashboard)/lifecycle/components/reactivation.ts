// Sample inactive spell and the Reactivation form copy, until the lifecycle API is wired.
import { formatDate, type RequestFields, type TransitionCopy } from "./lifecycle";

export const INACTIVE_SINCE = "03 Aug 2026";
export const INACTIVE_REASON = "document renewal";
export const PREVIOUS_ASSIGNMENT = "Bako Tibe kebele, Adama";
export const KEEP_PREVIOUS = "Keep previous assignment";
export const RETURN_OPTIONS = [KEEP_PREVIOUS, "Gedo kebele, Adama", "Lume kebele, Adama", "Kebele 05, Adama"];

/** Where the DA works once reactivated. */
export const returnAssignment = (target: string) => (target === KEEP_PREVIOUS || !target ? PREVIOUS_ASSIGNMENT : target);

/** "Keep previous — Bako Tibe kebele, Adama" or the new kebele. */
export const assignmentLine = (target: string) => (target === KEEP_PREVIOUS ? `Keep previous — ${PREVIOUS_ASSIGNMENT}` : target);

/**
 * Checks a reactivation needs. The registry ones pass on record; renewed documents need a file, and even then
 * stay pending until the approver has reviewed them.
 */
export function eligibilityChecks(hasDocument: boolean) {
  return [
    { label: "Fayda ID verified", status: "Verified", passed: true },
    { label: "DA-ID valid", status: "Valid", passed: true },
    { label: "No open grievances", status: "0 open", passed: true },
    { label: "Renewed documents on file", status: hasDocument ? "Review pending" : "Upload required", passed: false, alert: !hasDocument },
  ];
}

export const eligibilityLine = (hasDocument: boolean) => {
  const checks = eligibilityChecks(hasDocument);
  return `${checks.filter((c) => c.passed).length} of ${checks.length} checks passed`;
};

const restoredOn = (d: string) => `Access and assignment are restored on ${d}.`;

export const REACTIVATION_FORM: TransitionCopy = {
  slug: "reactivation",
  code: "RA",
  summary: "Restore an inactive DA to service. Eligibility checks must pass before the request goes for approval.",
  previewCurrent: `Inactive · since ${INACTIVE_SINCE}`,
  previewAfter: (f: RequestFields) => `Active · ${returnAssignment(f.target).split(",")[0]}`,
  effectiveNote: restoredOn,
  next: (f) => [
    "System access and mobile sync are restored on the effective date.",
    f.target && f.target !== KEEP_PREVIOUS ? `The DA is assigned to ${f.target.split(",")[0]} and its farmer list.` : "The previous kebele assignment and farmer list are re-attached.",
    "KPI tracking resumes from the effective date.",
  ],
  approvedNext: (r) => ["The renewed-documents check is still under review.", restoredOn(formatDate(r.effective)), "KPI tracking resumes from the effective date."],
};
