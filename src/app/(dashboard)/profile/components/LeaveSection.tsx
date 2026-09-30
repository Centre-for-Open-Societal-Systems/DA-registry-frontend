"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill, type PillTone } from "@/components/ui/Pill";
import { LEAVE_BALANCES, LEAVE_HISTORY, LEAVE_YEAR, type LeaveBalance, type LeaveRecord, type LeaveStatus } from "@/features/farmers";
import { cn } from "@/lib/utils";
import { RequestLeaveModal } from "./RequestLeaveModal";

const STATUS_TONES: Record<LeaveStatus, PillTone> = {
  Pending: "amber",
  Approved: "green",
  Taken: "blue",
};

// Leave balance card with a tinted panel, accent bar and remaining-days progress, per the profile mockup.
function BalanceCard({ balance }: { balance: LeaveBalance }) {
  const remaining = balance.entitlement - balance.used;
  const pct = balance.entitlement ? (remaining / balance.entitlement) * 100 : 0;
  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border border-l-4 px-3 py-3", balance.tint, balance.accent)}>
      <p className="text-[13px] font-medium text-ink">{balance.type}</p>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-[13px] text-ink-soft">
          <span className="mr-1 text-[22px] font-semibold leading-none text-ink">{remaining}</span>
          of {balance.entitlement} days left
        </p>
        <p className="text-[12.5px] text-ink-soft">{balance.used} used · {remaining} remaining</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={remaining} aria-valuemin={0} aria-valuemax={balance.entitlement} aria-label={`${balance.type} remaining`}>
        <div className={cn("h-full rounded-full", balance.bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function LeaveSection() {
  const [history, setHistory] = useState<LeaveRecord[]>(LEAVE_HISTORY);
  const [isRequesting, setIsRequesting] = useState(false);

  const columns: Column<LeaveRecord>[] = [
    { key: "sno", header: "S.No.", align: "center", className: "w-16", cell: (row) => history.indexOf(row) + 1 },
    { key: "type", header: "Leave Type", cell: (row) => row.type },
    { key: "period", header: "From - To", cell: (row) => row.period },
    { key: "days", header: "Days", align: "center", cell: (row) => row.days },
    { key: "status", header: "Status", cell: (row) => <Pill tone={STATUS_TONES[row.status]}>{row.status}</Pill> },
    { key: "message", header: "Message", cell: (row) => <span className="text-ink-soft">{row.message ?? "—"}</span> },
  ];

  // Requests sit at the top as Pending until the Woreda supervisor decides
  const handleRequest = (req: Omit<LeaveRecord, "id" | "status">) => {
    setHistory((prev) => [{ id: `${Date.now()}`, ...req, status: "Pending" }, ...prev]);
  };

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">Leave &amp; absence <Pill tone="slate">Part 2 preview</Pill></h2>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            Your leave entitlement and balance for {LEAVE_YEAR}. Requests are approved by your Woreda supervisor.
          </p>
        </div>
        <Button type="button" variant="brand" size="md" onClick={() => setIsRequesting(true)} className="w-fit shrink-0 gap-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Request leave
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 px-5 pt-5 md:grid-cols-3">
        {LEAVE_BALANCES.map((b) => (
          <BalanceCard key={b.type} balance={b} />
        ))}
      </div>

      <div className="flex flex-col gap-3 px-5 py-5">
        <h3 className="text-[14px] font-semibold text-ink">Leave history &amp; upcoming</h3>
        <div className="overflow-hidden rounded-lg border border-line [&_thead_tr]:border-t-0">
          <DataTable
            columns={columns}
            rows={history}
            rowKey={(row) => row.id}
            minWidth="760px"
            itemLabel="leave records"
            emptyTitle="No leave recorded"
            emptyHint="Requests you submit appear here."
          />
        </div>
      </div>
      <RequestLeaveModal isOpen={isRequesting} onClose={() => setIsRequesting(false)} onSubmit={handleRequest} />
    </Card>
  );
}
