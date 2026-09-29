"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Farmer } from "../types";
import { PlanVisitModal, type VisitPreset } from "./PlanVisitModal";

// Green "+ Plan visit" button that owns its modal; used on the Visits pages.
interface PlanVisitButtonProps {
  farmer?: Farmer;
  className?: string;
  mode?: "plan" | "schedule";
  label?: string;
  variant?: "solid" | "outline";
  icon?: "plus" | "calendar";
  /** Preselected reason / visit type / priority for this farmer. */
  preset?: VisitPreset;
}

export function PlanVisitButton({ farmer, className, mode = "plan", label = "Plan visit", variant = "solid", icon = "plus", preset }: PlanVisitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "inline-flex shrink-0 whitespace-nowrap h-9 items-center gap-2 rounded-md px-3.5 text-[13.5px] font-semibold transition-colors",
          variant === "solid"
            ? "bg-brand-green text-white hover:bg-brand-green-dark"
            : "border border-brand-green bg-white text-brand-green hover:bg-brand-wash",
          className,
        )}
      >
        {icon === "plus" ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18M9 15l2 2 4-4" />
          </svg>
        )}
        {label}
      </button>
      {isOpen && <PlanVisitModal farmer={farmer} mode={mode} preset={preset} isOpen onClose={() => setIsOpen(false)} />}
    </>
  );
}
