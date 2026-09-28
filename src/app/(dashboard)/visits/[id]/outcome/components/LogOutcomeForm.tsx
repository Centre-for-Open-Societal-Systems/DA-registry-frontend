"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { EVIDENCE_DOCUMENTS, OUTCOME_DRAFT } from "@/features/visits/data";
import type { EvidenceBadge, EvidenceDocument } from "@/features/visits/types";

const BADGE_STYLES: Record<EvidenceBadge, string> = {
  VERIFIED: "bg-[#DCFCE7] text-brand-green",
  "AGRILEARN · AUTO": "bg-[#E0EFFF] text-[#2563EB]",
  "PENDING VERIFICATION": "bg-[#FDECC8] text-[#B45309]",
};

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.jpg,.jpeg,.png";

type OutcomeValues = {
  purpose: string;
  farmerResponse: string;
  observed: string;
  advice: string;
  inputs: string;
  nextAction: string;
};

/** An evidence row; `url` is set for files picked on this device (object URL, not saved in drafts). */
type Evidence = EvidenceDocument & { id: string; url?: string; isImage?: boolean };

type Notice = { tone: "success" | "info" | "error"; title: string; body?: string };

const INITIAL_VALUES: OutcomeValues = {
  purpose: OUTCOME_DRAFT.purpose,
  farmerResponse: OUTCOME_DRAFT.farmerResponse,
  observed: OUTCOME_DRAFT.observed,
  advice: OUTCOME_DRAFT.advice,
  inputs: OUTCOME_DRAFT.inputs,
  nextAction: OUTCOME_DRAFT.nextAction,
};

const INITIAL_EVIDENCE: Evidence[] = EVIDENCE_DOCUMENTS.map((doc, i) => ({ ...doc, id: `doc-${i}` }));

const draftKey = (visitId: string) => `oan.visit-outcome-draft.${visitId}`;
const timeNow = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const fileLabel = (file: File) => `${(file.name.split(".").pop() ?? "file").toUpperCase()} · ${formatSize(file.size)}`;

