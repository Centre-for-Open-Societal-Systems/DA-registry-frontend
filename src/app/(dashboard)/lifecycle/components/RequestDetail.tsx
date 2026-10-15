"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { downloadCsv } from "@/lib/download";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { transitionCopyFor } from "./transitionCopy";
import { SECOND_APPROVER } from "./separation";
import { LIFECYCLE_DA, gradeAndRole, transitionFor, type LifecycleRequest, type LifecycleTransition } from "./lifecycle";
import {
  APPROVER_LINE,
  BELL_ICON,
  CheckList,
  DetailRows,
  ICONS,
  Icon,
  MetaItem,
  ProfileCard,
  RouteList,
  SectionTitle,
  SideCard,
  StatusCard,
  TONES,
  TransitionHeader,
  formatDate,
  formatDateTime,
  summaryRows,
} from "./shared";
import { useLifecycleHistory } from "./useLifecycleHistory";

const APPROVER = LIFECYCLE_DA.approverName.replace(" (Woreda)", "");
const APPROVER_INITIALS = "DT";
const DECISION_DAYS = 3;
/** Two sign-offs take longer. */
const TWO_STEP_DECISION_DAYS = 5;

/** "zone / regional HR" mid-sentence. */
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

const WHILE_YOU_WAIT = [
  "You can withdraw the request while it is pending.",
  "To change details, withdraw it and submit a new request.",
  "Track progress any time in the Approvals queue.",
];

const STATUS_PILL: Record<LifecycleRequest["status"], string> = {
  "Pending approval": "border-warning-border bg-warning-wash text-orange-700",
  Approved: "border-brand-border bg-brand-mint text-brand-green",
  Withdrawn: "border-slate-200 bg-surface text-slate-600",
};

function StatusBadge({ status }: { status: LifecycleRequest["status"] }) {
  return <span className={cn("inline-flex w-fit whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12.5px] font-semibold", STATUS_PILL[status])}>{status}</span>;
}

/** Whole days from today to the ISO date (negative once it has passed). */
const daysUntil = (iso: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(iso);
  day.setHours(0, 0, 0, 0);
  return Math.round((day.getTime() - today.getTime()) / 86_400_000);
};

const countdown = (iso: string) => {
  const d = daysUntil(iso);
  if (d > 1) return `in ${d} days`;
  if (d === 1) return "tomorrow";
  if (d === 0) return "today";
  return `${-d} day${d === -1 ? "" : "s"} ago`;
};

