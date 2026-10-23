"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { type PillTone } from "@/components/ui/Pill";
import { SearchInput } from "@/components/ui/SearchInput";
import { TablePagination, usePagination } from "@/components/ui/TablePagination";
import { matchesQuery } from "@/lib/search";
import { cn } from "@/lib/utils";
import { HistoryCard, SnapshotCard, StepsCard } from "./LifecycleWorkspace";
import { LIFECYCLE_DA, reviewStage, transitionFor, type LifecycleRequest, type ReviewStage } from "./lifecycle";
import { ICONS, Icon, ProfileCard, SectionTitle, StatusCard, StatusPill, TONES, destination, formatDate, formatDateTime } from "./shared";
import { useLifecycleHistory } from "./useLifecycleHistory";

type ReviewerRole = "Supervisor" | "Admin";

export const STAGE_TONE: Record<ReviewStage, PillTone> = {
  "Awaiting Supervisor": "amber",
  "Awaiting Admin": "blue",
  Approved: "green",
  Rejected: "red",
  Withdrawn: "slate",
};

const STAGE_CHIP: Record<ReviewStage, string> = {
  "Awaiting Supervisor": "border-warning-border bg-warning-wash text-orange-700",
  "Awaiting Admin": "border-blue-200 bg-blue-50 text-blue-700",
  Approved: "border-brand-border bg-brand-mint text-brand-green",
  Rejected: "border-danger-border bg-danger-wash text-danger",
  Withdrawn: "border-slate-200 bg-surface text-slate-600",
};

interface RequestFilter {
  label: string;
  stages: ReviewStage[] | null;
}

// A DA raises a request, the Supervisor reviews and forwards it, and the Admin gives the final approval.
// Each role opens on the stage it has to act on.
const FILTERS: Record<ReviewerRole, RequestFilter[]> = {
  Supervisor: [
    { label: "Awaiting my review", stages: ["Awaiting Supervisor"] },
    { label: "Forwarded to Admin", stages: ["Awaiting Admin"] },
    { label: "Approved", stages: ["Approved"] },
    { label: "Rejected", stages: ["Rejected"] },
    { label: "All", stages: null },
  ],
  Admin: [
    { label: "Awaiting my approval", stages: ["Awaiting Admin"] },
    { label: "With Supervisor", stages: ["Awaiting Supervisor"] },
    { label: "Approved", stages: ["Approved"] },
    { label: "Rejected", stages: ["Rejected"] },
    { label: "All", stages: null },
  ],
};

const ACTION_STAGE: Record<ReviewerRole, ReviewStage> = { Supervisor: "Awaiting Supervisor", Admin: "Awaiting Admin" };

// One request per row so a long queue stays short on the page; the whole row opens the request.
function RequestRow({ request, role }: { request: LifecycleRequest; role: ReviewerRole }) {
  const transition = transitionFor(request.code);
  if (!transition) return null;
  const tone = TONES[transition.tone];
  const stage = reviewStage(request);
  const needsMe = stage === ACTION_STAGE[role];
  return (
    <li className="[&+li]:border-t [&+li]:border-line-soft">
      <Link href={`/lifecycle/requests/${request.id}`} className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors hover:bg-surface md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_auto_auto]">
        <span className="flex min-w-0 items-center gap-3 md:col-span-1">
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[12px] font-bold", tone.card, tone.code)}>{transition.code}</span>
          <span className="min-w-0">
            <span className="block truncate text-[14.5px] font-semibold text-ink">{transition.title}</span>
            <span className="block text-[12.5px] text-muted">{request.id}</span>
          </span>
        </span>
        <span className="min-w-0 md:col-span-1">
          <span className="block truncate text-[13.5px] text-ink-soft">
            {transition.from} → {destination(transition, request)}
          </span>
          <span className="block truncate text-[12.5px] text-muted">
            Effective {formatDate(request.effective)} · Submitted {formatDateTime(request.submittedAt)}
          </span>
        </span>
        <span className={cn("inline-flex w-fit items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12.5px] font-semibold", STAGE_CHIP[stage])}>{stage}</span>
        <span
          className={cn(
            "inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-4 text-[13.5px] font-semibold",
            needsMe ? "border-brand-green bg-brand-green text-white" : "border-line bg-white text-ink"
          )}
        >
          {needsMe ? "Review" : "View"} <Icon d={ICONS.arrow} />
        </span>
      </Link>
    </li>
  );
}

