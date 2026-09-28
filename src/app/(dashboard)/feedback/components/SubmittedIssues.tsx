"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { cn } from "@/lib/utils";
import type { Issue, IssueStatus } from "../types";
import { IssueFilter, matchesFilter, type IssueFilterValue } from "./IssueFilter";

const STATUS_STYLES: Record<IssueStatus, string> = {
  "Queued (offline)": "border-[#FCD9A8] bg-[#FFF7EB] text-[#B45309]",
  "In Progress": "border-[#FDE68A] bg-[#FEFCE8] text-[#A16207]",
  "In Review": "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  Assigned: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  Submitted: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  New: "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
  Resolved: "border-[#A7E3C7] bg-[#EBFAF2] text-brand-green",
  Closed: "border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]",
};

export function SubmittedIssues({ issues }: { issues: Issue[] }) {
  const [filter, setFilter] = useState<Set<IssueFilterValue>>(new Set());

  const visible = issues.filter((i) => matchesFilter(i.status, filter));
  const queued = issues.filter((i) => i.status === "Queued (offline)");

  return (
    <Card className="flex min-h-0 flex-1 flex-col p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-[#1a2b3c]">My submitted issues</h2>
        <IssueFilter selected={filter} onChange={setFilter} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-4">
        {queued.length > 0 && (
          <Banner tone="warning">
            {queued.length} issue{queued.length > 1 ? "s" : ""} queued offline ({queued.map((q) => q.id).join(", ")}) — will submit
            automatically on next sync.
          </Banner>
        )}

        <ul className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-0.5">
          {visible.length === 0 && (
            <li className="rounded-lg border border-dashed border-[#E5E7EB] px-4 py-8 text-center text-[14px] text-[#6B7280]">
              No issues match this filter.
            </li>
          )}
          {visible.map((issue) => (
            <li key={issue.id} className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-4">
              {/* Only the title shares a row with the status pill; the meta lines below span the full card width */}
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-[#1a2b3c]">{issue.subject}</p>
                <span className={cn("shrink-0 rounded-full border px-3 py-1 text-[12.5px] font-semibold whitespace-nowrap", STATUS_STYLES[issue.status])}>
                  {issue.status}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-[#4a5568]">
                {issue.category} · {issue.severity} severity
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-[#4a5568]">
                <span className="font-medium text-[#1a2b3c]">
                  {issue.id} · {issue.submittedLabel}
                </span>
                <span aria-hidden className="text-[#94A3B8]">•</span>
                <span>{issue.note}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
