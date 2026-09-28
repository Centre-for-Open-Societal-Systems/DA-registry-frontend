import { Fragment } from "react";
import { Card } from "@/components/ui/Card";

const LIFECYCLE = ["Draft", "Queued", "Submitted", "New", "In Review", "Assigned", "In Progress", "Resolved", "Closed"];

export function IssueLifecycle() {
  return (
    <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#E5E7EB] px-5 py-3.5">
        <h3 className="text-[15px] font-semibold text-[#1a2b3c]">Issue lifecycle</h3>
        <p className="mt-0.5 text-[13px] text-[#4a5568]">
          Exception paths: Rejected · Needs more info · Reopened · Sync-failed (auto-retry).
        </p>
      </div>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2.5 px-5 py-3.5">
        {LIFECYCLE.map((stage, i) => (
          <Fragment key={stage}>
            <li className="rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[13px] font-medium text-[#1a2b3c]">
              {stage}
            </li>
            {i < LIFECYCLE.length - 1 && (
              <li aria-hidden className="text-[#94A3B8]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </Card>
  );
}
