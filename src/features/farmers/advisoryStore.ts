import { create } from "zustand";

export interface AdvisoryEntry {
  id: string;
  farmerId: string;
  /** Visit date/time as shown to the user, e.g. "25 Aug 2026 at 09:00". */
  when: string;
  status: "Planned" | "Draft";
  items: { question: string; answer: string }[];
}

interface AdvisoryState {
  entries: AdvisoryEntry[];
  add: (entry: Omit<AdvisoryEntry, "id">) => void;
}

// Q&A captured on Advisory visits, shown on the farmer's Advisory tab.
// In memory only: entries reset on reload until the visits API lands.
export const useAdvisoryStore = create<AdvisoryState>()((set) => ({
  entries: [],
  add: (entry) => set((s) => ({ entries: [{ ...entry, id: `adv-${s.entries.length + 1}` }, ...s.entries] })),
}));