// Search and paging live here, keyed by the chosen filter, so each filter starts on page 1.
function RequestList({ requests, role }: { requests: LifecycleRequest[]; role: ReviewerRole }) {
  const [query, setQuery] = useState("");
  const matching = requests.filter((r) => matchesQuery(query, r.id, r.code, transitionFor(r.code)?.title, r.target, reviewStage(r)));
  const { pageRows, paginationProps } = usePagination(matching);

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-5 pb-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by request ID or transition" />
        {query.trim() && <span className="whitespace-nowrap text-[12.5px] text-muted">{matching.length} of {requests.length}</span>}
      </div>
      {pageRows.length > 0 ? (
        <ul className="border-t border-line-soft">
          {pageRows.map((r) => (
            <RequestRow key={r.id} request={r} role={role} />
          ))}
        </ul>
      ) : (
        <p className="border-t border-line-soft px-5 py-8 text-center text-[13.5px] text-muted">{query.trim() ? "No requests match your search." : "No requests at this stage right now."}</p>
      )}
      <TablePagination {...paginationProps} itemLabel="requests" />
    </>
  );
}

function RequestsCard({ requests, role }: { requests: LifecycleRequest[]; role: ReviewerRole }) {
  const filters = FILTERS[role];
  const [filter, setFilter] = useState(filters[0].label);
  const count = (f: RequestFilter) => (f.stages ? requests.filter((r) => f.stages!.includes(reviewStage(r))).length : requests.length);
  const active = filters.find((f) => f.label === filter) ?? filters[0];
  const shown = active.stages ? requests.filter((r) => active.stages!.includes(reviewStage(r))) : requests;

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 px-5 pt-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionTitle
          title="Lifecycle requests"
          subtitle={role === "Admin" ? "Requests the Supervisor has forwarded wait here for your final approval." : "Requests raised by DAs wait here for your review before they go to the Admin."}
        />
        <div className="flex shrink-0 items-center gap-2 text-[13px] text-ink-soft">
          Current status <StatusPill>{LIFECYCLE_DA.status}</StatusPill>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-5 pb-3 pt-3">
        {filters.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setFilter(f.label)}
            className={cn(
              "rounded-full border px-3 py-1 text-[13px] font-medium transition-colors",
              active.label === f.label ? "border-brand-green-bright bg-brand-green-bright text-white" : "border-line bg-white text-ink-soft hover:bg-surface"
            )}
          >
            {f.label} · {count(f)}
          </button>
        ))}
      </div>
      <RequestList key={active.label} requests={shown} role={role} />
    </Card>
  );
}

// Same page as the DA's lifecycle overview, with the requests to review in place of the transitions to initiate.
export function ReviewWorkspace({ role }: { role: ReviewerRole }) {
  const events = useLifecycleHistory((s) => s.events);
  const requests = Object.values(useLifecycleHistory((s) => s.requests)).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <div className="flex w-full flex-col gap-4">
      <ProfileCard />
      <StatusCard />
      <RequestsCard requests={requests} role={role} />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_340px]">
        <div id="history" className="scroll-mt-4">
          <HistoryCard events={events} />
        </div>
        <div className="flex flex-col gap-4">
          <SnapshotCard transitionCount={events.filter((e) => e.status === "Approved").length} />
          <StepsCard />
        </div>
      </div>
    </div>
  );
}
