import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/useAuthStore";
import { caseFromApi, fetchGrievance, fetchGrievanceOptions, fetchGrievanceTimeline, listGrievances, submitGrievance, toGrievance, type ApiGrievance, type ApiGrievanceDetail } from "./api";

// Minimal in-memory Storage so the persisted auth store runs under Node.
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(k: string) { return this.map.get(k) ?? null; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  removeItem(k: string) { this.map.delete(k); }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const fetchMock = vi.fn<typeof fetch>();

const row: ApiGrievance = {
  ticket_id: "GRV-000001",
  subject: "Fertilizer delivery delayed",
  status: "Open",
  priority: "High",
  category: "Supply Chain",
  complainant_name: "Abebe Kebede",
  created_at: "2026-09-20T10:00:00Z",
  updated_at: "2026-09-20T10:00:00Z",
};

const detail: ApiGrievanceDetail = {
  ...row,
  description: "Expected delivery on 2026-09-15 has not arrived.",
  subcategory: "Input Delivery",
  complainant_id: "DA-000001",
  complainant_role: "Development Agent",
  region: "ET04",
  woreda: "ET04-W01",
  assigned_to: null,
  resolution: null,
  resolved_at: null,
};

beforeEach(() => {
  globalThis.sessionStorage = new MemoryStorage();
  globalThis.localStorage = new MemoryStorage();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  useAuthStore.getState().signIn({ id: "u", name: "u", email: "u" }, "DA", { accessToken: "t", refreshToken: "r", expiresAt: Date.now() + 600_000 });
});

describe("grievances api", () => {
  it("reads options, a page of tickets, one ticket and its timeline", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: { categories: [], priorities: ["Low"], statuses: [] } }))
      .mockResolvedValueOnce(json({ data: [row], meta: { page: 1, page_size: 100, total: 3 } }))
      .mockResolvedValueOnce(json({ data: detail }))
      .mockResolvedValueOnce(json({ data: [] }));

    await expect(fetchGrievanceOptions()).resolves.toMatchObject({ priorities: ["Low"] });
    await expect(listGrievances({ pageSize: 100, status: "Open" })).resolves.toEqual({ items: [row], total: 3 });
    await expect(fetchGrievance("GRV-000001")).resolves.toMatchObject({ subcategory: "Input Delivery" });
    await expect(fetchGrievanceTimeline("GRV-000001")).resolves.toEqual([]);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/v1/da-services/grievances/options",
      "/api/v1/da-services/grievances?page=1&page_size=100&status=Open",
      "/api/v1/da-services/grievances/GRV-000001",
      "/api/v1/da-services/grievances/GRV-000001/timeline",
    ]);
  });

  it("submits a grievance raised for a farmer", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { ticket_id: null, sync_state: "pending", queue_ref: "EVT-1", message: "queued" } }, 201));
    const body = { subject: "Voucher not redeemed", description: "Rejected twice at dealer", category: "Supply Chain", priority: "Medium", raised_for: "Farmer" as const, farmer_id: "FR-88341", client_op_id: "op-1" };

    await expect(submitGrievance(body)).resolves.toMatchObject({ ticket_id: null, sync_state: "pending" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/da-services/grievances");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init!.body as string)).toEqual(body);
  });
});

describe("mapping", () => {
  it("maps a ticket onto a table row", () => {
    expect(toGrievance(row)).toMatchObject({ ticketId: "GRV-000001", title: "Fertilizer delivery delayed", category: "Supply Chain", status: "Submitted", priority: "High", raisedBy: "DA", fromApi: true });
    expect(toGrievance({ ...row, status: "Escalated" }).status).toBe("Under Review");
    expect(toGrievance({ ...row, priority: "Urgent" }).priority).toBe("Medium");
  });

  it("builds the case thread from the description and timeline", () => {
    const c = caseFromApi(toGrievance(row), detail, [
      { timestamp: "2026-09-20T10:00:00Z", action: "created", actor: "DA-000001", detail: "Grievance submitted" },
      { timestamp: "2026-09-21T08:00:00Z", action: "assigned", actor: "Woreda office", detail: "To inputs desk" },
    ]);
    expect(c.thread.map((m) => m.kind)).toEqual(["submission", "event"]);
    expect(c.grievance).toMatchObject({ region: "ET04", woreda: "ET04-W01", type: "Input Delivery" });
    expect(c.submitter).toMatchObject({ name: "Abebe Kebede", kind: "Development Agent", faydaId: "DA-000001" });
  });
});
