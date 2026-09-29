import type { ApprovalRequest, ApprovalRequestStatus } from "@/features/agents";

export type Decision = "approve" | "changes" | "reject";

export type Outcome = { tone: "success" | "warning" | "info"; text: string };

/** Minimum reviewer note length for Reject / Request changes. */
export const MIN_NOTE = 5;

export const NEXT_STATUS: Record<Decision, ApprovalRequestStatus> = {
  approve: "Approved",
  changes: "Changes requested",
  reject: "Rejected",
};

/** Only requests still awaiting verification can be selected or decided. */
export const isOpen = (r: ApprovalRequest) => r.status === "Awaiting verification";

/** Returns the request with its new status and the decision appended to the audit trail. */
export function applyDecision(r: ApprovalRequest, decision: Decision, note: string): ApprovalRequest {
  const status = NEXT_STATUS[decision];
  const step =
    decision === "approve"
      ? { label: "Approved & published", detail: "Published to the master DA Registry (MoA)", at: "Just now", current: true }
      : { label: status, detail: note, at: "Just now", current: true };
  return { ...r, status, trail: [...r.trail.map((s) => ({ ...s, current: false })), step] };
}

/** Banner shown after a request-changes / reject decision. */
export function outcomeFor(decision: "changes" | "reject", ids: string[]): Outcome {
  const count = ids.length === 1 ? "1 request" : `${ids.length} requests`;
  return decision === "changes"
    ? { tone: "warning", text: `Changes requested — ${count} sent back to the agent with your note.` }
    : { tone: "info", text: `${count} rejected. The record and its audit trail are retained.` };
}
