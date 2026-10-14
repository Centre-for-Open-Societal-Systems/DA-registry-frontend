"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { EXPORT_FORMATS, type ExportFormat } from "@/lib/export";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  label?: string;
  /** Called with the format picked in the menu once the user presses Export. */
  onExport: (format: ExportFormat) => void;
  /** Formats offered, in menu order (defaults to PDF · Excel · CSV). */
  formats?: ExportFormat[];
  disabled?: boolean;
  /** Set false for the compact text-only trigger (e.g. the Master registry toolbar). */
  icon?: boolean;
  className?: string;
}

const MENU_WIDTH = 272;

// The one Export control for table toolbars and report cards: green outline "Export Report" button that opens a
// format menu (PDF · Excel · CSV) with an Export action. The menu is portalled so overflow-hidden cards never clip it.
export function ExportButton({ label = "Export Report", onExport, formats = ["pdf", "xlsx", "csv"], disabled, icon = true, className }: ExportButtonProps) {
  const options = EXPORT_FORMATS.filter((o) => formats.includes(o.value));
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>(options[0]?.value ?? "csv");
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    // A fixed menu would drift away from its trigger, so any outside scroll or resize closes it.
    const onScroll = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onResize = () => setIsOpen(false);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen]);

  const open = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      // Right-align under the trigger, but never past the left edge of the viewport.
      const left = Math.max(12, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 12));
      const spaceBelow = window.innerHeight - rect.bottom;
      setMenuStyle(spaceBelow < 240 && rect.top > spaceBelow ? { left, bottom: window.innerHeight - rect.top + 6 } : { left, top: rect.bottom + 6 });
    }
    setIsOpen(true);
  };

  const confirm = () => {
    setIsOpen(false);
    onExport(format);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        className={cn(
          "inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-brand-green bg-white px-3.5 text-[13.5px] font-semibold text-brand-green transition-colors hover:bg-brand-wash disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-subtle disabled:hover:bg-white",
          isOpen && "bg-brand-wash",
          className,
        )}
      >
        {icon && (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 4v11m0 0l-4-4m4 4l4-4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
          </svg>
        )}
        {label}
        <svg className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="dialog"
          aria-label="Export format"
          className="fixed z-[110] animate-dropdown-in overflow-hidden rounded-xl border border-line bg-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]"
          style={{ ...menuStyle, width: MENU_WIDTH }}
        >
          <div role="radiogroup" aria-label="File format">
            {options.map((o) => {
              const selected = o.value === format;
              return (
                <label
                  key={o.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 border-b border-line-soft px-4 py-3 text-[14px] transition-colors",
                    selected ? "bg-brand-wash font-semibold text-brand-green" : "text-ink hover:bg-surface",
                  )}
                >
                  <input type="radio" name={menuId} value={o.value} checked={selected} onChange={() => setFormat(o.value)} className="h-4 w-4 accent-brand-green" />
                  <span className="flex-1">{o.label}</span>
                  {selected && (
                    <svg className="h-4 w-4 shrink-0 text-brand-green" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.7 7.7l-5.5 5.5a1 1 0 01-1.4 0l-2.5-2.5a1 1 0 111.4-1.4l1.8 1.8 4.8-4.8a1 1 0 111.4 1.4z" />
                    </svg>
                  )}
                </label>
              );
            })}
          </div>
          <div className="flex justify-end px-3 py-3">
            <button type="button" onClick={confirm} className="inline-flex h-9 items-center rounded-md bg-brand-green px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark">
              Export
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
