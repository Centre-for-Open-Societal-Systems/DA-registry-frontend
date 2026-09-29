"use client";

import type { ReactNode } from "react";
import { Pill } from "@/components/ui/Pill";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";
import { APPROVAL_REQUEST_TONE, type ApprovalKind, type ApprovalRequest } from "@/features/agents";
import { isOpen } from "./approvals";

const svg = (children: ReactNode) => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const KIND_ICON: Record<ApprovalKind, ReactNode> = {
  Onboarding: svg(<><circle cx="9" cy="8" r="4" /><path d="M2 21v-1a6 6 0 0112 0v1M19 8v6M16 11h6" /></>),
  "Profile change": svg(<><circle cx="9" cy="8" r="4" /><path d="M2 21v-1a6 6 0 019-5.2" /><circle cx="18" cy="17" r="2.5" /><path d="M18 13v1.5M18 19.5V21M14 17h1.5M20.5 17H22" /></>),
  Assignment: svg(<><circle cx="9" cy="8" r="4" /><path d="M2 21v-1a6 6 0 0110-4.5M16 17h6M19 14l3 3-3 3" /></>),
  Specialization: svg(<><path d="M7 20h10M12 20v-8" /><path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z" /></>),
};

interface ApprovalQueueItemProps {
  request: ApprovalRequest;
  active: boolean;
  checked: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

export function ApprovalQueueItem({ request: r, active, checked, onToggle, onSelect }: ApprovalQueueItemProps) {
  return (
    <li className={cn("flex gap-3 px-4 py-3.5 transition-colors", active ? "bg-brand-tint" : "hover:bg-surface")}>
      <span className="pt-0.5">
        <Checkbox checked={checked} disabled={!isOpen(r)} onChange={onToggle} aria-label={`Select ${r.title}`} />
      </span>
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 text-left"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wide text-slate-600">
            {KIND_ICON[r.kind]}
            {r.kind}
          </span>
          <Pill tone={APPROVAL_REQUEST_TONE[r.status]}>{r.status}</Pill>
        </span>
        <span className="mt-1.5 block text-[14px] font-semibold leading-snug text-ink">{r.title}</span>
        <span className="mt-1 flex items-center gap-2 text-[12px] text-muted">
          Self-initiated <span className="h-1 w-1 rounded-full bg-subtle" aria-hidden="true" /> {r.place}
        </span>
        <span className="mt-0.5 block text-[12px] text-muted">{r.submittedAt}</span>
      </button>
    </li>
  );
}
