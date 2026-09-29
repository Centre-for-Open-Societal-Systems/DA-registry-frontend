import { cn } from "@/lib/utils";

interface PageLoaderProps {
  label?: string;
  /** Cover the whole viewport (before the app shell exists) instead of just the content area. */
  fullScreen?: boolean;
}

// The one spinning loader shown while a page renders or its data loads, so every role sees the same thing.
export function PageLoader({ label = "Loading…", fullScreen = false }: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full animate-fade-in flex-col items-center justify-center gap-3",
        fullScreen ? "h-screen bg-surface" : "min-h-[60vh]",
      )}
    >
      <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-zinc-200 border-t-brand-green" aria-hidden="true" />
      <span className="text-[13px] font-medium text-muted">{label}</span>
    </div>
  );
}
