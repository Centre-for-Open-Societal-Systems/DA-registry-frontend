import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name — the switch has no visible label of its own. */
  label: string;
  disabled?: boolean;
  className?: string;
}

// Compact on/off toggle for table rows (brand green when on).
export function Switch({ checked, onChange, label, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-brand-green" : "bg-zinc-300",
        className,
      )}
    >
      <span className={cn("inline-block h-[18px] w-[18px] rounded-full bg-white shadow transition-transform", checked ? "translate-x-[23px]" : "translate-x-[3px]")} />
    </button>
  );
}
