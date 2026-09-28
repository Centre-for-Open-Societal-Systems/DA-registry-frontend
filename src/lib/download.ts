// Client-side file downloads for Export / Download-template buttons until the export APIs exist.

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

const escapeCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Saves a Blob under `filename` through a temporary link. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Builds a CSV (with BOM so Excel opens UTF-8 names correctly) and downloads it. */
export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]) {
  const lines = [columns.map((c) => escapeCell(c.header)).join(","), ...rows.map((r) => columns.map((c) => escapeCell(c.value(r))).join(","))];
  downloadBlob(new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }), filename);
}

/** Empty import template: just the header row, plus an optional example row. */
export function downloadTemplate(filename: string, headers: string[], example?: (string | number)[]) {
  const lines = [headers.map(escapeCell).join(",")];
  if (example) lines.push(example.map(escapeCell).join(","));
  downloadBlob(new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }), filename);
}

/** Today's date as YYYY-MM-DD for export file names. */
export const fileDate = () => new Date().toISOString().slice(0, 10);
