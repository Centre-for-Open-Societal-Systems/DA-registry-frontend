"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { cn } from "@/lib/utils";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);

interface FileDropInputProps {
  /** Field label, e.g. "Supporting documents". */
  label: string;
  /** Bold call to action inside the drop bar, e.g. "Add documents". */
  actionLabel: string;
  files: File[];
  onChange: (files: File[]) => void;
  /** Form field name, when a parent form needs to read the files. */
  name?: string;
  /** Second line in the drop bar; defaults to the accepted types and size. */
  hint?: string;
}

// Compact drag-and-drop bar for optional PDF / JPG / PNG attachments (5 MB each), with a removable file list.
export function FileDropInput({ label, actionLabel, files, onChange, name, hint = "PDF, JPG or PNG up to 5 MB each" }: FileDropInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const picked = Array.from(list);
    const rejected = picked.filter((f) => !ACCEPTED_TYPES.includes(f.type) || f.size > MAX_SIZE_BYTES);
    setError(rejected.length ? `${rejected.map((f) => f.name).join(", ")} skipped — use PDF, JPG or PNG up to 5 MB.` : null);
    const accepted = picked.filter((f) => !rejected.includes(f) && !files.some((p) => p.name === f.name && p.size === f.size));
    if (accepted.length) onChange([...files, ...accepted]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] font-medium text-ink">
        {label} <span className="font-normal text-muted">(optional)</span>
      </p>
      <div
        role="button"
        tabIndex={0}
        aria-label={actionLabel}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-3.5 transition-colors focus:outline-none focus-visible:border-brand-green",
          isDragging ? "border-brand-green bg-brand-tint" : "border-line bg-surface-alt hover:border-brand-green/50",
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-green">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-[13.5px] text-ink"><span className="font-semibold text-ink">{actionLabel}</span> or drag and drop</span>
          <span className="block text-[12px] text-muted">{hint}</span>
        </span>
        <input ref={inputRef} type="file" name={name} multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleInputChange} />
      </div>
      {error && <p className="text-[12.5px] text-danger">{error}</p>}
      {files.length > 0 && (
        <ul className="overflow-hidden rounded-lg border border-line">
          {files.map((f) => (
            <li key={`${f.name}-${f.size}`} className="flex items-center gap-3 border-b border-line bg-white px-3 py-2.5 last:border-b-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-tint text-brand-green">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-ink">{f.name}</p>
                <p className="text-[12px] text-muted">{formatSize(f.size)}</p>
              </div>
              <button type="button" onClick={() => onChange(files.filter((p) => p !== f))} className="text-[12.5px] font-medium text-danger hover:underline" aria-label={`Remove ${f.name}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
