import { describe, expect, it } from "vitest";
import { AGENTS } from "./data";
import { MY_DA_ID, WOREDA_SUPERVISORS, getTeam } from "./team";

describe("getTeam", () => {
  const me = AGENTS.find((a) => a.daId === MY_DA_ID)!;
  const team = getTeam(MY_DA_ID);

  it("lists the signed-in DA first", () => {
    expect(team[0].daId).toBe(MY_DA_ID);
  });

  it("only includes agents from the same Woreda who have not separated", () => {
    expect(team.length).toBeGreaterThan(1);
    for (const a of team) {
      expect(a.woreda).toBe(me.woreda);
      expect(a.activeStatus).not.toBe("Separated");
    }
  });

  it("includes every current colleague in the Woreda", () => {
    const expected = AGENTS.filter((a) => a.woreda === me.woreda && a.activeStatus !== "Separated").length;
    expect(team).toHaveLength(expected);
  });

  it("is empty for an unknown DA", () => {
    expect(getTeam("DA-XX-000000")).toEqual([]);
  });

  it("has a supervisor for the signed-in DA's Woreda", () => {
    expect(WOREDA_SUPERVISORS[me.woreda]).toBeDefined();
  });
});
