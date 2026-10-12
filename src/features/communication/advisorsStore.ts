import { create } from "zustand";
import { ADVISORS, type Advisor } from "./advisors";

interface AdvisorsState {
  rows: Advisor[];
  /** Adds an Admin-entered advisor at the top of the directory. */
  add: (advisor: Advisor) => void;
}

// Shared by the directory and the advisor page. In memory only: additions reset on reload until the API lands.
export const useAdvisorsStore = create<AdvisorsState>()((set) => ({
  rows: ADVISORS,
  add: (advisor) => set((s) => ({ rows: [advisor, ...s.rows] })),
}));

/** Next free "ADV-0nnn" id after the highest one in the directory. */
export const nextAdvisorId = (rows: Advisor[]) => {
  const max = Math.max(100, ...rows.map((a) => Number(a.id.replace(/\D/g, "")) || 0));
  return `ADV-${String(max + 1).padStart(4, "0")}`;
};
