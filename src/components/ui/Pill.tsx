import { cn } from "@/lib/utils";

export type PillTone = "green" | "amber" | "red" | "slate" | "blue" | "purple";

const TONES: Record<PillTone, string> = {
  green: "border-brand-border bg-brand-mint text-brand-green",
  amber: "border-warning-border bg-warning-wash text-orange-700",
  red: "border-danger-border bg-danger-wash text-danger",
  slate: "border-slate-200 bg-surface text-slate-600",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  purple: "border-violet-200 bg-violet-50 text-violet-700",
};

// Colour-coded status chip. Callers map their domain status → tone (see features/*/data.ts).
export function Pill({ tone = "slate", children, className, dot }: { tone?: PillTone; children: React.ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] font-semibold", TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
