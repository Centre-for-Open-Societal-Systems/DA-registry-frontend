"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const RANGES = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This quarter",
  "This year",
  "Custom range",
];

interface DateRangeDropdownProps {
  /** Options to pick from; defaults to the dashboard ranges. */
  ranges?: readonly string[];
  defaultValue?: string;
  onChange?: (range: string) => void;
}

export function DateRangeDropdown({ ranges = RANGES, defaultValue = "Last 30 days", onChange }: DateRangeDropdownProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-[190px] items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-[13.5px] font-medium text-ink transition-colors hover:bg-zinc-50"
      >
        <div className="flex items-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink-soft">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className="truncate">{selected}</span>
        </div>
        <svg className={cn("h-4 w-4 shrink-0 text-ink-soft transition-transform", isOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[280px] bg-white rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-zinc-100 z-99999999 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 border border-line">
          <div className="flex flex-col">
            {ranges.map((range, idx) => {
              const isSelected = selected === range;
              return (
                <button
                  key={range}
                  onClick={() => {
                    setSelected(range);
                    onChange?.(range);
                  }}
                  className={cn(
                    "flex items-center gap-4 px-5 py-3 text-left text-[15px] transition-colors",
                    isSelected ? "bg-brand-mint text-brand-green font-semibold" : "text-ink hover:bg-zinc-50",
                    idx !== ranges.length - 1 && "border-b border-zinc-100"
                  )}
                >
                  {/* Radio Icon */}
                  <div className={cn(
                    "w-5 h-5 rounded-full border-[2px] flex items-center justify-center shrink-0 transition-all duration-300",
                    isSelected ? "border-brand-green" : "border-subtle"
                  )}>
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full bg-brand-green transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                        isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {range}
                    {isSelected && (
                      <svg className="w-[18px] h-[18px] text-brand-green" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-zinc-100 flex justify-end bg-surface">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex shrink-0 whitespace-nowrap h-9 items-center rounded-md bg-brand-green px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
