"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface MultiSelectDropdownProps {
  id?: string;
  placeholder?: string;
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  className?: string;
}

const VIEWPORT_GAP = 14;
const MENU_MAX_HEIGHT = 320;

export function MultiSelectDropdown({
  id,
  placeholder = "Select options…",
  options,
  selected,
  onChange,
  disabled,
  className,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Close when clicking outside or scrolling outside
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const onScroll = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", () => setIsOpen(false));
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", () => setIsOpen(false));
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const open = () => {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP;
      const spaceAbove = rect.top - VIEWPORT_GAP;
      const up = spaceBelow < 220 && spaceAbove > spaceBelow;
      setMenuStyle({
        maxHeight: Math.max(120, Math.min(MENU_MAX_HEIGHT, up ? spaceAbove : spaceBelow)),
        width: rect.width,
        minWidth: rect.width,
        ...(up ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
        left: rect.left,
      });
    }
    setIsOpen(true);
  };

  const toggle = (option: string) => {
    if (disabled) return;
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2.5 rounded-lg border bg-white px-3.5 text-left text-sm transition-all duration-150 outline-none cursor-pointer disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:hover:border-gray-200 disabled:hover:ring-0",
          isOpen
            ? "border-brand-green ring-2 ring-brand-green/20"
            : "border-gray-200 hover:border-brand-green hover:ring-1 hover:ring-brand-green/20 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20",
          className
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selected.length > 0 ? "font-normal text-zinc-900" : "font-normal text-slate-400"
          )}
        >
          {selected.length === 0
            ? placeholder
            : selected.length <= 2
            ? selected.join(", ")
            : selected.slice(0, 2).join(", ")}
        </span>

        {/* Right side: Number Card Tag (when more than 2 items are selected) + Down Chevron */}
        <div className="flex shrink-0 items-center gap-2">
          {selected.length > 2 && (
            <span
              className="inline-flex items-center justify-center rounded-md border border-brand-green/30 bg-[#ECFDF3] px-2 py-0.5 text-[11.5px] font-bold text-brand-green shadow-2xs"
              title={selected.slice(2).join(", ")}
            >
              +{selected.length - 2}
            </span>
          )}

          <svg
            className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen &&
        mounted &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="fixed z-[120] flex animate-dropdown-in flex-col overflow-hidden rounded-xl border border-line bg-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.22)]"
          >
            <div className="divide-y divide-slate-100 overflow-y-auto green-scrollbar">
              {options.map((option) => {
                const isChecked = selected.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggle(option);
                    }}
                    className="flex w-full cursor-pointer select-none items-center gap-3 px-4 py-3 text-left text-[14px] text-slate-800 transition-colors hover:bg-slate-50/80 outline-none"
                  >
                    <div
                      className={cn(
                        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border-2 transition-colors",
                        isChecked
                          ? "border-brand-green bg-brand-green text-white"
                          : "border-slate-300 bg-white hover:border-slate-400"
                      )}
                    >
                      {isChecked && (
                        <svg
                          className="h-3 w-3 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-normal text-slate-800">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
