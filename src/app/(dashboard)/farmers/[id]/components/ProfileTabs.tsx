"use client";

import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

// Advisory notes are Part 2 (Advisory module) and stay hidden until it ships; AdvisoryNotesSection is kept for then.
const TABS = ["Overview", "Holdings", "Crop history", "Visit history", "Documents"] as const;
export type ProfileTab = (typeof TABS)[number];

// Only the tab switch runs on the client; each panel is rendered by the page and passed in.
export function ProfileTabs({ panels }: { panels: Record<ProfileTab, ReactNode> }) {
  const [active, setActive] = useState<ProfileTab>("Overview");

  return (
    <Card className="overflow-hidden p-0 shadow-card">
      <div className="flex overflow-x-auto border-b border-line" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={cn(
              "whitespace-nowrap px-4 py-3.5 text-[14px] transition-colors",
              active === tab
                ? "-mb-px border-b-2 border-brand-green bg-brand-wash font-medium text-brand-green"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div key={active} className="animate-fade-in p-4">
        {active === "Overview" ? panels.Overview : <div className="min-h-[560px]">{panels[active]}</div>}
      </div>
    </Card>
  );
}
