"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import { useAuthStore } from "@/store/useAuthStore";
import { FeedbackWorkspace } from "./FeedbackWorkspace";
import { IssueQueue } from "./IssueQueue";

type Tab = "report" | "queue";

// FR-13: Internal Feedback module under Agent Registry — tabs Report an issue · Issue queue.
// The queue tab is Supervisor/Admin only (DAs cannot resolve/assign — Appendix D row 1).
export function FeedbackTabs() {
  const role = useAuthStore((s) => s.role);
  const canRunQueue = role === "Supervisor" || role === "Admin";
  const [tab, setTab] = useState<Tab>(canRunQueue ? "queue" : "report");
  const active: Tab = canRunQueue ? tab : "report";

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 px-4 pt-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-[#1a2b3c] sm:text-[22px]">Internal Feedback</h1>
            <p className="mt-1 text-[13.5px] text-[#4a5568]">
              Operational, equipment, payment/incentive, safety and data/system issues raised by DAs to their supervisor — distinct from farmer grievances and from performance feedback.
            </p>
          </div>
        </div>
        <SegmentTabs<Tab>
          className="mt-3"
          tabs={canRunQueue ? [{ key: "queue", label: "Issue queue" }, { key: "report", label: "Report an issue" }] : [{ key: "report", label: "Report an issue" }]}
          active={active}
          onChange={setTab}
        />
      </Card>
      {active === "report" ? <FeedbackWorkspace /> : <IssueQueue />}
    </div>
  );
}
