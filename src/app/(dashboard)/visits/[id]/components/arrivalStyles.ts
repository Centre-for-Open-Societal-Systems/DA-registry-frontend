import type { ArrivalState } from "@/features/visits";

// Step-number and note-pill colours for each of today's visits; shared by the list and the locations modal.
export const ARRIVAL_STYLES: Record<ArrivalState, { step: string; pill: string }> = {
  done: { step: "bg-slate-200 text-slate-600", pill: "border-brand-border bg-brand-mint text-brand-green" },
  confirmed: { step: "bg-brand-green text-white", pill: "border-brand-border bg-brand-mint text-brand-green" },
  tentative: { step: "bg-brand-green text-white", pill: "border-warning-border bg-warning-wash text-amber-700" },
};
