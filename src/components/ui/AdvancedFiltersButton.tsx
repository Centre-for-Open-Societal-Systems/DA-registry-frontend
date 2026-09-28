import { cn } from "@/lib/utils";

// Toolbar trigger for AdvancedFiltersDrawer; turns green and shows a count when any filter is applied.
export function AdvancedFiltersButton({ activeCount, onClick, className }: { activeCount: number; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border bg-white px-3.5 text-[13.5px] font-medium transition-colors",
        activeCount > 0 ? "border-brand-green text-brand-green hover:bg-[#F0FAF5]" : "border-zinc-200 text-[#1a2b3c] hover:bg-zinc-50",
        className,
      )}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
        <path d="M4 6h16M4 12h10M4 18h6" />
        <circle cx="17" cy="12" r="2" />
        <circle cx="13" cy="18" r="2" />
      </svg>
      Advanced Filters
      {activeCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-green px-1.5 text-[11px] font-semibold text-white">
          {activeCount}
        </span>
      )}
    </button>
  );
}
