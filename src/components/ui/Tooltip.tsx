"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

// Hover/focus tooltip rendered through a portal with fixed positioning, so it isn't clipped by
// overflow-x-auto tables or scroll containers. Anchored above the trigger, centred.
export function Tooltip({ content, children, className }: TooltipProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setPos({ top: r.top - 8, left: r.left + r.width / 2 });
  };

  return (
    <>
      <span
        className={cn("inline-flex", className)}
        tabIndex={0}
        onMouseEnter={(e) => show(e.currentTarget)}
        onMouseLeave={() => setPos(null)}
        onFocus={(e) => show(e.currentTarget)}
        onBlur={() => setPos(null)}
      >
        {children}
      </span>
      {pos &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: pos.top, left: pos.left }}
            className="pointer-events-none fixed z-[130] flex -translate-x-1/2 -translate-y-full flex-col items-center"
          >
            <div className="max-w-[260px] rounded-md bg-[#1a2b3c] px-3 py-2 text-left text-[12.5px] leading-snug text-white shadow-lg">{content}</div>
            <span className="h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-[#1a2b3c]" />
          </div>,
          document.body,
        )}
    </>
  );
}
