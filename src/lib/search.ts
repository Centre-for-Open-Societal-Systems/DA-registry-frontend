// Table search that looks at every piece of data a row carries, not just one or two columns.

/** Collects every string / number inside a value (nested objects and arrays included) into one lowercase haystack. */
function collectText(value: unknown, out: string[], depth = 0): void {
  if (value == null || depth > 4) return;
  if (typeof value === "string") out.push(value);
  else if (typeof value === "number" || typeof value === "bigint") out.push(String(value));
  else if (typeof value === "boolean") return;
  else if (value instanceof Date) out.push(value.toISOString());
  else if (value instanceof Set) value.forEach((v) => collectText(v, out, depth + 1));
  else if (Array.isArray(value)) value.forEach((v) => collectText(v, out, depth + 1));
  else if (typeof value === "object") Object.values(value).forEach((v) => collectText(v, out, depth + 1));
}

/** Lowercase, and drop the spaces/dashes people type inconsistently in IDs and phone numbers. */
const normalise = (s: string) => s.toLowerCase().replace(/[\s\-_.·,/]+/g, " ").trim();
const compact = (s: string) => s.replace(/ /g, "");

/**
 * True when every word of `query` appears somewhere in the row's data.
 * Pass the row plus any display-only text (labels, derived values) the user can see in the table.
 * Matching ignores case and separators, so "da or 0412", "DA-OR-0412" and "daor0412" all find DA-OR-0412.
 */
export function matchesQuery(query: string, ...values: unknown[]): boolean {
  const q = normalise(query);
  if (!q) return true;
  const parts: string[] = [];
  values.forEach((v) => collectText(v, parts));
  const haystack = normalise(parts.join(" \u0000 "));
  const haystackCompact = compact(haystack);
  return q.split(" ").every((term) => haystack.includes(term) || haystackCompact.includes(term)) || haystackCompact.includes(compact(q));
}

const MAX_PLACEHOLDER_HEADINGS = 4;

/**
 * Search box placeholder built from the table's column headings, e.g. "Search Agent, Kebele, Visits, Status…".
 * Action columns and non-text headers are skipped; after the first few headings the rest collapse into "…".
 */
export function searchPlaceholder(headings: unknown[]): string {
  const names = headings.filter((h): h is string => typeof h === "string" && h.trim() !== "" && !/^actions?$/i.test(h.trim()));
  if (names.length === 0) return "Search…";
  const shown = names.slice(0, MAX_PLACEHOLDER_HEADINGS).join(", ");
  return `Search ${shown}${names.length > MAX_PLACEHOLDER_HEADINGS ? ", …" : "…"}`;
}
