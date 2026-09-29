"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OUTCOME_DRAFT } from "@/features/visits";
import { EvidenceList } from "./EvidenceList";
import { EvidencePreviewModal } from "./EvidencePreviewModal";
import { OutcomeFields } from "./OutcomeFields";
import { useLogOutcome } from "./useLogOutcome";

export function LogOutcomeForm() {
  const { id: visitId = "draft" } = useParams<{ id: string }>();
  const o = useLogOutcome(visitId);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const preview = o.evidence.find((doc) => doc.id === previewId);

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Log visit outcome</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            Visit · {OUTCOME_DRAFT.farmerName} · {OUTCOME_DRAFT.kebele} · {OUTCOME_DRAFT.dateTime}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-mint px-3 py-1 text-[12.5px] font-medium text-brand-green">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-3.5-3.5 1.4-1.4 2.1 2.1 4.6-4.6 1.4 1.4-6 6z" />
          </svg>
          {o.submitted ? "Submitted" : "Completed"}
        </span>
      </div>

      <form className="flex flex-col gap-5 px-6 py-5" onSubmit={o.submit}>
        <fieldset disabled={o.submitted} className="flex flex-col gap-5 disabled:opacity-80">
          <OutcomeFields values={o.values} set={o.set} />
          <EvidenceList evidence={o.evidence} onUpload={o.addFile} onReplace={o.replaceFile} onView={setPreviewId} />
        </fieldset>

        {o.notice && (
          <Banner tone={o.notice.tone} title={o.notice.title} onDismiss={o.dismissNotice}>
            {o.notice.body}
            {o.notice.title.startsWith("Draft restored") && (
              <button type="button" onClick={o.discardDraft} className="font-semibold underline">
                Discard draft
              </button>
            )}
            {o.submitted && (
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
          <Button type="button" variant="outline" onClick={o.saveDraft} disabled={o.submitted}>
            Save draft
          </Button>
          <Button type="submit" variant="brand" disabled={o.submitted}>
            {o.submitted ? "Report submitted" : "Submit visit report"}
          </Button>
        </div>
      </form>

      <EvidencePreviewModal preview={preview} onClose={() => setPreviewId(null)} />
    </Card>
  );
}
