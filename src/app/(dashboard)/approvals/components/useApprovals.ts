import { useState } from "react";
import { APPROVAL_REQUESTS, APPROVAL_TABS, type ApprovalRequest, type ApprovalTab } from "@/features/agents";
import { applyDecision, isOpen, MIN_NOTE, outcomeFor, type Decision, type Outcome } from "./approvals";

// Queue, selection and review-dialog state for the approvals workspace.
export function useApprovals() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(APPROVAL_REQUESTS);
  const [tab, setTab] = useState<ApprovalTab>("all");
  const [kebele, setKebele] = useState("");
  const [selectedId, setSelectedId] = useState(APPROVAL_REQUESTS[0].id);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  /** Ids awaiting a reject / request-changes decision in the review dialog. */
  const [reviewIds, setReviewIds] = useState<string[] | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);
  /** Number of records just approved — drives the success dialog. */
  const [publishedCount, setPublishedCount] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const kinds = APPROVAL_TABS.find((t) => t.key === tab)?.kinds ?? null;
  const list = requests.filter((r) => (!kinds || kinds.includes(r.kind)) && (!kebele || r.kebele === kebele));
  const selected = requests.find((r) => r.id === selectedId) ?? list[0] ?? null;

  const checkable = list.filter(isOpen);
  const checkedInView = checkable.filter((r) => checked.has(r.id));
  const allChecked = checkable.length > 0 && checkedInView.length === checkable.length;

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setChecked((prev) => {
      const next = new Set(prev);
      checkable.forEach((r) => (allChecked ? next.delete(r.id) : next.add(r.id)));
      return next;
    });

  const setNote = (id: string, value: string) => setNotes((prev) => ({ ...prev, [id]: value }));

  const decide = (ids: string[], decision: Decision, note: string) => {
    setRequests((prev) => prev.map((r) => (ids.includes(r.id) ? applyDecision(r, decision, note) : r)));
    setChecked((prev) => new Set([...prev].filter((id) => !ids.includes(id))));
    if (decision === "approve") {
      setPublishedCount(ids.length);
      return;
    }
    setOutcome(outcomeFor(decision, ids));
  };

  const openReview = (ids: string[], prefill = "") => {
    setReviewIds(ids);
    setReason(prefill);
    setReasonError(false);
  };

  const closeReview = () => setReviewIds(null);

  const changeReason = (value: string) => {
    setReason(value);
    setReasonError(false);
  };

  const submitReview = (decision: "changes" | "reject") => {
    if (!reviewIds) return;
    if (reason.trim().length < MIN_NOTE) {
      setReasonError(true);
      return;
    }
    decide(reviewIds, decision, reason.trim());
    setReviewIds(null);
  };

  return {
    tab,
    setTab,
    kebele,
    setKebele,
    list,
    selected,
    setSelectedId,
    checked,
    checkable,
    checkedInView,
    allChecked,
    toggle,
    toggleAll,
    notes,
    setNote,
    decide,
    reviewIds,
    reason,
    reasonError,
    changeReason,
    openReview,
    closeReview,
    submitReview,
    publishedCount,
    closePublished: () => setPublishedCount(null),
    outcome,
    dismissOutcome: () => setOutcome(null),
  };
}
