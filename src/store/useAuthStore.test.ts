import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "./useAuthStore";

// Minimal in-memory Storage so the persisted store and logout's draft cleanup run under Node.
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(k: string) { return this.map.get(k) ?? null; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  removeItem(k: string) { this.map.delete(k); }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  globalThis.sessionStorage = new MemoryStorage();
  globalThis.localStorage = new MemoryStorage();
  fetchMock.mockReset().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", fetchMock);
  useAuthStore.getState().signIn({ id: "u", name: "u", email: "u" }, "Admin");
});

describe("logout", () => {
  it("makes no backend call for a demo sign-in", () => {
    useAuthStore.getState().logout();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("revokes the refresh token when the session has one", () => {
    useAuthStore.setState({ tokens: { accessToken: "access-1", refreshToken: "refresh-1", expiresAt: 0 } });

    useAuthStore.getState().logout();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/auth/logout");
    expect(JSON.parse(init!.body as string)).toEqual({ refresh_token: "refresh-1" });
    expect(useAuthStore.getState().tokens).toBeNull();
  });

  it("still signs out when the backend is unreachable", () => {
    fetchMock.mockRejectedValue(new TypeError("offline"));
    useAuthStore.setState({ tokens: { accessToken: "access-1", refreshToken: "refresh-1", expiresAt: 0 } });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
