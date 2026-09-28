import { cn } from "@/lib/utils";

export type PillTone = "green" | "amber" | "red" | "slate" | "blue" | "purple";

const TONES: Record<PillTone, string> = {
  green: "border-[#A7E3C7] bg-[#EBFAF2] text-brand-green",
  amber: "border-[#FCD9A8] bg-[#FFF7EB] text-[#C2410C]",
  red: "border-[#FCC4C4] bg-[#FFF1F1] text-[#DC2626]",
  slate: "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
  blue: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  purple: "border-[#DDD6FE] bg-[#F5F3FF] text-[#6D28D9]",
};

// Colour-coded status chip. Callers map their domain status → tone (see features/*/data.ts).
export function Pill({ tone = "slate", children, className, dot }: { tone?: PillTone; children: React.ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12px] font-medium", TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
