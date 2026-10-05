// Table exports in the three formats the Export Report menu offers (PDF · Excel · CSV), built client-side with no
// dependencies until the export APIs exist. The writers are deliberately minimal: one sheet, one plain table.
import { downloadBlob, downloadCsv, type CsvColumn } from "./download";

export type ExportFormat = "pdf" | "xlsx" | "csv";

export const EXPORT_FORMATS: { value: ExportFormat; label: string; short: string }[] = [
  { value: "pdf", label: "PDF document", short: "PDF" },
  { value: "xlsx", label: "Excel spreadsheet (.xlsx)", short: "Excel" },
  { value: "csv", label: "CSV file (.csv)", short: "CSV" },
];

export const formatLabel = (f: ExportFormat) => EXPORT_FORMATS.find((o) => o.value === f)?.short ?? f.toUpperCase();

/** Downloads `rows` as `<baseName>.<format>`. `title` heads the PDF page and names the Excel sheet. */
export function downloadTable<T>(format: ExportFormat, baseName: string, rows: T[], columns: CsvColumn<T>[], title = baseName) {
  if (format === "csv") return downloadCsv(`${baseName}.csv`, rows, columns);
  const header = columns.map((c) => c.header);
  const body = rows.map((r) => columns.map((c) => c.value(r)));
  if (format === "xlsx") return downloadBlob(buildXlsx(title, header, body), `${baseName}.xlsx`);
  return downloadBlob(buildPdf(title, header, body), `${baseName}.pdf`);
}

type Cell = string | number | boolean | null | undefined;
const text = (v: Cell) => (v == null ? "" : String(v));

// ---------- XLSX (SpreadsheetML in a stored zip) ----------

