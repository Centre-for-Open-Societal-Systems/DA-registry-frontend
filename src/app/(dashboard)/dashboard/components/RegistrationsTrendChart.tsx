import type { TrendPoint } from "@/features/dashboard";

const W = 640;
const H = 260;
const PAD_X = 12;
const PAD_TOP = 24;
const PAD_BOTTOM = 8;

// Lightweight SVG line/area chart (no chart library in the project). Scales uniformly with its container.
export function RegistrationsTrendChart({ points, seriesLabel }: { points: TrendPoint[]; seriesLabel: string }) {
  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  // Leave headroom above/below so the line never touches the frame
  const lo = min - span * 0.6;
  const hi = max + span * 0.15;

  const x = (i: number) => PAD_X + (i * (W - PAD_X * 2)) / Math.max(1, points.length - 1);
  const y = (v: number) => PAD_TOP + (1 - (v - lo) / (hi - lo)) * (H - PAD_TOP - PAD_BOTTOM);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${H} L${x(0)},${H} Z`;
  const gridYs = [0.25, 0.5, 0.75].map((f) => PAD_TOP + f * (H - PAD_TOP - PAD_BOTTOM));

  return (
    <figure className="flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${seriesLabel}: ${points.map((p) => `${p.label} ${p.value}`).join(", ")}`}>
        <defs>
          <linearGradient id="registrations-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="[stop-color:var(--color-brand-green)]" stopOpacity={0.22} />
            <stop offset="100%" className="[stop-color:var(--color-brand-green)]" stopOpacity={0} />
          </linearGradient>
        </defs>
        {gridYs.map((gy) => (
          <line key={gy} x1={PAD_X} x2={W - PAD_X} y1={gy} y2={gy} className="stroke-line" strokeWidth={1} />
        ))}
        <path d={area} fill="url(#registrations-fill)" />
        <path d={line} fill="none" className="stroke-brand-green" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <circle key={p.label} cx={x(i)} cy={y(p.value)} r={isLast ? 5.5 : 4.5} className={isLast ? "fill-brand-green stroke-white" : "fill-white stroke-brand-green"} strokeWidth={2}>
              <title>{`${p.label}: ${p.value.toLocaleString()} new farmers`}</title>
            </circle>
          );
        })}
      </svg>

      <div className="flex justify-between text-[12px] text-ink-soft">
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>

      <figcaption className="mt-3 flex items-center justify-center gap-2 text-[12px] text-ink-soft">
        <span className="h-2 w-2 rounded-full bg-brand-green" aria-hidden="true" />
        {seriesLabel}
      </figcaption>
    </figure>
  );
}
