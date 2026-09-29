import { AGENTS } from "./data";
import type { Agent } from "./types";

// A DA's team is the Development Agents in the same Woreda, under one Woreda supervisor (FSD §2.2 scopes).
// There is no auth backend yet, so the signed-in DA is the demo account's registry record.

/** Registry record of the signed-in DA (demo account developmentagent@gmail.com). */
export const MY_DA_ID = "DA-OR-000341";

export interface TeamSupervisor {
  name: string;
  title: string;
  woreda: string;
  phone: string;
  email: string;
}

export const WOREDA_SUPERVISORS: Record<string, TeamSupervisor> = {
  "Bako Tibe": { name: "Almaz Tesfaye", title: "Woreda Extension Supervisor", woreda: "Bako Tibe", phone: "+251 91 300 4412", email: "supervisor@gmail.com" },
};

/** Current members of the DA's Woreda team (separated agents are no longer on it), the DA first. */
export function getTeam(daId: string): Agent[] {
  const me = AGENTS.find((a) => a.daId === daId);
  if (!me) return [];
  return AGENTS.filter((a) => a.woreda === me.woreda && a.activeStatus !== "Separated").sort((a, b) => Number(b.daId === daId) - Number(a.daId === daId));
}