export function LogOutcomeForm() {
  const { id: visitId = "draft" } = useParams<{ id: string }>();
  const [values, setValues] = useState<OutcomeValues>(INITIAL_VALUES);
  const [evidence, setEvidence] = useState<Evidence[]>(INITIAL_EVIDENCE);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);

  // Restore a draft saved on this device (after mount, so server and client render the same markup first).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(draftKey(visitId));
        if (!raw) return;
        const draft = JSON.parse(raw) as { values: OutcomeValues; evidence: Evidence[]; savedAt: string };
        setValues({ ...INITIAL_VALUES, ...draft.values });
        if (Array.isArray(draft.evidence)) setEvidence(draft.evidence);
        setNotice({ tone: "info", title: `Draft restored from this device (saved ${draft.savedAt})` });
      } catch {
        // Storage unavailable or draft unreadable — keep the defaults.
      }
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
      window.localStorage.setItem(draftKey(visitId), JSON.stringify({ values, evidence: stored, savedAt }));
      setNotice({ tone: "success", title: "Draft saved on this device", body: `Saved at ${savedAt}. It will be restored when you reopen this visit.` });
    } catch {
      setNotice({ tone: "error", title: "Draft not saved", body: "This browser is blocking local storage. Submit the report or keep this tab open." });
    }
  };

  const discardDraft = () => {
    try {
      window.localStorage.removeItem(draftKey(visitId));
    } catch {
      // Nothing stored.
    }
    setValues(INITIAL_VALUES);
    setEvidence(INITIAL_EVIDENCE);
    setNotice({ tone: "info", title: "Draft discarded" });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    try {
      window.localStorage.removeItem(draftKey(visitId));
    } catch {
      // Nothing stored.
    }
    setSubmitted(true);
    setNotice({
      tone: "success",
      title: `Visit report submitted at ${timeNow()}`,
      body: `Outcome for ${OUTCOME_DRAFT.farmerName} is queued on this device and syncs when a connection is available. It will appear in this week's activity report.`,
    });
  };

  const toEvidence = (file: File, base?: Evidence): Evidence => ({
    id: base?.id ?? `upload-${Date.now()}`,
    title: base?.title ?? file.name.replace(/\.[^.]+$/, ""),
    badge: "PENDING VERIFICATION",
    meta: `${file.name} · uploaded ${timeNow()} · geo-tag from this device`,
    file: fileLabel(file),
    url: URL.createObjectURL(file),
    isImage: file.type.startsWith("image/"),
  });

  const tooBig = (file: File) => {
    if (file.size <= MAX_BYTES) return false;
    setNotice({ tone: "error", title: `${file.name} is too large`, body: `Files must be 5 MB or smaller (this one is ${formatSize(file.size)}).` });
    return true;
  };

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || tooBig(file)) return;
    setEvidence((list) => [...list, toEvidence(file)]);
    setNotice({ tone: "success", title: `${file.name} attached`, body: "It will be uploaded with the visit report." });
  };

  const onReplace = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = replaceTarget.current;
    e.target.value = "";
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

  const preview = evidence.find((doc) => doc.id === previewId);

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
        <div>
          <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Log visit outcome</h2>
          <p className="mt-0.5 text-[13px] text-[#64748b]">
            Visit · {OUTCOME_DRAFT.farmerName} · {OUTCOME_DRAFT.kebele} · {OUTCOME_DRAFT.dateTime}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7E3C7] bg-[#EBFAF2] px-3 py-1 text-[12.5px] font-medium text-brand-green">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-3.5-3.5 1.4-1.4 2.1 2.1 4.6-4.6 1.4 1.4-6 6z" />
          </svg>
          {submitted ? "Submitted" : "Completed"}
        </span>
      </div>

      <form className="flex flex-col gap-5 px-6 py-5" onSubmit={submit}>
        <fieldset disabled={submitted} className="flex flex-col gap-5 disabled:opacity-80">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Visit purpose" htmlFor="outcome-purpose">
              <Input id="outcome-purpose" value={values.purpose} onChange={set("purpose")} className="h-10" />
            </FormField>
            <FormField label="Farmer response" htmlFor="outcome-response">
              <Input id="outcome-response" value={values.farmerResponse} onChange={set("farmerResponse")} className="h-10" />
            </FormField>
          </div>

          <FormField label="What was observed" htmlFor="outcome-observed">
            <Textarea id="outcome-observed" rows={2} value={values.observed} onChange={set("observed")} />
          </FormField>

          <FormField label="Advice given" htmlFor="outcome-advice">
            <Textarea id="outcome-advice" rows={2} value={values.advice} onChange={set("advice")} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Inputs / actions logged" htmlFor="outcome-inputs">
              <Input id="outcome-inputs" value={values.inputs} onChange={set("inputs")} className="h-10" />
            </FormField>
            <FormField label="Next action & date" htmlFor="outcome-next">
              <Input id="outcome-next" value={values.nextAction} onChange={set("nextAction")} className="h-10" />
            </FormField>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium text-[#1a2b3c]">Photos / evidence (geo-tagged)</p>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3.5 text-[13px] text-[#475569] transition-colors hover:border-brand-green">
              <svg className="h-4 w-4 text-[#64748b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
              </svg>
              <span>
                Drag a file here or <span className="font-semibold text-brand-green">browse your computer</span> · PDF, JPG or PNG · max 5 MB
              </span>
              <input type="file" accept={ACCEPT} className="sr-only" onChange={onUpload} />
            </label>
            <input ref={replaceInput} type="file" accept={ACCEPT} className="hidden" onChange={onReplace} aria-hidden="true" tabIndex={-1} />

            <ul className="mt-1 overflow-hidden rounded-lg border border-[#E5E7EB]">
              {evidence.map((doc) => (
                <li key={doc.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#E5E7EB] px-4 py-3 last:border-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-brand-green">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-[14px] font-semibold text-[#1a2b3c]">{doc.title}</p>
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide", BADGE_STYLES[doc.badge])}>
                        {doc.badge}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-[#64748b]">{doc.meta}</p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-3 pl-14 text-[13px] sm:w-auto sm:shrink-0 sm:flex-col sm:items-end sm:pl-0 sm:text-right">
                    <p className="text-[#64748b]">{doc.file ?? "—"}</p>
                    <p className="flex gap-3 font-semibold text-brand-green sm:mt-0.5 sm:justify-end">
                      <button type="button" onClick={() => setPreviewId(doc.id)} className="hover:underline">View</button>
                      <button
                        type="button"
                        onClick={() => {
                          replaceTarget.current = doc.id;
                          replaceInput.current?.click();
                        }}
                        className="hover:underline"
                      >
                        Replace
                      </button>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </fieldset>

        {notice && (
          <Banner tone={notice.tone} title={notice.title} onDismiss={() => setNotice(null)}>
            {notice.body}
            {notice.title.startsWith("Draft restored") && (
              <button type="button" onClick={discardDraft} className="font-semibold underline">
                Discard draft
              </button>
            )}
            {submitted && (
              <>
                {" "}
                <Link href={`/visits/${visitId}`} className="font-semibold underline">
                  Back to today&apos;s visits
                </Link>
              </>
            )}
          </Banner>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={saveDraft} disabled={submitted}>
            Save draft
          </Button>
          <Button type="submit" variant="brand" disabled={submitted}>
            {submitted ? "Report submitted" : "Submit visit report"}
          </Button>
        </div>
      </form>

      <Modal
        isOpen={!!preview}
        onClose={() => setPreviewId(null)}
        title={preview?.title ?? "Attachment"}
        subtitle={preview?.meta}
        size="lg"
        footer={
          <>
            {preview?.url && (
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 whitespace-nowrap h-10 items-center rounded-md border border-brand-green bg-white px-4 text-sm font-semibold text-brand-green hover:bg-[#F0FAF5]"
              >
                Open file
              </a>
            )}
            <Button type="button" variant="outline" onClick={() => setPreviewId(null)}>
              Close
            </Button>
          </>
        }
      >
        {preview && (
          <div className="flex flex-col gap-4">
            {preview.url && preview.isImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
              <img src={preview.url} alt={preview.title} className="max-h-[420px] w-full rounded-lg border border-[#E5E7EB] object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-10 text-center">
                <svg className="h-8 w-8 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" />
                </svg>
                <p className="text-[14px] font-semibold text-[#1a2b3c]">{preview.file ?? "Linked record — no file attached"}</p>
                <p className="max-w-sm text-[13px] text-[#64748b]">
                  {preview.url ? "Use Open file to view this document in a new tab." : "Preview is available once the document is synced from the registry."}
                </p>
              </div>
            )}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
              <dt className="text-[#64748b]">Status</dt>
              <dd>
                <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide", BADGE_STYLES[preview.badge])}>{preview.badge}</span>
              </dd>
              <dt className="text-[#64748b]">File</dt>
              <dd className="text-[#1a2b3c]">{preview.file ?? "—"}</dd>
              <dt className="text-[#64748b]">Details</dt>
              <dd className="text-[#1a2b3c]">{preview.meta}</dd>
            </dl>
          </div>
        )}
      </Modal>
    </Card>
  );
}
