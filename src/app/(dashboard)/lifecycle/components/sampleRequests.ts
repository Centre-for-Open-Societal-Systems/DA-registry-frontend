// Sample requests at every stage of the DA → Supervisor → Admin route, until the lifecycle API is wired.
// There is no lifecycle endpoint yet, so the review queues open on these instead of empty.
import { LIFECYCLE_DA, formatDate, transitionFor, type LifecycleEvent, type LifecycleRequest } from "./lifecycle";

const base = { successor: "", role: "", assessment: "", document: null } as const;

const SUPERVISOR_FORWARD = (at: string, comment: string) => ({ at, comment });

export const SAMPLE_REQUESTS: LifecycleRequest[] = [
  {
    ...base, id: "LC-2026-0140", auditId: "AUD-2026-0911", code: "TR", scope: "Within woreda (kebele to kebele)", target: "Gedo kebele, Adama", effective: "2026-12-01",
    successor: "Kedir Hussen — Bako Tibe kebele", reason: "Gedo kebele has been without a DA since September; staffing rebalance across Adama woreda.",
    submittedAt: "2026-10-22T08:40:00.000Z", status: "Pending approval",
  },
  {
    ...base, id: "LC-2026-0139", auditId: "AUD-2026-0910", code: "SC", scope: "Specialisation change", target: "Livestock & Animal Health", effective: "2026-11-15",
    assessment: "ALH-2026-0193 · Agrilearn · 92 / 100", reason: "Regional advisory need for livestock health; certification completed in September.",
    submittedAt: "2026-10-20T13:15:00.000Z", status: "Pending approval",
    supervisorDecision: SUPERVISOR_FORWARD("2026-10-21T09:30:00.000Z", "Certification verified. Recommend approval."),
  },
  {
    ...base, id: "LC-2026-0138", auditId: "AUD-2026-0909", code: "PR", scope: "Grade promotion", target: "DA III", effective: "2026-12-01",
    assessment: "ASM-2026-0412 · 86 / 100", reason: "Completed competency assessment with 86/100 and two years at DA II.",
    submittedAt: "2026-10-18T10:05:00.000Z", status: "Pending approval",
    supervisorDecision: SUPERVISOR_FORWARD("2026-10-19T14:10:00.000Z", "Consistently meets KPI targets. Recommended."),
  },
  {
    ...base, id: "LC-2026-0133", auditId: "AUD-2026-0904", code: "TR", scope: "Within woreda (kebele to kebele)", target: "Kebele 05, Adama", effective: "2026-11-20",
    successor: "Meseret Bekele — Kebele 05", reason: "Kebele 05 needs an experienced DA ahead of the planting season.",
    submittedAt: "2026-10-17T11:20:00.000Z", status: "Pending approval",
    supervisorDecision: SUPERVISOR_FORWARD("2026-10-18T09:05:00.000Z", "Handover to the successor is agreed. Forwarding."),
  },
  {
    ...base, id: "LC-2026-0137", auditId: "AUD-2026-0908", code: "SP", scope: "Resignation", target: "", effective: "2026-12-31", notice: "30 days served",
    successor: "Meseret Bekele — Kebele 05", reason: "Resignation accepted to take up a position outside the extension service.",
    submittedAt: "2026-10-15T09:00:00.000Z", status: "Pending approval",
    supervisorDecision: SUPERVISOR_FORWARD("2026-10-16T11:45:00.000Z", "Handover plan agreed with the successor. Forwarding."),
  },
  {
    ...base, id: "LC-2026-0136", auditId: "AUD-2026-0907", code: "TR", scope: "To another woreda", target: "Dendi woreda, West Shewa", effective: "2026-10-10",
    successor: "Tolosa Gemechu — Gedo kebele", reason: "Family relocation to West Shewa.",
    submittedAt: "2026-09-12T08:20:00.000Z", status: "Approved", decidedAt: "2026-09-18T15:00:00.000Z", comment: "Approved. Please finish the handover before the effective date.",
    supervisorDecision: SUPERVISOR_FORWARD("2026-09-14T10:00:00.000Z", "Receiving woreda has confirmed the vacancy."),
  },
  {
    ...base, id: "LC-2026-0135", auditId: "AUD-2026-0906", code: "PR", scope: "Role change", target: "", role: "Woreda Supervisor", effective: "2026-11-01",
    assessment: "ASM-2025-1187 · 78 / 100", reason: "Asking to move into a supervisory role.",
    submittedAt: "2026-09-28T12:30:00.000Z", status: "Rejected", rejectedBy: "Admin", decidedAt: "2026-10-03T09:15:00.000Z",
    comment: "Assessment score is below the 80 needed for a supervisory role. Reapply after the next assessment.",
    supervisorDecision: SUPERVISOR_FORWARD("2026-09-30T08:50:00.000Z", "Willing to support, but the score is borderline."),
  },
  {
    ...base, id: "LC-2026-0134", auditId: "AUD-2026-0905", code: "TR", scope: "Within woreda (kebele to kebele)", target: "Lume kebele, Adama", effective: "2026-10-20",
    successor: "Hirut Abebe — Lume kebele", reason: "Transfer requested without a handover plan.",
    submittedAt: "2026-10-05T07:55:00.000Z", status: "Rejected", rejectedBy: "Supervisor", decidedAt: "2026-10-06T10:20:00.000Z",
    comment: "No handover plan for the 248 farmers. Please resubmit with the successor confirmed.",
  },
];

/** The audit-trail entry each sample request leaves, as a submitted request would. */
export const SAMPLE_EVENTS: LifecycleEvent[] = SAMPLE_REQUESTS.map((r) => {
  const transition = transitionFor(r.code)!;
  const at = new Date(r.submittedAt);
  return {
    id: r.id,
    title: transition.title,
    category: transition.category,
    change: `${transition.from} → ${r.target || r.role || transition.outcome}`,
    tone: transition.tone,
    note: r.reason,
    effective: formatDate(r.effective),
    approver: LIFECYCLE_DA.approverName,
    recordedAt: `${formatDate(r.submittedAt)} · ${at.toTimeString().slice(0, 5)}`,
    status: r.status,
    requestId: r.id,
  };
});
