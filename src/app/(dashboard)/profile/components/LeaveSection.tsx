"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill, type PillTone } from "@/components/ui/Pill";
import { StatCard } from "@/components/ui/StatCard";
import { LEAVE_BALANCES, LEAVE_HISTORY, LEAVE_YEAR, type LeaveRecord, type LeaveStatus } from "@/features/farmers";
import { RequestLeaveModal } from "./RequestLeaveModal";

const STATUS_TONES: Record<LeaveStatus, PillTone> = {
  Pending: "amber",
  Approved: "green",
  Taken: "slate",
};

// Icon tile colours per leave type, matching each balance's accent bar.
const TILES: Record<string, string> = {
  "Annual leave": "bg-brand-tint text-brand-green",
  "Sick leave": "bg-danger-wash text-danger",
  "Other / statutory": "bg-info-tint text-blue-600",
};

const COLUMNS: Column<LeaveRecord>[] = [
  { key: "type", header: "Type", cell: (row) => row.type },
  { key: "period", header: "From – To", cell: (row) => row.period },
  { key: "days", header: "Days", cell: (row) => row.days },
  { key: "status", header: "Status", cell: (row) => <Pill tone={STATUS_TONES[row.status]}>{row.status}</Pill> },
];

const calendarIcon = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

export function LeaveSection() {
  const [history, setHistory] = useState<LeaveRecord[]>(LEAVE_HISTORY);
  const [isRequesting, setIsRequesting] = useState(false);

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

      <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-3">
        {LEAVE_BALANCES.map((b) => {
          const remaining = b.entitlement - b.used;
          return (
            <StatCard
              key={b.type}
              label={b.type}
              value={`${remaining} days`}
              hint={`of ${b.entitlement} left · ${b.used} used`}
              accent={b.accent}
              tile={TILES[b.type] ?? "bg-slate-100 text-slate-600"}
              icon={calendarIcon}
            />
          );
        })}
      </div>

      <div className="border-t border-line px-5 py-3.5">
        <h3 className="text-[14px] font-semibold text-ink">Leave history &amp; upcoming</h3>
      </div>
      <DataTable
        columns={COLUMNS}
        rows={history}
        rowKey={(row) => row.id}
        minWidth="640px"
        itemLabel="leave records"
        emptyTitle="No leave recorded"
        emptyHint="Requests you submit appear here."
      />
      <RequestLeaveModal isOpen={isRequesting} onClose={() => setIsRequesting(false)} onSubmit={handleRequest} />
    </Card>
  );
}
