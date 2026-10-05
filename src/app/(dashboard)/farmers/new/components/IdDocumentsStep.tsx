"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { RowAction } from "@/components/ui/RowAction";
import { cn } from "@/lib/utils";

interface UploadedDocument {
  id: string;
  type: string;
  fileName: string;
  description: string;
  url?: string;
}

const SAMPLE_DOCUMENTS: UploadedDocument[] = [
  { id: "1", type: "ID Proof", fileName: "householdID.png", description: "Household ID added for 2 members" },
  { id: "2", type: "ID Proof", fileName: "householdID.png", description: "Household ID added for 2 members" },
];

export function IdDocumentsStep() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>(SAMPLE_DOCUMENTS);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const added = Array.from(files).map<UploadedDocument>((file) => ({
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
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "mx-auto flex w-full max-w-[790px] flex-col items-center rounded-xl border-2 border-dashed bg-surface-alt px-6 py-7 text-center transition-colors",
            isDragging ? "border-brand-green bg-brand-tint" : "border-gray-300"
          )}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink-soft shadow-sm">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 7a2 2 0 0 1 2-2h4l2 2h10a2 2 0 0 1 2 2v1H2Z" />
              <path d="M2 10h20l-1.5 8.5a2 2 0 0 1-2 1.5H5.5a2 2 0 0 1-2-1.5L2 10Z" />
            </svg>
          </div>

          <p className="mt-5 text-[14px] font-medium text-ink">Drag and drop files here</p>
          <p className="mt-1 text-[14px] text-ink-soft">Or</p>
          <p className="mt-1 text-[14px] font-medium text-ink">Click Browse files to select a file</p>

          <Button type="button" variant="brandOutline" size="md" onClick={() => inputRef.current?.click()} className="mt-4 gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Browse Files
          </Button>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={documents}
        rowKey={(doc) => doc.id}
        minWidth="640px"
        itemLabel="documents"
        emptyTitle="No documents uploaded yet"
        emptyHint="Drop files above or use Browse Files."
      />
    </Card>
  );
}
