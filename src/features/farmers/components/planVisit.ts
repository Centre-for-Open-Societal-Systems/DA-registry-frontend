import { FARMERS } from "../data";
import type { Farmer } from "../types";

// "Advisory" visits capture the farmer's questions and the advice given (see AdvisoryQaFields).
export const ADVISORY_VISIT = "Advisory";
export const VISIT_TYPES = ["Crop Survey", "Livestock Survey", "Services", "Follow-up", ADVISORY_VISIT];

/** One question raised by the farmer and the advice to give, on an Advisory visit. */
export interface AdvisoryQa {
  id: number;
  question: string;
  answer: string;
}

export const DURATIONS = ["30 min", "45 min", "60 min", "90 min"];
export const PRIORITIES = ["High — overdue by 4 days", "Medium — due this week", "Low — routine"];
export const PRIORITY_BY_LEVEL = { high: PRIORITIES[0], medium: PRIORITIES[1], low: PRIORITIES[2] } as const;

/** Pre-filled reason for a visit, e.g. from a Priority-list flag. */
export interface VisitPreset {
  reason: string;
  visitType: string;
  level: keyof typeof PRIORITY_BY_LEVEL;
}
export const QUICK_FILTERS = ["Registered", "Input voucher redeemed this season"];

/** Outcome shown in place of the form after Plan/Schedule or Save as draft (no visits API yet). */
export type PlanVisitResult = { kind: "planned" | "draft"; farmer?: string; when: string };

export const FORM_ID = "plan-visit-form";

// One entry per distinct farmer (the mock list repeats names to fill a page).
export const FARMER_CHOICES = FARMERS.filter((f, i, all) => all.findIndex((o) => o.name === f.name) === i);

/** Farmers whose name, phone or kebele contains the (lower-cased, trimmed) term; all of them when it is empty. */
export const matchFarmers = (term: string) =>
  term ? FARMER_CHOICES.filter((f) => `${f.name} ${f.phone} ${f.kebele}`.toLowerCase().includes(term)) : FARMER_CHOICES;

// Mock registry id derived from the record (no registry backend yet).
export const registryCode = (farmer: Farmer) => `FR-${(88000 + farmer.name.length * 31 + farmer.kebele.length * 7).toString().slice(0, 5)}`;

/** Human-readable date/time from the (uncontrolled) date and time inputs. */
export const readWhen = () => {
  const date = (document.getElementById("visit-date") as HTMLInputElement | null)?.value;
  const time = (document.getElementById("visit-time") as HTMLInputElement | null)?.value;
  if (!date) return "the chosen date";
  const label = new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return time ? `${label} at ${time}` : label;
};
