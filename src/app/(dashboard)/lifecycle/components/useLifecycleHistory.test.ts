import { beforeEach, describe, expect, it } from "vitest";
import { reviewStage, type LifecycleEvent, type LifecycleRequest } from "./lifecycle";
import { useLifecycleHistory } from "./useLifecycleHistory";

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(k: string) { return this.map.get(k) ?? null; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  removeItem(k: string) { this.map.delete(k); }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
}

const request = (code: string): LifecycleRequest => ({
  id: `LC-2026-${code}`,
  auditId: "AUD-2026-0001",
  code,
  scope: "",
  target: "Gedo kebele, Adama",
  effective: "2026-12-01",
  successor: "",
  reason: "Staffing rebalance",
  role: "",
  assessment: "",
  document: null,
  submittedAt: "2026-10-01T08:00:00.000Z",
  status: "Pending approval",
});

const event = (r: LifecycleRequest): LifecycleEvent => ({
  id: r.id, title: "Transfer", category: "Assignment", change: "", tone: "blue", note: "", effective: "", approver: "", recordedAt: "", status: "Pending approval", requestId: r.id,
});

const store = () => useLifecycleHistory.getState();
const submit = (r: LifecycleRequest) => store().submit(r, event(r));

beforeEach(() => {
  globalThis.localStorage = new MemoryStorage();
  useLifecycleHistory.setState({ requests: {}, seq: 141 });
});

describe("DA → Supervisor → Admin route", () => {
  it("starts with the Supervisor", () => {
    const r = request("TR");
    submit(r);
    expect(reviewStage(store().requests[r.id])).toBe("Awaiting Supervisor");
  });

  it("does not let the Admin approve before the Supervisor has forwarded", () => {
    const r = request("TR");
    submit(r);
    store().approve(r.id, "ok");
    expect(store().requests[r.id].status).toBe("Pending approval");
  });

  it("moves to the Admin once the Supervisor forwards, and the Admin's approval is final", () => {
    const r = request("TR");
    submit(r);
    store().recommend(r.id, "Looks fine");
    expect(reviewStage(store().requests[r.id])).toBe("Awaiting Admin");
    store().approve(r.id, "Approved.");
    expect(store().requests[r.id].status).toBe("Approved");
    expect(store().events.find((e) => e.requestId === r.id)?.status).toBe("Approved");
  });

  it("keeps a separation pending after the Admin's first sign-off", () => {
    const r = request("SP");
    submit(r);
    store().recommend(r.id, "Forward");
    store().approve(r.id, "First");
    expect(store().requests[r.id].status).toBe("Pending approval");
    store().approve(r.id, "Second");
    expect(store().requests[r.id].status).toBe("Approved");
  });

  it("records who rejected and why, at either stage", () => {
    const a = request("TR");
    const b = request("PR");
    submit(a);
    submit(b);
    store().reject(a.id, "Supervisor", "Handover missing");
    store().recommend(b.id, "Forward");
    store().reject(b.id, "Admin", "Not eligible");
    expect(store().requests[a.id]).toMatchObject({ status: "Rejected", rejectedBy: "Supervisor", comment: "Handover missing" });
    expect(store().requests[b.id]).toMatchObject({ status: "Rejected", rejectedBy: "Admin", comment: "Not eligible" });
    expect(store().events.find((e) => e.requestId === a.id)?.status).toBe("Rejected");
  });

  it("ignores decisions on a request that is already closed", () => {
    const r = request("TR");
    submit(r);
    store().reject(r.id, "Supervisor", "No");
    store().recommend(r.id, "late");
    store().approve(r.id, "late");
    expect(store().requests[r.id].status).toBe("Rejected");
    expect(store().requests[r.id].supervisorDecision).toBeUndefined();
  });
});
