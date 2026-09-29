import { DOCUMENTS } from "@/features/farmers";
import { SectionCard } from "./SectionCard";
import { DocumentDownloadButton } from "./DocumentDownloadButton";

export function DocumentsSection({ limit }: { limit?: number }) {
  const documents = limit ? DOCUMENTS.slice(0, limit) : DOCUMENTS;

  return (
    <SectionCard title="Documents" bodyClassName="flex flex-col gap-3 p-4">
      {documents.map((doc) => (
        <div
          key={doc.name}
          className="flex items-center justify-between gap-4 rounded-lg border border-line bg-white px-3 py-2.5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface text-danger">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-ink">{doc.name}</p>
              <p className="mt-0.5 text-[13px] text-muted">
                Uploaded {doc.uploadedAt} · {doc.size}
              </p>
            </div>
          </div>
          <DocumentDownloadButton doc={doc} />
        </div>
      ))}
    </SectionCard>
  );
}
