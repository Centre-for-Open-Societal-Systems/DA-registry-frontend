"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  headerClassName,
  bodyClassName,
  collapsible,
  defaultOpen = true,
}: SectionCardProps) {
  const isFindFarmer =
    title.trim().toLowerCase() === "find farmer" ||
    title.trim().toLowerCase() === "fund farmer";
  const shouldCollapse = collapsible !== undefined ? collapsible : !isFindFarmer;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden border border-line bg-white shadow-card",
        !className?.includes("rounded-") && "rounded-xl",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 transition-colors",
          isFindFarmer ? "bg-white" : "bg-surface",
          shouldCollapse && "cursor-pointer select-none hover:bg-slate-100/60",
          headerClassName,
        )}
        onClick={() => {
          if (shouldCollapse) setIsOpen((prev) => !prev);
        }}
      >
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          {(description || isFindFarmer) && (
            <p className="mt-0.5 text-[13px] font-normal text-muted">
              {description ?? "Assigned location, kebele details, and regional placement information."}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {action}
          {shouldCollapse && (
            <button
              type="button"
              aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-muted shadow-xs transition-colors hover:border-slate-300 hover:text-ink focus:outline-none"
            >
              <svg
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform duration-200 ease-in-out",
                  isOpen ? "rotate-0" : "-rotate-90",
                )}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className={cn("p-5", bodyClassName)}>{children}</div>
        </div>
      </div>
    </section>
  );
}
