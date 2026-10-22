import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/useAuthStore";
import { login, NO_ASSIGNMENT_MESSAGE } from "./login";
import { refreshProfile, toMeSession, type MeResponse } from "./me";

// Minimal in-memory Storage so the persisted store runs under Node.
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

const loginOk = () => json(200, { data: { access_token: "a1", expires_in: 900, refresh_token: "r1", token_type: "Bearer", roles: ["Development Agent", "Administrator"], user: "Administrator" } });
const me = (over: Partial<MeResponse["data"]> = {}): MeResponse => ({
  data: {
    user: { id: "Administrator", name: "Administrator", email: "Administrator" },
    role: "Admin",
    role_codes: ["Admin"],
    role_label: "OAN / ATI Administrator",
    roles: ["OAN Administrator"],
    scope: { regions: [], woredas: [], zones: [] },
    scope_label: "All regions",
    unrestricted: true,
    menu: ["/dashboard", "/admin/users"],
    da_id: null,
    ...over,
  },
});

beforeEach(() => {
  globalThis.sessionStorage = new MemoryStorage();
  globalThis.localStorage = new MemoryStorage();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  useAuthStore.setState({ user: null, isAuthenticated: false, tokens: null, profile: null });
});

describe("toMeSession", () => {
  it("maps /me to identity, portal role and profile", () => {
    expect(toMeSession(me())).toEqual({
      user: { id: "Administrator", name: "Administrator", email: "Administrator" },
      role: "Admin",
      profile: { roleLabel: "OAN / ATI Administrator", scopeLabel: "All regions", scope: { regions: [], woredas: [], zones: [] }, unrestricted: true, menu: ["/dashboard", "/admin/users"], daId: null, agent: null },
    });
  });

  it("rejects a role the portal does not know", () => {
    expect(toMeSession(me({ role: "Auditor" }))).toBeNull();
  });
});

describe("login", () => {
  it("takes identity and role from /me, called with the new access token", async () => {
    fetchMock.mockResolvedValueOnce(loginOk()).mockResolvedValueOnce(json(200, me({ role: "Supervisor", role_label: "Supervisor (Woreda)" })));

    const result = await login("Administrator", "admin");

    expect(fetchMock.mock.calls[1][0]).toBe("/api/v1/da-services/me");
    expect(new Headers(fetchMock.mock.calls[1][1]!.headers).get("Authorization")).toBe("Bearer a1");
    expect(result.role).toBe("Supervisor");
    expect(result.profile?.roleLabel).toBe("Supervisor (Woreda)");
    expect(result.tokens.refreshToken).toBe("r1");
  });

  it("refuses an account without an active assignment and revokes its refresh token", async () => {
    fetchMock.mockResolvedValueOnce(loginOk()).mockResolvedValueOnce(json(401, { message: "Authentication failed" })).mockResolvedValueOnce(json(200, {}));

    await expect(login("da@moa.gov.et", "pw")).rejects.toMatchObject({ status: 403, message: NO_ASSIGNMENT_MESSAGE });
    expect(fetchMock.mock.calls[2][0]).toBe("/api/v1/auth/logout");
    expect(JSON.parse(fetchMock.mock.calls[2][1]!.body as string)).toEqual({ refresh_token: "r1" });
  });

  it("falls back to the login response when /me cannot be reached", async () => {
    fetchMock.mockResolvedValueOnce(loginOk()).mockRejectedValueOnce(new TypeError("offline"));

    const result = await login("Administrator", "admin");

    expect(result.role).toBe("Admin");
    expect(result.profile).toBeUndefined();
  });
});

describe("refreshProfile", () => {
  it("updates the stored identity and profile", async () => {
    useAuthStore.getState().signIn({ id: "x", name: "x", email: "x" }, "DA", { accessToken: "a", refreshToken: "r", expiresAt: Date.now() + 600_000 });
    fetchMock.mockResolvedValueOnce(json(200, me()));

    await refreshProfile();

    const s = useAuthStore.getState();
    expect(s.role).toBe("Admin");
    expect(s.user?.name).toBe("Administrator");
    expect(s.profile?.scopeLabel).toBe("All regions");
    expect(s.tokens?.accessToken).toBe("a");
  });
});
