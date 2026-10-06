import { cn } from "@/lib/utils";

// Generic person avatar shown in place of a profile photo. Sized by the caller; the icon scales with it.
export function PersonAvatar({ label, className }: { label?: string; className?: string }) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-brand-tint text-brand-green", className)}
    >
      <svg className="h-[58%] w-[58%]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="7.5" r="4.5" />
        <path d="M3.5 21a8.5 8.5 0 0117 0 1 1 0 01-1 1h-15a1 1 0 01-1-1z" />
      </svg>
    </span>
  );
}
