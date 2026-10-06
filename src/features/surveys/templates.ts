import type { Parameter, ResponseType, SurveyTask } from "./data";

export const SURVEY_TYPES: SurveyTask["type"][] = ["Satisfaction", "Service quality", "Needs assessment"];
export const SURVEY_LANGUAGES = ["English", "Amharic", "Afaan Oromoo"];

/** Question types a Supervisor can add; consent, Farmer ID and Kebele are added to every template automatically. */
export const QUESTION_TYPES: { value: ResponseType; label: string; hasOptions: boolean }[] = [
  { value: "rating", label: "Rating (1–5)", hasOptions: false },
  { value: "single", label: "Single choice", hasOptions: true },
  { value: "multi", label: "Multiple choice", hasOptions: true },
  { value: "text", label: "Free text", hasOptions: false },
];

export interface TemplateQuestion {
  id: number;
  prompt: string;
  type: ResponseType;
  /** Comma-separated choices for single / multiple choice. */
  options: string;
  required: boolean;
}

export interface TemplateInput {
  name: string;
  type: SurveyTask["type"];
  /** yyyy-mm-dd from the date inputs. */
  open: string;
  close: string;
  languages: string[];
  targetFarmers: number;
  questions: TemplateQuestion[];
}

// Every response starts with consent and the farmer / kebele context, as in the existing templates.
const STANDARD_PARAMS: Parameter[] = [
  { id: "p1", order: 1, prompt: "The farmer consents to take part in this survey and understands responses are used to improve extension services.", type: "consent", required: true, helper: "A declined consent ends the response." },
  { id: "p2", order: 2, prompt: "Farmer ID", type: "auto", required: true, prefill: "Farmer Registry" },
  { id: "p3", order: 3, prompt: "Kebele", type: "auto", required: true, prefill: "DA assignment" },
];

const TYPE_CODES: Record<SurveyTask["type"], string> = { Satisfaction: "FSS", "Service quality": "SQ", "Needs assessment": "NA" };

export const formatSurveyDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const optionsOf = (raw: string) => [...new Set(raw.split(",").map((o) => o.trim()).filter(Boolean))];

/** Problems that block publishing, in form order; empty when the template is ready. */
export function templateErrors(t: TemplateInput): string[] {
  const errors: string[] = [];
  if (t.name.trim().length < 3) errors.push("Give the template a name.");
  if (!t.open || !t.close) errors.push("Set the collection window.");
  else if (t.close < t.open) errors.push("The window must close after it opens.");
  if (t.languages.length === 0) errors.push("Pick at least one language.");
  if (!(t.targetFarmers > 0)) errors.push("Set how many farmers each DA should survey.");
  if (t.questions.length === 0) errors.push("Add at least one question.");
  t.questions.forEach((q, i) => {
    if (!q.prompt.trim()) errors.push(`Question ${i + 1} needs text.`);
    if (QUESTION_TYPES.find((qt) => qt.value === q.type)?.hasOptions && optionsOf(q.options).length < 2) errors.push(`Question ${i + 1} needs at least two choices.`);
  });
  return errors;
}

/** Turns a Supervisor's template into an open survey task for the DAs; `serial` keeps ids unique within the session. */
export function surveyFromTemplate(t: TemplateInput, serial: number): SurveyTask {
  const custom: Parameter[] = t.questions.map((q, i) => ({
    id: `p${STANDARD_PARAMS.length + i + 1}`,
    order: STANDARD_PARAMS.length + i + 1,
    prompt: q.prompt.trim(),
    type: q.type,
    required: q.required,
    ...(QUESTION_TYPES.find((qt) => qt.value === q.type)?.hasOptions ? { options: optionsOf(q.options) } : {}),
    ...(q.type === "rating" ? { helper: "1 = very dissatisfied · 5 = very satisfied" } : {}),
  }));
  return {
    id: `srv-new-${serial}`,
    name: t.name.trim(),
    templateVersion: `${TYPE_CODES[t.type]}-T${serial}-v1.0`,
    type: t.type,
    window: { open: formatSurveyDate(t.open), close: formatSurveyDate(t.close) },
    languages: t.languages,
    targetFarmers: t.targetFarmers,
    collected: 0,
    queued: 0,
    status: "Open",
    // About 40 seconds per question, rounded up to whole minutes.
    estMinutes: Math.max(2, Math.ceil(((STANDARD_PARAMS.length + custom.length) * 40) / 60)),
    parameters: [...STANDARD_PARAMS, ...custom],
    answered: [],
  };
}
