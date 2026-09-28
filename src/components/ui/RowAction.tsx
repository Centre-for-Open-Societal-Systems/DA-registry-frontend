import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RowActionTone = "brand" | "solid" | "neutral" | "danger" | "warning";
export type RowActionIcon = "view" | "edit" | "retry" | "check" | "remove" | "calendar" | "none";

const TONES: Record<RowActionTone, string> = {
  // The default table action (View, Review, Edit) — green outline pill.
  brand: "border-brand-green bg-[#EBFAF2] text-brand-green hover:bg-brand-green hover:text-white",
  // The row's main forward action (Assign, Collect, Resolve).
  solid: "border-brand-green bg-brand-green text-white hover:bg-brand-green-dark hover:border-brand-green-dark",
  neutral: "border-zinc-200 bg-white text-[#1a2b3c] hover:bg-zinc-50",
  danger: "border-[#FCC4C4] bg-white text-[#DC2626] hover:bg-[#FFF1F1]",
  warning: "border-[#DDD6FE] bg-[#F5F3FF] text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white",
};

const ICONS: Record<Exclude<RowActionIcon, "none">, ReactNode> = {
  view: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></>,
  retry: <><path d="M21 12a9 9 0 11-3-6.7L21 8" /><path d="M21 3v5h-5" /></>,
  check: <path d="M5 13l4 4L19 7" />,
  remove: <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
};

interface RowActionProps {
  children: ReactNode;
  tone?: RowActionTone;
  icon?: RowActionIcon;
  href?: string;
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}

// The one button style for actions inside a table row, used by every registry/queue table.
export function RowAction({ children, tone = "brand", icon = "none", href, onClick, disabled, title, className }: RowActionProps) {
  const classes = cn(
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[12.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    TONES[tone],
    className,
  );
  const content = (
    <>
      {icon !== "none" && (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {ICONS[icon]}
        </svg>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} title={title} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} className={classes}>
      {content}
    </button>
  );
}
