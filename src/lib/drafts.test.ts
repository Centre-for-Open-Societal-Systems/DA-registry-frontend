import { beforeEach, describe, expect, it } from "vitest";
import { clearAllDrafts, readDraft, removeDraft, writeDraft } from "./drafts";

// Minimal in-memory Storage so the helpers run under Node.
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(k: string) { return this.map.get(k) ?? null; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  removeItem(k: string) { this.map.delete(k); }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
}

beforeEach(() => {
  globalThis.sessionStorage = new MemoryStorage();
  globalThis.localStorage = new MemoryStorage();
});

describe("drafts", () => {
  it("round-trips a draft through sessionStorage, never localStorage", () => {
    writeDraft("kpi-entry", { form: { agent: "Tadesse" } });
    expect(readDraft("kpi-entry")).toEqual({ form: { agent: "Tadesse" } });
    expect(localStorage.length).toBe(0);
  });

  it("returns null for missing or unreadable drafts", () => {
    expect(readDraft("nope")).toBeNull();
    sessionStorage.setItem("oan:draft:bad", "{not json");
    expect(readDraft("bad")).toBeNull();
  });

  it("removes a single draft", () => {
    writeDraft("a", 1);
    writeDraft("b", 2);
    removeDraft("a");
    expect(readDraft("a")).toBeNull();
    expect(readDraft("b")).toBe(2);
  });

  it("clearAllDrafts wipes drafts and legacy localStorage copies but nothing else", () => {
    writeDraft("farmer-registration", { fields: { name: "Abebe" } });
    sessionStorage.setItem("unrelated", "keep");
    localStorage.setItem("oan:farmer-registration-draft", "{}");
    localStorage.setItem("oan.visit-outcome-draft.v-1001", "{}");
    localStorage.setItem("oan-auth", "session");

    clearAllDrafts();

    expect(readDraft("farmer-registration")).toBeNull();
    expect(sessionStorage.getItem("unrelated")).toBe("keep");
    expect(localStorage.getItem("oan:farmer-registration-draft")).toBeNull();
    expect(localStorage.getItem("oan.visit-outcome-draft.v-1001")).toBeNull();
    expect(localStorage.getItem("oan-auth")).toBe("session");
  });
});