function OutcomeCard({ title, line, note, status }: { title: string; line: string; note?: ReactNode; status: LifecycleRequest["status"] }) {
  const withdrawn = status === "Withdrawn";
  return (
    <Card className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center">
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full border", withdrawn ? "border-slate-200 bg-surface text-slate-600" : "border-brand-border bg-brand-mint text-brand-green")}>
        <Icon d={withdrawn ? ICONS.close : ICONS.check} className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
        <p className="text-[13.5px] text-ink-soft">{line}</p>
        {note && <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-soft">{note}</p>}
      </div>
      <StatusBadge status={status} />
    </Card>
  );
}

function ActionBar({ children }: { children: ReactNode }) {
  return <Card className="flex flex-wrap items-center gap-3 px-5 py-4">{children}</Card>;
}

/** Leave requests go back to the leave history; the rest to the lifecycle overview. */
const LEAVE_HISTORY = "/lifecycle/leave";

const linkButton = "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 text-[14px] font-semibold transition-colors";

// Approver's panel on a pending request. The Woreda approval queue is Admin's in this portal, so Admin decides here.
function DecisionCard({ subtitle, actionLabel, onApprove }: { subtitle: string; actionLabel: string; onApprove: (comment: string) => void }) {
  const [comment, setComment] = useState("");
  return (
    <Card className="p-0">
      <div className="border-b border-line-soft px-5 py-4">
        <SectionTitle title="Your decision" subtitle={subtitle} />
      </div>
      <div className="flex flex-col gap-3 px-5 py-4">
        <FormField label="Comment for the requester" htmlFor="lc-comment">
          <Textarea id="lc-comment" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="e.g. Approved. Please finish the handover before the effective date." />
        </FormField>
        <Button variant="brand" className="w-fit gap-2" onClick={() => onApprove(comment.trim() || "Approved.")}>
          <Icon d={ICONS.check} /> {actionLabel}
        </Button>
      </div>
    </Card>
  );
}

function SubmittedView({ request, transition, onWithdraw, onApprove, canApprove }: { request: LifecycleRequest; transition: LifecycleTransition; onWithdraw: () => void; onApprove: (comment: string) => void; canApprove: boolean }) {
  const form = transitionCopyFor(request.code);
  const submitted = formatDateTime(request.submittedAt);
  const withdrawn = request.status === "Withdrawn";
  // Two-step transitions (separation) go to the Woreda approver first, then to the second approver.
  const second = transition.secondApprover;
  const first = request.firstDecision;
  const waitingOn = !second
    ? `${LIFECYCLE_DA.approver} · usually decided within ${DECISION_DAYS} working days`
    : first
      ? `Second approval: ${lowerFirst(second)}`
      : `First approval: ${APPROVER} · then ${lowerFirst(second)}`;
  const activity = withdrawn
    ? [
        { title: "Request withdrawn", detail: `You · ${formatDateTime(request.decidedAt!)}`, state: "done" as const },
        { title: "Approver notified", detail: `In-app and email · ${submitted}`, state: "done" as const },
        { title: "Request submitted", detail: `You · ${submitted}`, state: "done" as const },
      ]
    : [
        { title: "Waiting for a decision", detail: waitingOn, state: "current" as const },
        ...(first ? [{ title: "First approval", detail: `${APPROVER} · ${formatDateTime(first.at)}`, state: "done" as const }] : []),
        { title: "Approver notified", detail: `In-app and email · ${submitted}`, state: "done" as const },
        { title: "Request submitted", detail: `You · ${submitted}`, state: "done" as const },
      ];

  return (
    <>
      <TransitionHeader
        transition={transition}
        eyebrow={withdrawn ? "Request withdrawn" : "Request submitted"}
        text={withdrawn ? "You withdrew this request before a decision was made." : "Your request is with the approver. You will be notified as soon as it is decided."}
        step={2}
      />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_350px]">
        <div className="flex flex-col gap-4">
          <OutcomeCard
            title={withdrawn ? "Request withdrawn" : "Request submitted for approval"}
            line={`Request ${request.id} · Submitted ${submitted}`}
            note={!withdrawn && (<><Icon d={BELL_ICON} className="h-3.5 w-3.5" /> {second ? `${first ? SECOND_APPROVER.name : APPROVER} has been notified.` : `${APPROVER} has been notified by email and in-app.`}</>)}
            status={request.status}
          />
          <SideCard title="Request details" subtitle="What you submitted">
            <div className="py-2">
              <DetailRows rows={summaryRows(transition, request, request.document)} />
            </div>
          </SideCard>
          {canApprove && !withdrawn && (
            <DecisionCard
              key={first ? "second" : "first"}
              onApprove={onApprove}
              subtitle={
                !second
                  ? "You are signed in as the approver for this request"
                  : first
                    ? `You are signed in as the second approver (${lowerFirst(second)})`
                    : `You are signed in as the first approver. Approving forwards the request to ${lowerFirst(second)}.`
              }
              actionLabel={second && !first ? "Approve and forward" : "Approve request"}
            />
          )}
          <SideCard title="Activity" subtitle="Latest first">
            <RouteList steps={activity} tone={transition.tone} />
          </SideCard>
          <ActionBar>
            {!withdrawn && (
              <button type="button" onClick={onWithdraw} className={cn(linkButton, "border border-red-200 bg-white text-red-700 hover:bg-red-50")}>
                Withdraw request
              </button>
            )}
            <div className="ml-auto flex flex-wrap gap-3">
              <Link href="/lifecycle" className={cn(linkButton, "border border-line bg-white text-ink hover:bg-surface")}>Back to lifecycle</Link>
              {request.code === "LV" ? (
                <Link href={LEAVE_HISTORY} className={cn(linkButton, "bg-brand-green text-white hover:bg-brand-green-dark")}>
                  View leave history <Icon d={ICONS.arrow} />
                </Link>
              ) : (
                <Link href="/approvals" className={cn(linkButton, "bg-brand-green text-white hover:bg-brand-green-dark")}>
                  View in Approvals <Icon d={ICONS.arrow} />
                </Link>
              )}
            </div>
          </ActionBar>
        </div>

        <div className="flex flex-col gap-4">
          <SideCard title="Request status" subtitle="Live status of this request">
            <dl className="flex flex-col gap-3 px-5 py-4">
              <MetaItem label="Request ID">{request.id}</MetaItem>
              <MetaItem label="Status"><StatusBadge status={request.status} /></MetaItem>
              <MetaItem label="Submitted">{submitted}</MetaItem>
              <MetaItem label={second ? "Approvers" : "Approver"}>{second ? `${APPROVER} → ${lowerFirst(second)}` : APPROVER_LINE}</MetaItem>
              <MetaItem label={withdrawn ? "Withdrawn" : "Expected decision"}>{withdrawn ? formatDateTime(request.decidedAt!) : `Within ${second ? TWO_STEP_DECISION_DAYS : DECISION_DAYS} working days`}</MetaItem>
            </dl>
          </SideCard>
          <SideCard title="Approval route" subtitle="Who signs off and when">
            <RouteList
              tone={transition.tone}
              steps={[
                { title: "Initiate", detail: `You · ${formatDate(request.submittedAt)}`, state: "done" },
                ...(second
                  ? [
                      { title: "First approval", detail: first ? `${APPROVER} · ${formatDateTime(first.at)}` : APPROVER_LINE, state: first ? "done" : withdrawn ? "next" : "current" } as const,
                      { title: "Second approval", detail: second.replace(" / ", " or "), state: first && !withdrawn ? "current" : "next" } as const,
                    ]
                  : [{ title: "Review & approve", detail: APPROVER_LINE, state: withdrawn ? "next" : "current" } as const]),
                { title: "Effective", detail: (form?.requestNote ?? form?.effectiveNote)?.(formatDate(request.effective), request) ?? `Takes effect on ${formatDate(request.effective)}.`, state: "next" },
              ]}
            />
          </SideCard>
          {!withdrawn && (
            <SideCard title="While you wait">
              <CheckList items={WHILE_YOU_WAIT} />
            </SideCard>
          )}
        </div>
      </div>
    </>
  );
}

