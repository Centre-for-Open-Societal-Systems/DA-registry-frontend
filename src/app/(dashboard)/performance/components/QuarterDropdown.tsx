"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { QUARTERS } from "@/features/performance/data";

interface QuarterDropdownProps {
  value: string;
  onChange: (quarter: string) => void;
}

export function QuarterDropdown({ value, onChange }: QuarterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex h-9 items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3.5 text-[13.5px] font-medium text-[#1a2b3c] transition-colors hover:bg-zinc-50"
      >
        <svg className="h-4 w-4 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
        {value}
        <svg className={cn("h-4 w-4 text-[#4a5568] transition-transform", isOpen && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul role="listbox" className="absolute right-0 z-30 mt-1.5 w-full min-w-[220px] overflow-hidden rounded-lg border border-[#E5E7EB] bg-white py-1 text-[14px] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]">
          {QUARTERS.map((q) => (
            <li key={q}>
              <button
                type="button"
                role="option"
                aria-selected={q === value}
                onClick={() => {
                  onChange(q);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-4 py-2.5 text-left transition-colors hover:bg-[#F8FAFC]",
                  q === value ? "font-semibold text-brand-green" : "text-[#1a2b3c]"
                )}
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
