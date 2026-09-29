import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { readDraft, removeDraft, writeDraft } from "@/lib/drafts";
import { OUTCOME_DRAFT } from "@/features/visits";
import {
  draftKey,
  formatSize,
  INITIAL_EVIDENCE,
  INITIAL_VALUES,
  MAX_BYTES,
  timeNow,
  toEvidence,
  type Evidence,
  type Notice,
  type OutcomeValues,
} from "./logOutcome";

// Form values, evidence list, draft and submit state for one visit's outcome report.
export function useLogOutcome(visitId: string) {
  const [values, setValues] = useState<OutcomeValues>(INITIAL_VALUES);
  const [evidence, setEvidence] = useState<Evidence[]>(INITIAL_EVIDENCE);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Restore a draft saved on this device (after mount, so server and client render the same markup first).
  useEffect(() => {
    const t = setTimeout(() => {
      const draft = readDraft<{ values: OutcomeValues; evidence: Evidence[]; savedAt: string }>(draftKey(visitId));
      if (!draft) return;
      setValues({ ...INITIAL_VALUES, ...draft.values });
      if (Array.isArray(draft.evidence)) setEvidence(draft.evidence);
      setNotice({ tone: "info", title: `Draft restored (saved ${draft.savedAt})` });
    }, 0);
    return () => clearTimeout(t);
  }, [visitId]);

  const set = (key: keyof OutcomeValues) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const saveDraft = () => {
    const savedAt = timeNow();
    try {
      // Object URLs only live for this page, so drop them from the stored draft.
      const stored = evidence.map((doc) => ({ ...doc, url: undefined, isImage: undefined }));
      writeDraft(draftKey(visitId), { values, evidence: stored, savedAt });
      setNotice({ tone: "success", title: "Draft saved for this session", body: `Saved at ${savedAt}. It will be restored if you reopen this visit before signing out.` });
    } catch {
      setNotice({ tone: "error", title: "Draft not saved", body: "This browser is blocking session storage. Submit the report or keep this tab open." });
    }
  };

  const discardDraft = () => {
    removeDraft(draftKey(visitId));
    setValues(INITIAL_VALUES);
    setEvidence(INITIAL_EVIDENCE);
    setNotice({ tone: "info", title: "Draft discarded" });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    removeDraft(draftKey(visitId));
    setSubmitted(true);
    setNotice({
      tone: "success",
      title: `Visit report submitted at ${timeNow()}`,
      body: `Outcome for ${OUTCOME_DRAFT.farmerName} is queued on this device and syncs when a connection is available. It will appear in this week's activity report.`,
    });
  };

  const tooBig = (file: File) => {
    if (file.size <= MAX_BYTES) return false;
    setNotice({ tone: "error", title: `${file.name} is too large`, body: `Files must be 5 MB or smaller (this one is ${formatSize(file.size)}).` });
    return true;
  };

  const addFile = (file: File | undefined) => {
    if (!file || tooBig(file)) return;
    setEvidence((list) => [...list, toEvidence(file)]);
    setNotice({ tone: "success", title: `${file.name} attached`, body: "It will be uploaded with the visit report." });
  };

  const replaceFile = (target: string | null, file: File | undefined) => {
    if (!file || !target || tooBig(file)) return;
    setEvidence((list) =>
      list.map((doc) => {
        if (doc.id !== target) return doc;
        if (doc.url) URL.revokeObjectURL(doc.url);
        return toEvidence(file, doc);
      }),
    );
    setNotice({ tone: "success", title: "Attachment replaced", body: `Now using ${file.name} (${formatSize(file.size)}); it needs re-verification.` });
  };

  return { values, set, evidence, addFile, replaceFile, notice, dismissNotice: () => setNotice(null), submitted, saveDraft, discardDraft, submit };
}