function ApprovedView({ request, transition }: { request: LifecycleRequest; transition: LifecycleTransition }) {
  const form = transitionCopyFor(request.code);
  const tone = TONES[transition.tone];
  const submitted = formatDateTime(request.submittedAt);
  const decided = formatDateTime(request.decidedAt!);
  const effective = formatDate(request.effective);
  const second = transition.secondApprover;
  const first = request.firstDecision;
  const approvedBy = second ? `${APPROVER} → ${SECOND_APPROVER.name}` : `${APPROVER} · ${decided}`;
  const decisions = [
    ...(first ? [{ initials: APPROVER_INITIALS, name: APPROVER, role: LIFECYCLE_DA.approver, at: formatDateTime(first.at), comment: first.comment }] : []),
    second && first
      ? { initials: SECOND_APPROVER.initials, name: SECOND_APPROVER.name, role: SECOND_APPROVER.label, at: decided, comment: request.comment }
      : { initials: APPROVER_INITIALS, name: APPROVER, role: LIFECYCLE_DA.approver, at: decided, comment: request.comment },
  ];

  const exportAudit = () =>
    downloadCsv(`${request.auditId}.csv`, [request], [
      { header: "Audit ID", value: (r) => r.auditId },
      { header: "Request ID", value: (r) => r.id },
      { header: "DA", value: () => LIFECYCLE_DA.name },
      { header: "Action", value: () => `${transition.title} · approved` },
      { header: "From", value: () => transition.from },
      { header: "To", value: (r) => (form ? form.previewAfter(r) : gradeAndRole(r)) },
      { header: "Initiated", value: () => submitted },
      { header: "Approved by", value: () => approvedBy },
      { header: "Effective date", value: () => effective },
      { header: "Reason", value: (r) => r.reason },
      { header: "Approver comment", value: (r) => r.comment ?? "" },
    ]);

  return (
    <>
      <TransitionHeader transition={transition} eyebrow="Request approved" text="The request was approved and is scheduled to take effect." step={3} />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_350px]">
        <div className="flex flex-col gap-4">
          <OutcomeCard title={`${transition.title} approved`} line={`Request ${request.id} · ${second ? `Final approval by ${lowerFirst(second)}` : `Approved by ${APPROVER}`} · ${decided}`} status="Approved" />

          <SideCard title="Status change" subtitle="What changes on the effective date">
            <div className="flex flex-col gap-3 px-5 py-4">
              <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <div className="rounded-lg border border-line bg-surface px-4 py-3">
                  <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted">Current</p>
                  <p className="mt-0.5 text-[15px] font-semibold text-ink">{form?.previewCurrent ?? transition.from}</p>
                </div>
                <Icon d={ICONS.arrow} className={cn("mx-auto h-5 w-5 rotate-90 sm:rotate-0", tone.text)} />
                <div className={cn("rounded-lg border px-4 py-3", tone.card)}>
                  <p className={cn("text-[11.5px] font-semibold uppercase tracking-wide", tone.text)}>After {effective}</p>
                  <p className={cn("mt-0.5 text-[15px] font-semibold", tone.text)}>{form ? form.previewAfter(request) : request.target}</p>
                  <p className="text-[12.5px] text-ink-soft">Scheduled</p>
                </div>
              </div>
              <p className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-mint px-4 py-2.5 text-[14px] font-semibold text-brand-green">
                <Icon d={ICONS.calendar} /> Takes effect on {effective} · {countdown(request.effective)}
              </p>
            </div>
          </SideCard>

          <SideCard title={decisions.length > 1 ? "Approver decisions" : "Approver decision"} subtitle="Comments left with the decision">
            {decisions.map((d) => (
              <div key={d.name} className="flex gap-3 px-5 py-4 [&+div]:border-t [&+div]:border-line-soft">
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold", tone.card, tone.text)}>{d.initials}</span>
                <div>
                  <p className="text-[14px]">
                    <span className="font-semibold text-ink">{d.name}</span>{" "}
                    <span className="text-[12.5px] text-muted">{d.role} · {d.at}</span>
                  </p>
                  <p className="text-[14px] text-ink-soft">{d.comment}</p>
                </div>
              </div>
            ))}
          </SideCard>

          <SideCard title="Audit entry" subtitle="Sealed and stored with the DA record">
            <div className="py-2">
              <DetailRows
                rows={[
                  { label: "Audit ID", value: request.auditId },
                  { label: "Action", value: `${transition.title} · approved` },
                  { label: "Initiated by", value: `You · ${submitted}` },
                  { label: "Approved by", value: approvedBy },
                  { label: "Effective date", value: effective },
                ]}
              />
            </div>
          </SideCard>

          <ActionBar>
            <button type="button" onClick={exportAudit} className={cn(linkButton, "border border-line bg-white text-ink hover:bg-surface")}>
              <Icon d={ICONS.download} /> Export audit entry
            </button>
            <div className="ml-auto flex flex-wrap gap-3">
              {request.code === "LV" ? (
                <>
                  <Link href="/lifecycle" className={cn(linkButton, "border border-line bg-white text-ink hover:bg-surface")}>Back to lifecycle</Link>
                  <Link href={LEAVE_HISTORY} className={cn(linkButton, "bg-brand-green text-white hover:bg-brand-green-dark")}>
                    View leave history <Icon d={ICONS.arrow} />
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/lifecycle#history" className={cn(linkButton, "border border-line bg-white text-ink hover:bg-surface")}>View lifecycle history</Link>
                  <Link href="/lifecycle" className={cn(linkButton, "bg-brand-green text-white hover:bg-brand-green-dark")}>
                    Back to lifecycle <Icon d={ICONS.arrow} />
                  </Link>
                </>
              )}
            </div>
          </ActionBar>
        </div>

        <div className="flex flex-col gap-4">
          <SideCard title="Request status" subtitle="Final status of this request">
            <dl className="flex flex-col gap-3 px-5 py-4">
              <MetaItem label="Request ID">{request.id}</MetaItem>
              <MetaItem label="Status"><StatusBadge status="Approved" /></MetaItem>
              <MetaItem label="Submitted">{submitted}</MetaItem>
              <MetaItem label="Decided">{decided}</MetaItem>
              <MetaItem label="Effective date">{effective}</MetaItem>
            </dl>
          </SideCard>
          <SideCard title="Approval route" subtitle="Who signed off">
            <RouteList
              tone={transition.tone}
              steps={[
                { title: "Initiate", detail: `You · ${submitted}`, state: "done" },
                ...(second && first
                  ? [
                      { title: "First approval", detail: `${APPROVER} · ${formatDateTime(first.at)}`, state: "done" } as const,
                      { title: "Second approval", detail: `${SECOND_APPROVER.name} · ${decided}`, state: "done" } as const,
                    ]
                  : [{ title: "Review & approve", detail: `${APPROVER} · ${decided}`, state: "done" } as const]),
                { title: "Effective", detail: (form?.requestNote ?? form?.effectiveNote)?.(effective, request) ?? `Takes effect on ${effective}.`, state: "current" },
              ]}
            />
          </SideCard>
          {form && (
            <SideCard title="Next steps">
              <CheckList items={form.approvedNext(request)} className={tone.text} />
            </SideCard>
          )}
        </div>
      </div>
    </>
  );
}

