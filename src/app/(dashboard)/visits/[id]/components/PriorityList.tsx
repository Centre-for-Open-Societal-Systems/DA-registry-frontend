"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { PRIORITY_LIST } from "@/features/visits/data";
import { PlanVisitButton } from "@/features/farmers/components/PlanVisitButton";
import { getFarmer } from "@/features/farmers/data";
import type { PriorityLevel } from "@/features/visits/types";

const LEVEL_STYLES: Record<PriorityLevel, { flag: string; tag: string }> = {
  high: { flag: "text-[#DC2626]", tag: "border-[#FCC4C4] bg-[#FFF1F1] text-[#DC2626]" },
  medium: { flag: "text-[#D97706]", tag: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]" },
  low: { flag: "text-[#CBD5E1]", tag: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]" },
};

const LEVELS: { value: PriorityLevel | "all"; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function PriorityList() {
  const [level, setLevel] = useState<PriorityLevel | "all">("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the filter popover on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const items = level === "all" ? PRIORITY_LIST : PRIORITY_LIST.filter((item) => item.level === level);
  const activeLabel = LEVELS.find((l) => l.value === level)?.label ?? "";

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
        <div>
          <h3 className="text-[15px] font-semibold text-[#1a2b3c]">Priority list</h3>
          <p className="mt-0.5 text-[13.5px] text-[#4a5568]">Farmers with critical issues flagged for attention</p>
        </div>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="Priority filters"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className={cn("rounded-md p-1.5 text-brand-green transition-colors hover:bg-[#F0FAF5]", (menuOpen || level !== "all") && "bg-[#F0FAF5]")}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
              <circle cx="9" cy="6" r="2" fill="white" /><circle cx="15" cy="12" r="2" fill="white" /><circle cx="8" cy="18" r="2" fill="white" />
            </svg>
          </button>
          {menuOpen && (
            <ul role="menu" aria-label="Filter by priority" className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
              {LEVELS.map((l) => {
                const count = l.value === "all" ? PRIORITY_LIST.length : PRIORITY_LIST.filter((i) => i.level === l.value).length;
                const active = level === l.value;
                return (
                  <li key={l.value}>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => {
                        setLevel(l.value);
                        setMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-3.5 py-2 text-left text-[13.5px] transition-colors hover:bg-[#F8FAFC]",
                        active ? "font-semibold text-brand-green" : "text-[#1a2b3c]",
                      )}
                    >
                      {l.label}
                      <span className="text-[12px] font-normal text-[#64748b]">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {level !== "all" && (
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-5 py-2 text-[12.5px] text-[#475569]">
          <span>Showing</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#A7E3C7] bg-[#EBFAF2] py-0.5 pl-2.5 pr-1 font-medium text-brand-green">
            {activeLabel} priority
            <button type="button" onClick={() => setLevel("all")} aria-label="Clear priority filter" className="rounded-full p-0.5 hover:bg-white">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState title={`No ${activeLabel.toLowerCase()} priority farmers`} hint="Try another priority level." actionLabel="Show all" onAction={() => setLevel("all")} />
      ) : (
        <ol>
          {items.map((item, index) => {
            const style = LEVEL_STYLES[item.level];
            return (
              <li key={item.name} className="flex items-center gap-4 border-b border-[#E5E7EB] px-5 py-3.5 last:border-0">
                <span className="w-4 text-[14px] font-medium text-[#1a2b3c]">{index + 1}</span>
                <svg className={cn("h-5 w-5 shrink-0", style.flag)} viewBox="0 0 24 24" fill={item.level === "low" ? "none" : "currentColor"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 22V4M4 4h12l-2 4 2 4H4" />
                </svg>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <p className="text-[14.5px] font-semibold text-[#1a2b3c]">{item.name}</p>
                  <span className={cn("w-fit rounded-md border px-2.5 py-0.5 text-[12.5px] font-medium", style.tag)}>{item.issue}</span>
                </div>
                <PlanVisitButton
                  mode="schedule"
                  label="Schedule"
                  farmer={getFarmer(item.farmerId)}
                  preset={{ reason: item.issue, visitType: item.visitType, level: item.level }}
                  variant="outline"
                  icon="calendar"
                  className="h-9 px-3.5 text-[13.5px]"
                />
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
