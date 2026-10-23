// Gregorian → Ethiopian calendar (13 months: twelve of 30 days and Pagume of 5 or 6), via the Julian day number.

const ETHIOPIAN_EPOCH_JDN = 1723856;

const julianDay = (year: number, month: number, day: number) => {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
};

/** "DD/MM/YYYY" in the Ethiopian calendar for a yyyy-mm-dd date; empty for anything else. */
export function toEthiopianDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "";
  const [year, month, day] = match.slice(1).map(Number);
  const offset = julianDay(year, month, day) - ETHIOPIAN_EPOCH_JDN;
  const cycle = offset % 1461;
  const n = (cycle % 365) + 365 * Math.floor(cycle / 1460);
  const ethiopianYear = 4 * Math.floor(offset / 1461) + Math.floor(cycle / 365) - Math.floor(cycle / 1460);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad((n % 30) + 1)}/${pad(Math.floor(n / 30) + 1)}/${ethiopianYear}`;
}
