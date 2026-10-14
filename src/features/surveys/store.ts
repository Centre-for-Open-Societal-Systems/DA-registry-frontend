import { create } from "zustand";
import type { SurveyTask } from "./data";

interface SurveyTemplatesState {
  /** Surveys published from templates a Supervisor created in this session, newest first. */
  created: SurveyTask[];
  add: (task: SurveyTask) => void;
}

// Shared between the Supervisor's Create template form and the DA's Assigned surveys list.
// In memory only: created templates reset on reload until the survey API lands.
export const useSurveyTemplatesStore = create<SurveyTemplatesState>()((set) => ({
  created: [],
  add: (task) => set((s) => ({ created: [task, ...s.created] })),
}));
