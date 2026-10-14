import type { PillTone } from "@/components/ui/Pill";

// FR-09d Farmer Satisfaction Surveys — DA-side response collection; Supervisors publish templates (see templates.ts). Analysis is Part 2.

export type ResponseType = "consent" | "auto" | "lookup" | "rating" | "single" | "multi" | "text";

export interface Parameter {
  id: string;
  order: number;
  prompt: string;
  type: ResponseType;
  required: boolean;
  options?: string[];
  helper?: string;
  prefill?: string;
  /** Only shown when the referenced parameter has this value (skip logic). */
  condition?: { parameterId: string; equals: string };
}

export type ResponseStatus = "Draft" | "Queued" | "Synced" | "Rejected" | "Conflict";

export interface SurveyTask {
  id: string;
  name: string;
  templateVersion: string;
  type: "Satisfaction" | "Service quality" | "Needs assessment";
  window: { open: string; close: string };
  languages: string[];
  targetFarmers: number;
  collected: number;
  queued: number;
  status: "Open" | "Closing soon" | "Closed";
  estMinutes: number;
  parameters: Parameter[];
  /** Farmer IDs already answered (one-response-per-farmer duplicate guard). */
  answered: string[];
}

export const RESPONSE_TONE: Record<ResponseStatus, PillTone> = { Draft: "slate", Queued: "amber", Synced: "green", Rejected: "red", Conflict: "purple" };

const SATISFACTION_PARAMS: Parameter[] = [
  { id: "p1", order: 1, prompt: "The farmer consents to take part in this survey and understands responses are used to improve extension services.", type: "consent", required: true, helper: "A declined consent ends the response." },
  { id: "p2", order: 2, prompt: "Farmer ID", type: "auto", required: true, prefill: "Farmer Registry" },
  { id: "p3", order: 3, prompt: "Kebele", type: "auto", required: true, prefill: "DA assignment" },
  { id: "p4", order: 4, prompt: "Which service is this feedback about?", type: "lookup", required: true, options: ["Crop advisory visit", "Livestock advisory visit", "Input distribution", "Credit facilitation", "Training / demonstration"] },
  { id: "p5", order: 5, prompt: "How satisfied are you with the timeliness of your DA's visits?", type: "rating", required: true, helper: "1 = very dissatisfied · 5 = very satisfied" },
  { id: "p6", order: 6, prompt: "How useful was the advice you received this season?", type: "rating", required: true },
  { id: "p7", order: 7, prompt: "Did you apply the advice on your farm?", type: "single", required: true, options: ["Yes, fully", "Partly", "No"] },
  { id: "p8", order: 8, prompt: "What stopped you applying it?", type: "multi", required: false, options: ["No inputs available", "Cost", "Not convinced", "Weather", "Labour"], condition: { parameterId: "p7", equals: "No" } },
  { id: "p9", order: 9, prompt: "Which channels do you use to get farming information?", type: "multi", required: false, options: ["DA visit", "SMS", "Telegram", "Radio", "Cooperative", "Neighbours"] },
  { id: "p10", order: 10, prompt: "Anything else you want the Woreda to know?", type: "text", required: false, helper: "Optional · max 500 characters" },
];

export const SURVEY_TASKS: SurveyTask[] = [
  { id: "srv-2026-09", name: "Meher season farmer satisfaction", templateVersion: "FSS-v3.2", type: "Satisfaction", window: { open: "08 Sep 2026", close: "30 Sep 2026" }, languages: ["English", "Amharic", "Afaan Oromoo"], targetFarmers: 40, collected: 23, queued: 3, status: "Open", estMinutes: 8, parameters: SATISFACTION_PARAMS, answered: ["lelise-gudeta", "abebe-kebede", "tadesse-alemu"] },
  { id: "srv-2026-08", name: "Input distribution service quality", templateVersion: "SQ-v1.4", type: "Service quality", window: { open: "20 Aug 2026", close: "19 Sep 2026" }, languages: ["English", "Amharic"], targetFarmers: 25, collected: 24, queued: 0, status: "Closing soon", estMinutes: 5, parameters: SATISFACTION_PARAMS.slice(0, 7), answered: [] },
  { id: "srv-2026-06", name: "Belg needs assessment", templateVersion: "NA-v2.0", type: "Needs assessment", window: { open: "01 Jun 2026", close: "30 Jun 2026" }, languages: ["English", "Amharic"], targetFarmers: 30, collected: 30, queued: 0, status: "Closed", estMinutes: 12, parameters: SATISFACTION_PARAMS.slice(0, 6), answered: [] },
];

export const getSurveyTask = (id: string) => SURVEY_TASKS.find((s) => s.id === id);
