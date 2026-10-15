import { describe, expect, it } from "vitest";
import { rangeFor, timeAgo, todayIso } from "./agentSummary";

const today = new Date(2026, 9, 15); // 15 Oct 2026

describe("rangeFor", () => {
  it("ends today and counts today in the window", () => {
    expect(rangeFor("Last 7 days", today)).toEqual({ from: "2026-10-09", to: "2026-10-15" });
    expect(rangeFor("Last 30 days", today)).toEqual({ from: "2026-09-16", to: "2026-10-15" });
    expect(rangeFor("Last 90 days", today)).toEqual({ from: "2026-07-18", to: "2026-10-15" });
  });

  it("starts quarter and year ranges on their first day", () => {
    expect(rangeFor("This quarter", today)).toEqual({ from: "2026-10-01", to: "2026-10-15" });
    expect(rangeFor("This year", today)).toEqual({ from: "2026-01-01", to: "2026-10-15" });
  });

  it("has no dates for a custom range", () => {
    expect(rangeFor("Custom range", today)).toBeNull();
  });
});

describe("timeAgo", () => {
  const now = Date.parse("2026-10-15T10:00:00Z");
  it("reads a timestamp relative to now", () => {
    expect(timeAgo(null, now)).toBeNull();
    expect(timeAgo("2026-10-15T09:59:40Z", now)).toBe("just now");
    expect(timeAgo("2026-10-15T09:55:00Z", now)).toBe("5 min ago");
    expect(timeAgo("2026-10-15T07:00:00Z", now)).toBe("3 h ago");
    expect(timeAgo("2026-10-14T10:00:00Z", now)).toBe("1 day ago");
  });
});

describe("todayIso", () => {
  it("formats the local date", () => {
    expect(todayIso(new Date(2026, 9, 5))).toBe("2026-10-05");
  });
});
