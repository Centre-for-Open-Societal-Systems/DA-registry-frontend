"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ACCEPT, BADGE_STYLES, type Evidence } from "./logOutcome";

interface EvidenceListProps {
  evidence: Evidence[];
  onUpload: (file: File | undefined) => void;
  onReplace: (id: string | null, file: File | undefined) => void;
  onView: (id: string) => void;
}

// Upload area plus the attached evidence rows; one hidden input serves every row's Replace.
export function EvidenceList({ evidence, onUpload, onReplace, onView }: EvidenceListProps) {
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] font-medium text-ink">Photos / evidence (geo-tagged)</p>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-surface px-4 py-3.5 text-[13px] text-slate-600 transition-colors hover:border-brand-green">
        <svg className="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
        </svg>
        <span>
          Drag a file here or <span className="font-semibold text-brand-green">browse your computer</span> · PDF, JPG or PNG · max 5 MB
        </span>
        <input
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            onUpload(file);
          }}
        />
      </label>
      <input
        ref={replaceInput}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          onReplace(replaceTarget.current, file);
        }}
        aria-hidden="true"
        tabIndex={-1}
      />

      <ul className="mt-1 overflow-hidden rounded-lg border border-line">
        {evidence.map((doc) => (
          <li key={doc.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3 last:border-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-brand-green">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="text-[14px] font-semibold text-ink">{doc.title}</p>
                <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide", BADGE_STYLES[doc.badge])}>
                  {doc.badge}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-muted">{doc.meta}</p>
            </div>
            <div className="flex w-full items-center justify-between gap-3 pl-14 text-[13px] sm:w-auto sm:shrink-0 sm:flex-col sm:items-end sm:pl-0 sm:text-right">
              <p className="text-muted">{doc.file ?? "—"}</p>
              <p className="flex gap-3 font-semibold text-brand-green sm:mt-0.5 sm:justify-end">
                <button type="button" onClick={() => onView(doc.id)} className="hover:underline">View</button>
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
  );
}
