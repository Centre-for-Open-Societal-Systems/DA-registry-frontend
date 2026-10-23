import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SAMPLE_EVENTS, SAMPLE_REQUESTS } from "./sampleRequests";
import { LIFECYCLE_HISTORY, transitionFor, type LifecycleEvent, type LifecycleRequest } from "./lifecycle";

// History and requests shared by the overview, the full-page initiate form and the request pages, so a
// request submitted on /lifecycle/initiate/* shows up in the audit trail and on /lifecycle/requests/<id>.
// Kept in this browser (localStorage) until the lifecycle API exists, so a request a DA raised is still there when the
// Supervisor and then the Admin sign in on the same browser.
interface LifecycleHistoryState {
  events: LifecycleEvent[];
  requests: Record<string, LifecycleRequest>;
  /** Next request sequence number (LC-2026-0141, LC-2026-0142 …). */
  seq: number;
  add: (event: LifecycleEvent) => void;
  submit: (request: LifecycleRequest, event: LifecycleEvent) => void;
  /** Supervisor's review: forwards a pending request to the Admin. */
  recommend: (id: string, comment: string) => void;
  /** Admin's approval; only counts once the Supervisor has forwarded the request. */
  approve: (id: string, comment: string) => void;
  /** Supervisor or Admin turns a pending request down; the comment is the reason. */
  reject: (id: string, by: "Supervisor" | "Admin", comment: string) => void;
  withdraw: (id: string) => void;
}

const setEventStatus = (events: LifecycleEvent[], id: string, status: LifecycleEvent["status"]) => events.map((e) => (e.requestId === id ? { ...e, status } : e));

export const useLifecycleHistory = create<LifecycleHistoryState>()(
  persist(
    (set) => ({
      events: [...SAMPLE_EVENTS, ...LIFECYCLE_HISTORY],
      requests: Object.fromEntries(SAMPLE_REQUESTS.map((r) => [r.id, r])),
      seq: 141,
      add: (event) => set((s) => ({ events: [event, ...s.events] })),
      submit: (request, event) => set((s) => ({ requests: { ...s.requests, [request.id]: request }, events: [event, ...s.events], seq: s.seq + 1 })),
      recommend: (id, comment) =>
        set((s) => {
          const request = s.requests[id];
          if (!request || request.status !== "Pending approval" || request.supervisorDecision) return s;
          return { requests: { ...s.requests, [id]: { ...request, supervisorDecision: { at: new Date().toISOString(), comment } } } };
        }),
      approve: (id, comment) =>
        set((s) => {
          const request = s.requests[id];
          if (!request || request.status !== "Pending approval" || !request.supervisorDecision) return s;
          // A two-step transition records the first sign-off and waits for the second approver.
          if (transitionFor(request.code)?.secondApprover && !request.firstDecision)
            return { requests: { ...s.requests, [id]: { ...request, firstDecision: { at: new Date().toISOString(), comment } } } };
          return {
            requests: { ...s.requests, [id]: { ...request, status: "Approved", decidedAt: new Date().toISOString(), comment } },
            events: setEventStatus(s.events, id, "Approved"),
          };
        }),
      reject: (id, by, comment) =>
        set((s) => {
          const request = s.requests[id];
          if (!request || request.status !== "Pending approval") return s;
          return {
            requests: { ...s.requests, [id]: { ...request, status: "Rejected", rejectedBy: by, decidedAt: new Date().toISOString(), comment } },
            events: setEventStatus(s.events, id, "Rejected"),
          };
        }),
      withdraw: (id) =>
        set((s) => ({
          requests: { ...s.requests, [id]: { ...s.requests[id], status: "Withdrawn", decidedAt: new Date().toISOString() } },
          events: setEventStatus(s.events, id, "Withdrawn"),
        })),
    }),
    // Rehydrated after mount (see LifecycleHydration) so the first client render matches the server HTML.
    // Bump the version when the sample requests change: a different stored version is dropped and the samples load fresh.
    { name: "lifecycle-requests", version: 2, skipHydration: true, partialize: (s) => ({ events: s.events, requests: s.requests, seq: s.seq }) }
  )
);

/** "LC-2026-0141" (or "LV-2026-0141" for leave) / "AUD-2026-0912" for the given sequence number. */
export const requestIds = (seq: number, prefix = "LC") => {
  const year = new Date().getFullYear();
  return { id: `${prefix}-${year}-${String(seq).padStart(4, "0")}`, auditId: `AUD-${year}-${String(seq + 771).padStart(4, "0")}` };
};
