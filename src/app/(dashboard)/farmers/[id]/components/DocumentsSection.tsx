"use client";

import { DOCUMENTS } from "@/features/farmers/data";
import { RowAction } from "@/components/ui/RowAction";
import { downloadBlob } from "@/lib/download";
import { SectionCard } from "./SectionCard";

// Builds a one-page placeholder PDF (Helvetica, ASCII text) until the document store API exists.
function placeholderPdf(lines: string[]): Blob {
  const esc = (s: string) => s.replace(/[^\x20-\x7E]/g, "-").replace(/[\\()]/g, (m) => `\\${m}`);
  const content = `BT /F1 12 Tf 16 TL 56 790 Td ${lines.map((l) => `(${esc(l)}) '`).join(" ")} ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, i) => {
    const at = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return at;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

type FarmerDocument = (typeof DOCUMENTS)[number];

const download = (doc: FarmerDocument) =>
  downloadBlob(
    placeholderPdf([
      doc.name,
      "",
      `Uploaded: ${doc.uploadedAt}   Original size: ${doc.size}`,
      "",
      "OpenAgriNet - Farmer Registry",
      "Placeholder copy: the original file is served by the document store once connected.",
    ]),
    doc.name,
  );

export function DocumentsSection({ limit }: { limit?: number }) {
  const documents = limit ? DOCUMENTS.slice(0, limit) : DOCUMENTS;

  return (
    <SectionCard title="Documents" bodyClassName="flex flex-col gap-3 p-4">
      {documents.map((doc) => (
        <div
          key={doc.name}
          className="flex items-center justify-between gap-4 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#DC2626]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[#1a2b3c]">{doc.name}</p>
              <p className="mt-0.5 text-[13px] text-[#64748b]">
                Uploaded {doc.uploadedAt} · {doc.size}
              </p>
            </div>
          </div>
          <RowAction tone="brand" className="shrink-0" onClick={() => download(doc)} title={`Download ${doc.name}`}>
            Download
          </RowAction>
        </div>
      ))}
    </SectionCard>
  );
}
