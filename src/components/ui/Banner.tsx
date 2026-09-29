import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BannerTone = "success" | "info" | "warning" | "error";

const TONES: Record<BannerTone, string> = {
  success: "border-brand-border bg-brand-mint text-emerald-800",
  info: "border-blue-200 bg-blue-50 text-blue-900",
  warning: "border-warning-border bg-warning-wash text-orange-800",
  error: "border-danger-border bg-danger-wash text-red-800",
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
