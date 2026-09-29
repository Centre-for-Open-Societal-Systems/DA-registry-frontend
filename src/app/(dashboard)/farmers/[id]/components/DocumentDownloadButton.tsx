"use client";

import type { FarmerDocument } from "@/features/farmers";
import { RowAction } from "@/components/ui/RowAction";
import { downloadBlob } from "@/lib/download";

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

export function DocumentDownloadButton({ doc }: { doc: FarmerDocument }) {
  return (
    <RowAction tone="brand" className="shrink-0" onClick={() => download(doc)} title={`Download ${doc.name}`}>
      Download
    </RowAction>
  );
}
