"use client";

import { useState, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { downloadTemplate } from "@/lib/download";
import { formatSize, TEMPLATE_EXAMPLE, TEMPLATE_HEADERS, type Notice } from "./kpiEntry";
import { KpiSection } from "./KpiSection";

interface BulkImportStepsProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  file: File | null;
  fileError: string | null;
  onPick: (file: File | undefined) => void;
  onRemove: () => void;
  onNotice: (notice: Notice) => void;
}

export function BulkImportSteps({ fileInputRef, file, fileError, onPick, onRemove, onNotice }: BulkImportStepsProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <KpiSection title="Step 1: Download template">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[14px] text-slate-700">Download the Excel template with required fields and data validation rules.</p>
            <p className="mt-1 text-[12.5px] text-ink-soft">Columns match the manual form; one example row included. Open in Excel and save as .xlsx or .csv.</p>
          </div>
          <Button
            type="button"
            variant="brand"
            className="shrink-0 gap-2"
            onClick={() => {
              downloadTemplate("kpi-import-template.csv", TEMPLATE_HEADERS, TEMPLATE_EXAMPLE);
              onNotice({ tone: "success", text: "kpi-import-template.csv downloaded — fill one row per agent and period, then upload it in Step 2." });
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
            </svg>
            Download template
          </Button>
        </div>
      </KpiSection>

      <KpiSection title="Step 2: Upload File">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            onPick(e.dataTransfer.files[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
            isDragging ? "border-brand-green bg-brand-wash" : "border-slate-300 hover:border-brand-green",
          )}
        >
          <input ref={fileInputRef} type="file" accept=".xlsx,.csv" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
          <svg className="h-4 w-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
          <span className="text-[13px] font-semibold text-ink">Drag and drop your file here or click to browse</span>
          <span className="text-[12.5px] text-ink-soft">Accepted formats: .xlsx, .csv (Max size: 5MB)</span>
          <span className="mt-1.5 rounded-md border border-brand-green px-3 py-1.5 text-[13px] font-semibold text-brand-green">Browse file</span>
        </label>
        {fileError && <p className="mt-2 text-[12.5px] text-danger">{fileError}</p>}

        {file && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-green bg-brand-mint px-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-brand-green">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">{file.name}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-soft">{formatSize(file.size)} · selected from this computer</p>
            </div>
            <button type="button" onClick={onRemove} className="text-[12.5px] font-semibold text-orange-700 hover:underline">
              Remove
            </button>
          </div>
        )}
      </KpiSection>
    </>
  );
}
