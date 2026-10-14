"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { RowAction } from "@/components/ui/RowAction";
import { cn } from "@/lib/utils";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

interface UploadedDocument {
  id: string;
  type: string;
  fileName: string;
  description: string;
  url?: string;
}

const SAMPLE_DOCUMENTS: UploadedDocument[] = [
  { id: "1", type: "Fayda ID", fileName: "fayda-id-front.jpg", description: "National ID (front) for the household head" },
  { id: "2", type: "Household ID", fileName: "household-id.png", description: "Household ID covering 2 members" },
];

export function IdDocumentsStep() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>(SAMPLE_DOCUMENTS);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const picked = Array.from(files);
    const rejected = picked.filter((file) => !ACCEPTED_TYPES.includes(file.type) || file.size > MAX_SIZE_BYTES);
    setError(rejected.length ? `${rejected.map((file) => file.name).join(", ")} skipped — use PDF, JPG or PNG up to 5 MB.` : null);
    const added = picked
      .filter((file) => !rejected.includes(file))
      .map<UploadedDocument>((file) => ({
        id: `${Date.now()}-${file.name}`,
        type: "ID Proof",
        fileName: file.name,
        description: "Uploaded document",
        url: URL.createObjectURL(file),
      }));
    setDocuments((prev) => [...prev, ...added]);
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

  const removeDocument = (id: string) => {
    setDocuments((prev) => {
      const doc = prev.find((d) => d.id === id);
      if (doc?.url) URL.revokeObjectURL(doc.url);
      return prev.filter((d) => d.id !== id);
    });
  };

  const columns: Column<UploadedDocument>[] = [
    {
      key: "type",
      header: "Type",
      cell: (doc) => (
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-brand-gold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="3" width="14" height="18" rx="2" />
              <path d="M9 8h6M9 12h6M9 16h4" />
            </svg>
          </span>
          <div className="flex flex-col">
            <span className="font-semibold text-ink">{doc.type}</span>
            <span className="text-[12.5px] text-ink-soft">{doc.fileName}</span>
          </div>
        </div>
      ),
    },
    { key: "description", header: "Description", cell: (doc) => doc.description },
    {
      key: "action",
      header: "Action",
      className: "w-[240px]",
      cell: (doc) => (
        <div className="flex items-center gap-2">
          <RowAction
            tone="brand"
            icon="view"
            disabled={!doc.url}
            title={doc.url ? undefined : "Sample document, no file to preview"}
            onClick={() => doc.url && window.open(doc.url, "_blank", "noreferrer")}
          >
            View
          </RowAction>
          <RowAction tone="danger" icon="remove" onClick={() => removeDocument(doc.id)}>
            Remove
          </RowAction>
        </div>
      ),
    },
  ];

  return (
    <Card className="min-h-[480px] overflow-hidden p-0 shadow-card">
      <div className="border-b border-line px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-ink">ID and documents</h2>
      </div>

      <div className="px-5 py-5">
        {/* Drop zone: the whole box opens the file picker */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload ID and documents"
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
            "mx-auto flex w-full max-w-[790px] cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus:outline-none focus-visible:border-brand-green",
            isDragging ? "border-brand-green bg-brand-tint" : "border-line bg-surface-alt hover:border-brand-green/50 hover:bg-brand-wash/40",
          )}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-brand-green">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </span>

          <p className="mt-4 text-[15px] font-semibold text-ink">
            Drag and drop files here, or <span className="text-brand-green underline-offset-2 hover:underline">browse</span>
          </p>
          <p className="mt-1 text-[13px] text-muted">Fayda ID, household ID or land certificate · PDF, JPG or PNG up to 5 MB each</p>

          {isDragging && <p className="mt-3 text-[13px] font-semibold text-brand-green">Drop to upload</p>}

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
        {error && <p className="mx-auto mt-2 max-w-[790px] text-[12.5px] text-danger">{error}</p>}
      </div>

      <DataTable
        columns={columns}
        rows={documents}
        rowKey={(doc) => doc.id}
        minWidth="640px"
        itemLabel="documents"
        emptyTitle="No documents uploaded yet"
        emptyHint="Drop files above or click the box to browse."
      />
    </Card>
  );
}