// Status page for a submitted Assignment & role request: "submitted" while pending (or withdrawn), "approved" once decided.
export function RequestDetail({ id }: { id: string }) {
  const router = useRouter();
  const request = useLifecycleHistory((s) => s.requests[id]);
  const { approve, withdraw } = useLifecycleHistory();
  const role = useAuthStore((s) => s.role);
  const transition = request && transitionFor(request.code);

  if (!request || !transition) {
    return (
      <div className="flex w-full flex-col gap-4">
        <BackLink href="/lifecycle" />
        <Card className="flex flex-col items-center gap-2 px-5 py-12 text-center">
          <h1 className="text-[18px] font-semibold text-ink">Request {id} not found</h1>
          <p className="max-w-md text-[14px] text-ink-soft">Requests are kept for this browser session only until the lifecycle service is connected. Start a new one from the lifecycle page.</p>
          <Link href="/lifecycle" className={cn(linkButton, "mt-2 bg-brand-green text-white hover:bg-brand-green-dark")}>Back to lifecycle</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href="/lifecycle" />
      <ProfileCard />
      <StatusCard title="Current status" transitionTone={transition.tone} />
      {request.status === "Approved" ? (
        <ApprovedView request={request} transition={transition} />
      ) : (
        <SubmittedView
          request={request}
          transition={transition}
          canApprove={role === "Admin"}
          onApprove={(comment) => approve(id, comment)}
          onWithdraw={() => {
            withdraw(id);
            router.push(request.code === "LV" ? LEAVE_HISTORY : "/lifecycle");
          }}
        />
      )}
    </div>
  );
}
