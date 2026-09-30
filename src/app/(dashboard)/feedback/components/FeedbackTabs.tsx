"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
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
      <PageHeader
        tabBar={
          <SegmentTabs<Tab>
            tabs={canRunQueue ? [{ key: "queue", label: "Issue queue" }, { key: "report", label: "Report an issue" }] : [{ key: "report", label: "Report an issue" }]}
            active={active}
            onChange={setTab}
          />
        }
        title="Internal Feedback"
        description="Operational, equipment, payment/incentive, safety and data/system issues raised by DAs to their supervisor — distinct from farmer grievances and from performance feedback."
      />
      {active === "report" ? <FeedbackWorkspace /> : <IssueQueue />}
    </div>
  );
}
