import { cn } from "@/lib/utils";

// The one Export control for table toolbars and report cards: green outline, download icon, h-9 like the other toolbar buttons.
export function ExportButton({ label = "Export", onClick, disabled, className }: { label?: string; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-brand-green bg-white px-3.5 text-[13.5px] font-semibold text-brand-green transition-colors hover:bg-[#F0FAF5] disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-[#94A3B8] disabled:hover:bg-white",
        className,
      )}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 4v11m0 0l-4-4m4 4l4-4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
      </svg>
      {label}
    </button>
  );
}
