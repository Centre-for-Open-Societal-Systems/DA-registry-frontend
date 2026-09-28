import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BannerTone = "success" | "info" | "warning" | "error";

const TONES: Record<BannerTone, string> = {
  success: "border-[#A7E3C7] bg-[#EBFAF2] text-[#065F46]",
  info: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]",
  warning: "border-[#FCD9A8] bg-[#FFF7EB] text-[#9A3412]",
  error: "border-[#FCC4C4] bg-[#FFF1F1] text-[#991B1B]",
};

// Inline outcome banner. Submit actions resolve to one of these, naming the offline/sync outcome (NFR).
export function Banner({ tone = "info", title, children, onDismiss, className }: { tone?: BannerTone; title?: string; children?: ReactNode; onDismiss?: () => void; className?: string }) {
  return (
    <div role="status" className={cn("flex animate-slide-down items-start gap-3 rounded-lg border px-4 py-3 text-[13.5px]", TONES[tone], className)}>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", "leading-relaxed")}>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      )}
    </div>
  );
}
