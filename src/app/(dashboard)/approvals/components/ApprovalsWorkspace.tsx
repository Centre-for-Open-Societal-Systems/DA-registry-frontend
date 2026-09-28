"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dropdown } from "@/components/ui/Dropdown";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import {
  APPROVAL_KEBELES,
  APPROVAL_REQUEST_TONE,
  APPROVAL_REQUESTS,
  APPROVAL_TABS,
  type ApprovalKind,
  type ApprovalRequest,
  type ApprovalRequestStatus,
  type ApprovalTab,
} from "@/features/agents/approvals";

type Decision = "approve" | "changes" | "reject";

const MIN_NOTE = 5;

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

const NEXT_STATUS: Record<Decision, ApprovalRequestStatus> = {
  approve: "Approved",
  changes: "Changes requested",
  reject: "Rejected",
};

// Woreda review of DA self-initiated changes: verify → approve & publish to the master DA Registry.
// Reject and Request changes need a reviewer note; every decision appends to the audit trail.
export function ApprovalsWorkspace() {
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
  const [outcome, setOutcome] = useState<{ tone: "success" | "warning" | "info"; text: string } | null>(null);

  const kinds = APPROVAL_TABS.find((t) => t.key === tab)?.kinds ?? null;
  const list = requests.filter((r) => (!kinds || kinds.includes(r.kind)) && (!kebele || r.kebele === kebele));
  const selected = requests.find((r) => r.id === selectedId) ?? list[0] ?? null;
  const isOpen = (r: ApprovalRequest) => r.status === "Awaiting verification";

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

  const decide = (ids: string[], decision: Decision, note: string) => {
    const status = NEXT_STATUS[decision];
    const step =
      decision === "approve"
        ? { label: "Approved & published", detail: "Published to the master DA Registry (MoA)", at: "Just now", current: true }
        : { label: status, detail: note, at: "Just now", current: true };
    setRequests((prev) =>
      prev.map((r) =>
        ids.includes(r.id) ? { ...r, status, trail: [...r.trail.map((s) => ({ ...s, current: false })), step] } : r,
      ),
    );
    setChecked((prev) => new Set([...prev].filter((id) => !ids.includes(id))));
    if (decision === "approve") {
      setPublishedCount(ids.length);
      return;
    }
    const count = ids.length === 1 ? "1 request" : `${ids.length} requests`;
    setOutcome(
      decision === "changes"
        ? { tone: "warning", text: `Changes requested — ${count} sent back to the agent with your note.` }
        : { tone: "info", text: `${count} rejected. The record and its audit trail are retained.` },
    );
  };

  const openReview = (ids: string[], prefill = "") => {
    setReviewIds(ids);
    setReason(prefill);
    setReasonError(false);
  };

  const closeReview = () => setReviewIds(null);

  const submitReview = (decision: "changes" | "reject") => {
    if (!reviewIds) return;
    if (reason.trim().length < MIN_NOTE) {
      setReasonError(true);
      return;
    }
    decide(reviewIds, decision, reason.trim());
    setReviewIds(null);
  };

  return (
    <>
      {outcome && <Banner tone={outcome.tone} onDismiss={() => setOutcome(null)}>{outcome.text}</Banner>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[350px_1fr]">
        {/* Queue */}
        <Card className="flex flex-col overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
          {/* Bulk actions */}
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <label className="flex items-center gap-2.5 text-[13px] font-semibold text-brand-green">
              <Checkbox
                checked={allChecked}
                disabled={checkable.length === 0}
                aria-label="Select all open requests"
                onChange={() =>
                  setChecked((prev) => {
                    const next = new Set(prev);
                    checkable.forEach((r) => (allChecked ? next.delete(r.id) : next.add(r.id)));
                    return next;
                  })
                }
              />
              <span className={cn(checkedInView.length === 0 && "text-[#64748b]")}>{checkedInView.length} selected</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={checkedInView.length === 0}
                onClick={() => decide(checkedInView.map((r) => r.id), "approve", "")}
                className="h-8 rounded-md bg-brand-green px-3 text-[12.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Approve &amp; publish
              </button>
              <button
                type="button"
                disabled={checkedInView.length === 0}
                onClick={() => openReview(checkedInView.map((r) => r.id))}
                className="h-8 rounded-md border border-[#DC2626] bg-white px-3 text-[12.5px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FFF1F1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>

          {/* Kind tabs */}
          <div role="tablist" className="flex overflow-x-auto border-y border-[#E5E7EB]">
            {APPROVAL_TABS.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "shrink-0 whitespace-nowrap px-4 py-3.5 text-[14px] font-medium transition-colors",
                    active ? "-mb-px border-b-2 border-brand-green bg-[#F0FAF5] text-brand-green" : "text-[#4a5568] hover:text-[#1a2b3c]",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-3">
            <Dropdown
              value={kebele}
              onChange={setKebele}
              options={[{ value: "", label: "All Assigned kebeles" }, ...APPROVAL_KEBELES.map((k) => ({ value: k, label: k }))]}
              className="[&>button]:h-10"
              renderValue={(o) => (
                <span className="flex items-center gap-2 text-[13px] text-[#1a2b3c]">
                  <svg className="h-4 w-4 shrink-0 text-[#475569]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  Assigned kebele: {o.label}
                </span>
              )}
            />
          </div>

          {list.length === 0 ? (
            <EmptyState title="Queue is clear" hint="No requests match this tab and kebele." />
          ) : (
            <ul className="divide-y divide-[#E5E7EB] border-t border-[#E5E7EB]">
              {list.map((r) => {
                const active = selected?.id === r.id;
                return (
                  <li key={r.id} className={cn("flex gap-3 px-4 py-3.5 transition-colors", active ? "bg-[#E6F5EC]" : "hover:bg-[#F8FAFC]")}>
                    <span className="pt-0.5">
                      <Checkbox checked={checked.has(r.id)} disabled={!isOpen(r)} onChange={() => toggle(r.id)} aria-label={`Select ${r.title}`} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wide text-[#475569]">
                          {KIND_ICON[r.kind]}
                          {r.kind}
                        </span>
                        <Pill tone={APPROVAL_REQUEST_TONE[r.status]}>{r.status}</Pill>
                      </span>
                      <span className="mt-1.5 block text-[14px] font-semibold leading-snug text-[#1a2b3c]">{r.title}</span>
                      <span className="mt-1 flex items-center gap-2 text-[12px] text-[#64748b]">
                        Self-initiated <span className="h-1 w-1 rounded-full bg-[#94A3B8]" aria-hidden="true" /> {r.place}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-[#64748b]">{r.submittedAt}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Detail */}
        {selected ? (
          <Card key={selected.id} className="flex animate-fade-in flex-col p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
            <div className="border-b border-[#E5E7EB] px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] uppercase tracking-wide text-[#475569]">DA {selected.kind}</span>
                  <Pill tone={APPROVAL_REQUEST_TONE[selected.status]}>{selected.status}</Pill>
                </div>
                <span className="text-[12px] text-[#475569]">ID: {selected.id}</span>
              </div>
              <h2 className="mt-2.5 text-[20px] font-semibold tracking-tight text-[#1a2b3c]">
                {selected.kind === "Onboarding" ? `DA onboarding - ${selected.data[0].value}` : selected.title}
              </h2>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-[#4a5568]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FDEBD3] text-[10px] font-semibold text-[#C2410C]">{selected.submittedBy.initials}</span>
                Submitted by <span className="font-semibold text-[#1a2b3c]">{selected.submittedBy.name}</span> (Agent ID: {selected.submittedBy.agentId})
                <span className="h-1 w-1 rounded-full bg-[#94A3B8]" aria-hidden="true" />
                {selected.woreda}
              </p>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-6 p-5 md:grid-cols-2">
              <section className="self-start overflow-hidden rounded-lg border border-[#E5E7EB]">
                <h3 className="border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-[14px] font-semibold text-[#1a2b3c]">Submitted data</h3>
                <dl className="divide-y divide-[#E5E7EB]">
                  {selected.data.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3.5 text-[14px]">
                      <dt className="text-[#4a5568]">{row.label}</dt>
                      <dd className={cn("text-right font-semibold", row.verified ? "flex items-center gap-1 text-brand-green" : "text-[#1a2b3c]")}>
                        {row.value}
                        {row.verified && (
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <div className="flex flex-col gap-5">
                <section className="overflow-hidden rounded-lg border border-[#E5E7EB]">
                  <h3 className="border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-[14px] font-semibold text-[#1a2b3c]">Audit trail</h3>
                  <ol className="px-4 py-4">
                    {selected.trail.map((step, i) => {
                      const last = i === selected.trail.length - 1;
                      return (
                        <li key={`${step.label}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                          {!last && <span className="absolute left-[5px] top-4 h-[calc(100%-12px)] w-px bg-[#CBD5E1]" aria-hidden="true" />}
                          <span className={cn("mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-brand-green", step.current ? "bg-brand-green" : "bg-white")} aria-hidden="true" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className={cn("text-[14px] font-semibold", step.current ? "text-brand-green" : "text-[#1a2b3c]")}>{step.label}</p>
                              <span className="shrink-0 text-[12px] text-[#4a5568]">{step.at}</span>
                            </div>
                            <p className="mt-0.5 text-[12.5px] text-[#4a5568]">{step.detail}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>

                <FormField label="Reviewer feedback note" htmlFor="reviewer-note">
                  <Textarea
                    id="reviewer-note"
                    rows={4}
                    value={notes[selected.id] ?? ""}
                    disabled={!isOpen(selected)}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [selected.id]: e.target.value }))}
                    placeholder="Add a note for the agent..."
                    className="bg-[#F8FAFC] disabled:opacity-60"
                  />
                </FormField>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#E5E7EB] px-5 py-4 md:flex-row md:items-center md:justify-between">
              <p className="flex items-center gap-2 text-[13px] text-[#4a5568]">
                <svg className="h-4 w-4 shrink-0 text-[#64748b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
                </svg>
                On approve → Published to the master DA Registry (MoA)
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="dangerOutline" disabled={!isOpen(selected)} onClick={() => openReview([selected.id], notes[selected.id] ?? "")}>
                  Reject
                </Button>
                <button
                  type="button"
                  disabled={!isOpen(selected)}
                  onClick={() => openReview([selected.id], notes[selected.id] ?? "")}
                  className="inline-flex shrink-0 whitespace-nowrap h-10 items-center justify-center rounded-md border border-[#F5C48B] bg-white px-4 text-sm font-semibold text-[#C2410C] transition-colors hover:bg-[#FFF7EB] hover:text-[#C2410C] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Request changes
                </button>
                <Button variant="brand" disabled={!isOpen(selected)} onClick={() => decide([selected.id], "approve", "")}>
                  Approve
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
            <EmptyState title="Select a request" hint="Choose a request from the queue to verify its data and audit trail." />
          </Card>
        )}
      </div>

      {/* Reject / Request changes — reason is mandatory and goes to the applicant + audit trail */}
      <Modal
        isOpen={reviewIds !== null}
        onClose={closeReview}
        title="Record review decision"
        bodyClassName="px-4 py-4 sm:px-6"
        footer={
          <>
            <Button variant="outline" onClick={closeReview} className="sm:mr-auto">
              Cancel
            </Button>
            <Button variant="dangerOutline" onClick={() => submitReview("changes")}>
              Request changes
            </Button>
            <Button variant="danger" onClick={() => submitReview("reject")}>
              Reject
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-[#64748b]">
          Return {reviewIds && reviewIds.length > 1 ? `these ${reviewIds.length} DA submissions to their applicants` : "this DA submission to the applicant"} or reject it. The applicant is notified and the audit trail is updated.
        </p>
        <FormField
          label="Reason (required)"
          htmlFor="review-reason"
          hint={reasonError ? `Enter a reason (at least ${MIN_NOTE} characters).` : undefined}
          hintTone="error"
          className="mt-4 [&>label]:text-[13px] [&>label]:text-[#475569]"
        >
          <Textarea
            id="review-reason"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setReasonError(false);
            }}
            placeholder="e.g. Education certificate unclear — please re-upload."
            className={cn("border-zinc-200", reasonError && "border-[#DC2626]")}
          />
        </FormField>
      </Modal>

      {/* Approve & publish — success confirmation */}
      <Modal
        isOpen={publishedCount !== null}
        onClose={() => setPublishedCount(null)}
        title="Approved & Published"
        hideHeader
        bodyClassName="px-6 pb-6 pt-8"
        footer={
          <>
            <Button variant="outline" onClick={() => setPublishedCount(null)}>
              Close
            </Button>
            <Link
              href="/agents"
              className="inline-flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-brand-green px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark sm:flex-none"
            >
              View in registry
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 animate-check-pop items-center justify-center rounded-full bg-[#E6F7EE] text-brand-green">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <h2 id="modal-title" className="mt-5 text-[20px] font-semibold text-[#1a2b3c]">Approved &amp; Published</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#4a5568]">
            {publishedCount === 1 ? "The selected record has" : `${publishedCount} selected records have`} been approved and published to Ethiopia&apos;s master DA Registry (MoA). Field teams and the Woreda office will see the updated records immediately.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#A7E3C7] bg-[#EBFAF2] px-3.5 py-1 text-[13px] font-semibold text-brand-green">
            <span className="h-2 w-2 rounded-full bg-brand-green" aria-hidden="true" />
            {publishedCount} of {publishedCount} published · 0 failed
          </span>
        </div>
      </Modal>
    </>
  );
}
