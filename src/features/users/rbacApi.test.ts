import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchRbacAssignment, listRbacAssignments, revokeRbacAssignment, toPortalRoleFromBackend, updateRbacAssignment } from "./api";

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

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const fetchMock = vi.fn<typeof fetch>();
const sentBody = (call: number) => JSON.parse(fetchMock.mock.calls[call][1]!.body as string);

beforeEach(() => {
  globalThis.sessionStorage = new MemoryStorage();
  globalThis.localStorage = new MemoryStorage();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  useAuthStore.getState().signIn({ id: "Administrator", name: "Administrator", email: "Administrator" }, "Admin", { accessToken: "admin-token", refreshToken: "r", expiresAt: Date.now() + 600_000 });
});

describe("listRbacAssignments", () => {
  it("asks for the active rows of a role and reads a bare array", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: [{ name: "DA-RBAC-1" }], meta: { total: 7 } }));

    await expect(listRbacAssignments({ role: "Supervisor", active: true, limit: 50 })).resolves.toEqual({ items: [{ name: "DA-RBAC-1" }], total: 7 });

    const url = new URL(fetchMock.mock.calls[0][0] as string, "http://x");
    expect(url.pathname).toBe("/api/v1/da-services/rbac-assignments");
    expect(Object.fromEntries(url.searchParams)).toEqual({ role: "Supervisor", is_active: "1", limit: "50", start: "0" });
  });

  it("also reads a list wrapped in an object", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { assignments: [{ name: "A" }, { name: "B" }], total: 2 } }));

    await expect(listRbacAssignments()).resolves.toEqual({ items: [{ name: "A" }, { name: "B" }], total: 2 });
  });
});

describe("rbac assignment changes", () => {
  it("fetches one assignment by id", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { name: "DA-RBAC-9" } }));

    await fetchRbacAssignment("DA-RBAC-9");

    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/da-services/rbac-assignments/DA-RBAC-9");
  });

  it("PATCHes only the scope and dates it is given", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { name: "DA-RBAC-9" } }));

    await updateRbacAssignment("DA-RBAC-9", { woreda_scope: "ET04-W02", effective_to: "2027-03-31" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/da-services/rbac-assignments/DA-RBAC-9");
    expect(init!.method).toBe("PATCH");
    expect(sentBody(0)).toEqual({ woreda_scope: "ET04-W02", effective_to: "2027-03-31" });
  });

  it("revokes with an optional reason", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { name: "DA-RBAC-9", active: false } }));
    fetchMock.mockResolvedValueOnce(json(200, { data: { name: "DA-RBAC-9", active: false } }));

    await revokeRbacAssignment("DA-RBAC-9", "Transferred to another Woreda");
    await revokeRbacAssignment("DA-RBAC-9");

    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/da-services/rbac-assignments/DA-RBAC-9/revoke");
    expect(fetchMock.mock.calls[0][1]!.method).toBe("POST");
    expect(sentBody(0)).toEqual({ reason: "Transferred to another Woreda" });
    expect(sentBody(1)).toEqual({});
  });
});

describe("toPortalRoleFromBackend", () => {
  it("maps backend role names to portal roles", () => {
    expect(toPortalRoleFromBackend("Development Agent")).toBe("DA");
    expect(toPortalRoleFromBackend("Communications Officer")).toBe("CommsOfficer");
    expect(toPortalRoleFromBackend("Administrator")).toBe("Admin");
    expect(toPortalRoleFromBackend("Guest")).toBeNull();
  });
});
