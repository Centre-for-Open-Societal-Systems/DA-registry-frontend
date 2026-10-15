import { create } from "zustand";
import { LIFECYCLE_HISTORY, transitionFor, type LifecycleEvent, type LifecycleRequest } from "./lifecycle";

// In-memory history and requests shared by the overview, the full-page initiate form and the request pages, so a
// request submitted on /lifecycle/initiate/* shows up in the audit trail and on /lifecycle/requests/<id>.
// Kept for the browser session only until the lifecycle API exists.
interface LifecycleHistoryState {
  events: LifecycleEvent[];
  requests: Record<string, LifecycleRequest>;
  /** Next request sequence number (LC-2026-0141, LC-2026-0142 …). */
  seq: number;
  add: (event: LifecycleEvent) => void;
  submit: (request: LifecycleRequest, event: LifecycleEvent) => void;
  approve: (id: string, comment: string) => void;
  withdraw: (id: string) => void;
}

const setEventStatus = (events: LifecycleEvent[], id: string, status: LifecycleEvent["status"]) => events.map((e) => (e.requestId === id ? { ...e, status } : e));

export const useLifecycleHistory = create<LifecycleHistoryState>()((set) => ({
  events: LIFECYCLE_HISTORY,
  requests: {},
  seq: 141,
  add: (event) => set((s) => ({ events: [event, ...s.events] })),
  submit: (request, event) => set((s) => ({ requests: { ...s.requests, [request.id]: request }, events: [event, ...s.events], seq: s.seq + 1 })),
  approve: (id, comment) =>
    set((s) => {
      const request = s.requests[id];
      // A two-step transition records the first sign-off and waits for the second approver.
      if (transitionFor(request.code)?.secondApprover && !request.firstDecision)
        return { requests: { ...s.requests, [id]: { ...request, firstDecision: { at: new Date().toISOString(), comment } } } };
      return {
        requests: { ...s.requests, [id]: { ...request, status: "Approved", decidedAt: new Date().toISOString(), comment } },
        events: setEventStatus(s.events, id, "Approved"),
      };
    }),
  withdraw: (id) =>
    set((s) => ({
      requests: { ...s.requests, [id]: { ...s.requests[id], status: "Withdrawn", decidedAt: new Date().toISOString() } },
      events: setEventStatus(s.events, id, "Withdrawn"),
    })),
}));

/** "LC-2026-0141" (or "LV-2026-0141" for leave) / "AUD-2026-0912" for the given sequence number. */
export const requestIds = (seq: number, prefix = "LC") => {
  const year = new Date().getFullYear();
  return { id: `${prefix}-${year}-${String(seq).padStart(4, "0")}`, auditId: `AUD-${year}-${String(seq + 771).padStart(4, "0")}` };
};
