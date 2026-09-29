"use client";

import { Card } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApprovalDetail } from "./ApprovalDetail";
import { ApprovalQueue } from "./ApprovalQueue";
import { PublishedModal } from "./PublishedModal";
import { ReviewDecisionModal } from "./ReviewDecisionModal";
import { useApprovals } from "./useApprovals";

// Woreda review of DA self-initiated changes: verify → approve & publish to the master DA Registry.
// Reject and Request changes need a reviewer note; every decision appends to the audit trail.
export function ApprovalsWorkspace() {
  const a = useApprovals();
  const { selected } = a;

  return (
    <>
      {a.outcome && <Banner tone={a.outcome.tone} onDismiss={a.dismissOutcome}>{a.outcome.text}</Banner>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[350px_1fr]">
        <ApprovalQueue
          tab={a.tab}
          onTabChange={a.setTab}
          kebele={a.kebele}
          onKebeleChange={a.setKebele}
          list={a.list}
          selectedId={selected?.id}
          onSelect={a.setSelectedId}
          checked={a.checked}
          onToggle={a.toggle}
          onToggleAll={a.toggleAll}
          allChecked={a.allChecked}
          checkableCount={a.checkable.length}
          checkedInView={a.checkedInView}
          onApprove={(ids) => a.decide(ids, "approve", "")}
          onReject={(ids) => a.openReview(ids)}
        />

        {selected ? (
          <ApprovalDetail
            key={selected.id}
            request={selected}
            note={a.notes[selected.id] ?? ""}
            onNoteChange={(value) => a.setNote(selected.id, value)}
            onReview={() => a.openReview([selected.id], a.notes[selected.id] ?? "")}
            onApprove={() => a.decide([selected.id], "approve", "")}
          />
        ) : (
          <Card className="shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
            <EmptyState title="Select a request" hint="Choose a request from the queue to verify its data and audit trail." />
          </Card>
        )}
      </div>

      <ReviewDecisionModal
        reviewIds={a.reviewIds}
        reason={a.reason}
        reasonError={a.reasonError}
        onReasonChange={a.changeReason}
        onClose={a.closeReview}
        onSubmit={a.submitReview}
      />

      <PublishedModal count={a.publishedCount} onClose={a.closePublished} />
    </>
  );
}
