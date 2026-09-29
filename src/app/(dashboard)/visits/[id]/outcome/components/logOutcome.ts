import { EVIDENCE_DOCUMENTS, OUTCOME_DRAFT } from "@/features/visits";
import type { EvidenceBadge, EvidenceDocument } from "@/features/visits";

export const BADGE_STYLES: Record<EvidenceBadge, string> = {
  VERIFIED: "bg-green-100 text-brand-green",
  "AGRILEARN · AUTO": "bg-blue-100 text-blue-600",
  "PENDING VERIFICATION": "bg-amber-100 text-amber-700",
};

export const MAX_BYTES = 5 * 1024 * 1024;
export const ACCEPT = ".pdf,.jpg,.jpeg,.png";

export type OutcomeValues = {
  purpose: string;
  farmerResponse: string;
  observed: string;
  advice: string;
  inputs: string;
  nextAction: string;
};

/** An evidence row; `url` is set for files picked on this device (object URL, not saved in drafts). */
export type Evidence = EvidenceDocument & { id: string; url?: string; isImage?: boolean };

export type Notice = { tone: "success" | "info" | "error"; title: string; body?: string };

export const INITIAL_VALUES: OutcomeValues = {
  purpose: OUTCOME_DRAFT.purpose,
  farmerResponse: OUTCOME_DRAFT.farmerResponse,
  observed: OUTCOME_DRAFT.observed,
  advice: OUTCOME_DRAFT.advice,
  inputs: OUTCOME_DRAFT.inputs,
  nextAction: OUTCOME_DRAFT.nextAction,
};

export const INITIAL_EVIDENCE: Evidence[] = EVIDENCE_DOCUMENTS.map((doc, i) => ({ ...doc, id: `doc-${i}` }));

// Draft kept for this browser session only (see lib/drafts).
export const draftKey = (visitId: string) => `visit-outcome:${visitId}`;
export const timeNow = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const fileLabel = (file: File) => `${(file.name.split(".").pop() ?? "file").toUpperCase()} · ${formatSize(file.size)}`;

/** Evidence row for a file picked on this device; `base` keeps the id and title of the row it replaces. */
export const toEvidence = (file: File, base?: Evidence): Evidence => ({
  id: base?.id ?? `upload-${Date.now()}`,
  title: base?.title ?? file.name.replace(/\.[^.]+$/, ""),
  badge: "PENDING VERIFICATION",
  meta: `${file.name} · uploaded ${timeNow()} · geo-tag from this device`,
  file: fileLabel(file),
  url: URL.createObjectURL(file),
  isImage: file.type.startsWith("image/"),
});
