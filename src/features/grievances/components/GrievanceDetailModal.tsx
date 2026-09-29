"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { buildCase } from "../data";
import type { Grievance, ThreadMessage } from "../types";
import { GrievancePriorityPill, GrievanceStatusPill } from "./GrievancePills";
import { GrievanceThread } from "./GrievanceThread";
import { GrievanceResponsePanel, type DeptResponseInput } from "./GrievanceResponsePanel";
import { GrievanceCaseSidebar } from "./GrievanceCaseSidebar";
import { DeferSlaModal, type DeferralRequest } from "./DeferSlaModal";

const CURRENT_OFFICER = { name: "Tadesse Alemu", role: "Development Agent" };

function nowLabel() {
  const d = new Date();
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ (\w{3}) /, " $1 ");
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

interface GrievanceDetailModalProps {
  grievance: Grievance;
  onClose: () => void;
}

export function GrievanceDetailModal({ grievance, onClose }: GrievanceDetailModalProps) {
  const [data] = useState(() => buildCase(grievance));
  const [thread, setThread] = useState<ThreadMessage[]>(data.thread);
  const [status, setStatus] = useState(grievance.status);
  const [mounted, setMounted] = useState(false);
  const [isDeferOpen, setIsDeferOpen] = useState(false);
  const [pendingDeferral, setPendingDeferral] = useState<{ days: number; approver: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Esc closes the nested Defer SLA dialog first, not the whole case
    if (isDeferOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, isDeferOpen]);

  const deptResponses = thread.filter((m) => m.kind === "dept-response").length;
  const internalNotes = thread.filter((m) => m.kind === "internal-note").length;
  const attachments = thread.reduce((n, m) => n + (m.kind === "submission" ? m.attachments.length : 0), 0);

  const addDeptResponse = (input: DeptResponseInput) => {
    const at = nowLabel();
    const additions: ThreadMessage[] = [
      {
        kind: "dept-response",
        id: `r-${Date.now()}`,
        author: CURRENT_OFFICER.name,
        role: CURRENT_OFFICER.role,
        at,
        responseNo: deptResponses + 1,
        outcome: input.responseType,
        actionTaken: input.actionTaken,
        resolutionSummary: input.resolutionSummary,
        proposedClosure: input.proposedClosure,
      },
    ];
    if (input.internalNote) {
      additions.push({ kind: "internal-note", id: `n-${Date.now()}`, author: CURRENT_OFFICER.name, role: CURRENT_OFFICER.role, at, body: input.internalNote });
    }
    setThread((prev) => [...prev, ...additions]);
  };

  const addNote = (body: string) => {
    setThread((prev) => [
      ...prev,
      { kind: "internal-note", id: `n-${Date.now()}`, author: CURRENT_OFFICER.name, role: CURRENT_OFFICER.role, at: nowLabel(), body },
    ]);
  };

  // Case Management save → log a status-change row when the status actually changed
  const handleAssignmentSaved = (summary: string) => {
    const match = summary.match(/status → ([^·]+)/);
    const next = match?.[1].trim() as Grievance["status"] | undefined;
    if (next && next !== status) {
      setThread((prev) => [
        ...prev,
        { kind: "status-change", id: `s-${Date.now()}`, from: status, to: next, by: CURRENT_OFFICER.name, at: nowLabel().split(",")[0] },
      ]);
      setStatus(next);
    }
  };

  // Defer SLA → log the request as an internal note; SLA card shows it as pending approval
  const handleDeferral = (request: DeferralRequest) => {
    setPendingDeferral({ days: request.days, approver: request.approver.name });
    setThread((prev) => [
      ...prev,
      {
        kind: "internal-note",
        id: `d-${Date.now()}`,
        author: CURRENT_OFFICER.name,
        role: CURRENT_OFFICER.role,
        at: nowLabel(),
        body: `SLA deferral requested (+${request.days} days) — sent to ${request.approver.name} (${request.approver.organisation}) for approval. Reason: ${request.reason}`,
      },
    ]);
    setIsDeferOpen(false);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/40 p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="grievance-title"
        className="my-auto w-full min-w-0 max-w-[1000px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4 sm:gap-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-slate-600">{grievance.ticketId}</span>
              <GrievanceStatusPill status={status} className="px-2.5 py-0.5" />
              <GrievancePriorityPill priority={grievance.priority} className="px-2.5 py-0.5" />
            </div>
            <h2 id="grievance-title" className="mt-2 text-[17px] font-semibold text-ink">{grievance.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="mt-1 shrink-0 rounded-md p-1 text-subtle transition-colors hover:bg-zinc-100 hover:text-ink"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {/* min-w-0 on both columns stops long nowrap content from widening the dialog past the viewport on phones */}
        <div className="grid grid-cols-1 gap-5 bg-surface-alt px-3 py-4 sm:px-6 sm:py-5 lg:grid-cols-[minmax(0,1fr)_280px] [&>*]:min-w-0">
          <div className="flex min-w-0 flex-col gap-5">
            <GrievanceThread messages={thread} />
            <GrievanceResponsePanel onSubmitResponse={addDeptResponse} onAddNote={addNote} />
          </div>
          <GrievanceCaseSidebar
            data={data}
            deptResponses={deptResponses}
            internalNotes={internalNotes}
            attachments={attachments}
            onAssignmentSaved={handleAssignmentSaved}
            pendingDeferral={pendingDeferral}
            onDeferSla={() => setIsDeferOpen(true)}
          />
        </div>
      </div>

      {isDeferOpen && <DeferSlaModal onClose={() => setIsDeferOpen(false)} onSubmit={handleDeferral} />}
    </div>,
    document.body,
  );
}
