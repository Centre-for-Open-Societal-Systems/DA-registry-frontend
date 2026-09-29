import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  hint?: string;
  tone?: "muted" | "error";
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

// Empty / error placeholder for list surfaces (NFR "Feedback states").
export function EmptyState({ title, hint, tone = "muted", actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-8 text-center", className)}>
      <span className={cn("flex h-11 w-11 items-center justify-center rounded-full", tone === "error" ? "bg-danger-wash text-danger" : "bg-slate-100 text-muted")}>
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {tone === "error" ? <path d="M12 8v4M12 16h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /> : <path d="M20 12V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h6M3 10h18M16 19h6M19 16v6" />}
        </svg>
      </span>
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      {hint && <p className="max-w-md text-[13px] text-muted">{hint}</p>}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="mt-1 inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-md border border-brand-green bg-white px-4 text-[13.5px] font-semibold text-brand-green hover:bg-brand-wash">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
