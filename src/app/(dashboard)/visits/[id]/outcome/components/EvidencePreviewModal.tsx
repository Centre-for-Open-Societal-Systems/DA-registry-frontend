"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { BADGE_STYLES, type Evidence } from "./logOutcome";

export function EvidencePreviewModal({ preview, onClose }: { preview: Evidence | undefined; onClose: () => void }) {
  return (
    <Modal
      isOpen={!!preview}
      onClose={onClose}
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
              className="inline-flex shrink-0 whitespace-nowrap h-10 items-center rounded-md border border-brand-green bg-white px-4 text-sm font-semibold text-brand-green hover:bg-brand-wash"
            >
              Open file
            </a>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      {preview && (
        <div className="flex flex-col gap-4">
          {preview.url && preview.isImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
            <img src={preview.url} alt={preview.title} className="max-h-[420px] w-full rounded-lg border border-line object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-surface px-4 py-10 text-center">
              <svg className="h-8 w-8 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" />
              </svg>
              <p className="text-[14px] font-semibold text-ink">{preview.file ?? "Linked record — no file attached"}</p>
              <p className="max-w-sm text-[13px] text-muted">
                {preview.url ? "Use Open file to view this document in a new tab." : "Preview is available once the document is synced from the registry."}
              </p>
            </div>
          )}
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
            <dt className="text-muted">Status</dt>
            <dd>
              <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide", BADGE_STYLES[preview.badge])}>{preview.badge}</span>
            </dd>
            <dt className="text-muted">File</dt>
            <dd className="text-ink">{preview.file ?? "—"}</dd>
            <dt className="text-muted">Details</dt>
            <dd className="text-ink">{preview.meta}</dd>
          </dl>
        </div>
      )}
    </Modal>
  );
}