const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const colName = (i: number) => {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

function buildXlsx(title: string, header: string[], body: Cell[][]): Blob {
  const cell = (v: Cell, ref: string, style = 0) =>
    typeof v === "number" && Number.isFinite(v)
      ? `<c r="${ref}"${style ? ` s="${style}"` : ""}><v>${v}</v></c>`
      : `<c r="${ref}" t="inlineStr"${style ? ` s="${style}"` : ""}><is><t xml:space="preserve">${xmlEscape(text(v))}</t></is></c>`;
  const row = (cells: Cell[], r: number, style = 0) => `<row r="${r}">${cells.map((v, i) => cell(v, `${colName(i)}${r}`, style)).join("")}</row>`;
  const widths = header.map((h, i) => Math.min(60, Math.max(10, h.length, ...body.map((r) => text(r[i]).length)) + 2));

  const sheet =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>` +
    `<sheetData>${row(header, 1, 1)}${body.map((r, i) => row(r, i + 2)).join("")}</sheetData></worksheet>`;
  // Sheet names: max 31 chars, none of []:*?/\
  const sheetName = xmlEscape(title.replace(/[[\]:*?/\\]/g, " ").slice(0, 31) || "Sheet1");

  return zip([
    ["[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
    ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ["xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${sheetName}" sheetId="1" r:id="rId1"/></sheets></workbook>`],
    ["xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ["xl/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>`],
    ["xl/worksheets/sheet1.xml", sheet],
  ]);
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const crc32 = (data: Uint8Array) => {
  let c = 0xffffffff;
  for (const b of data) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/** Uncompressed (STORE) zip — enough for an .xlsx package. */
function zip(files: [string, string][]): Blob {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const [name, content] of files) {
    const nameBytes = enc.encode(name);
    const data = enc.encode(content);
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(8, 0, true); // store
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    parts.push(new Uint8Array(local.buffer), nameBytes, data);

    const dir = new DataView(new ArrayBuffer(46));
    dir.setUint32(0, 0x02014b50, true);
    dir.setUint16(4, 20, true);
    dir.setUint16(6, 20, true);
    dir.setUint32(16, crc, true);
    dir.setUint32(20, data.length, true);
    dir.setUint32(24, data.length, true);
    dir.setUint16(28, nameBytes.length, true);
    dir.setUint32(42, offset, true);
    central.push(new Uint8Array(dir.buffer), nameBytes);
    offset += 30 + nameBytes.length + data.length;
  }
  const dirSize = central.reduce((n, p) => n + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, dirSize, true);
  end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)] as BlobPart[], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

// ---------- PDF (single-font table, landscape A4) ----------

const PAGE_W = 842;
const PAGE_H = 595;
const MARGIN = 36;
const FONT = 8;
const ROW_H = 16;

// Characters outside Latin-1 that WinAnsiEncoding still has; anything else prints as "?".
const WIN_ANSI: Record<string, number> = { "—": 0x97, "–": 0x96, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "…": 0x85, "€": 0x80 };

const pdfText = (s: string) =>
  Array.from(s, (ch) => {
    const code = ch.charCodeAt(0);
    const c = ch.length === 1 && code < 256 ? code : (WIN_ANSI[ch] ?? 0x3f);
    const out = String.fromCharCode(c);
    return out === "(" || out === ")" || out === "\\" ? "\\" + out : out;
  }).join("");

// Helvetica averages ~0.52em per character; good enough to size columns and truncate.
const textWidth = (s: string, size: number) => s.length * size * 0.52;

const fit = (s: string, width: number, size: number) => {
  if (textWidth(s, size) <= width) return s;
  const max = Math.max(1, Math.floor(width / (size * 0.52)) - 1);
  return s.slice(0, max) + "…";
};

function buildPdf(title: string, header: string[], body: Cell[][]): Blob {
  const usable = PAGE_W - MARGIN * 2;
  const natural = header.map((h, i) => Math.min(220, Math.max(textWidth(h, FONT) + 12, ...body.map((r) => textWidth(text(r[i]), FONT) + 12))));
  const scale = Math.min(1, usable / natural.reduce((a, b) => a + b, 0));
  const widths = natural.map((w) => w * scale);

  const rowsPerPage = Math.max(1, Math.floor((PAGE_H - MARGIN * 2 - 50) / ROW_H));
  const pages: Cell[][][] = [];
  for (let i = 0; i < Math.max(1, body.length); i += rowsPerPage) pages.push(body.slice(i, i + rowsPerPage));

  const generated = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const streams = pages.map((pageRows, p) => {
    const ops: string[] = [];
    const put = (s: string, x: number, y: number, font: "F1" | "F2", size: number, rgb = "0.13 0.16 0.2") =>
      ops.push(`BT ${rgb} rg /${font} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${pdfText(s)}) Tj ET`);
    let y = PAGE_H - MARGIN;
    put(title, MARGIN, y - 12, "F2", 14);
    put(`Generated ${generated} · ${body.length} row${body.length === 1 ? "" : "s"} · Page ${p + 1} of ${pages.length}`, MARGIN, y - 28, "F1", 8, "0.4 0.45 0.5");
    y -= 44;
    // Header band
    ops.push(`0.93 0.97 0.95 rg ${MARGIN} ${(y - ROW_H).toFixed(1)} ${usable} ${ROW_H} re f`);
    let x = MARGIN;
    header.forEach((h, i) => {
      put(fit(h, widths[i] - 8, FONT), x + 4, y - 11, "F2", FONT, "0.02 0.35 0.24");
      x += widths[i];
    });
    y -= ROW_H;
    pageRows.forEach((r) => {
      ops.push(`0.88 0.9 0.92 RG 0.5 w ${MARGIN} ${(y - ROW_H).toFixed(1)} m ${MARGIN + usable} ${(y - ROW_H).toFixed(1)} l S`);
      x = MARGIN;
      r.forEach((v, i) => {
        put(fit(text(v), widths[i] - 8, FONT), x + 4, y - 11, "F1", FONT);
        x += widths[i];
      });
      y -= ROW_H;
    });
    if (body.length === 0) put("No rows to export.", MARGIN + 4, y - 14, "F1", FONT, "0.4 0.45 0.5");
    return ops.join("\n");
  });

  // Objects: 1 catalog, 2 pages, 3 F1, 4 F2, then (page, content) pairs
  const objects: string[] = [];
  const kids = streams.map((_, i) => `${5 + i * 2} 0 R`).join(" ");
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${streams.length} >>`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  streams.forEach((s, i) => {
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`);
    objects.push(`<< /Length ${s.length} >>\nstream\n${s}\nendstream`);
  });

  // Every char is a single byte (pdfText maps to 0–255), so string length == byte length for the xref offsets.
  let out = "%PDF-1.4\n";
  const offsets = objects.map((o, i) => {
    const at = out.length;
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
    return at;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: "application/pdf" });
}
