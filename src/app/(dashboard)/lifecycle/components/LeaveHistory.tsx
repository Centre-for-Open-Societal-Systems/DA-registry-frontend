"use client";

import Link from "next/link";
import { useState } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { Pill, type PillTone } from "@/components/ui/Pill";
import { SearchInput } from "@/components/ui/SearchInput";
import { downloadCsv, fileDate } from "@/lib/download";
import { BalanceBar } from "./LeaveForm";
import { LEAVE_TYPES, LEAVE_YEAR, dateRange, leaveBalance, leaveRecords, type LeaveRecord, type LeaveStatus } from "./leave";
import { LIFECYCLE_DA, formatDate } from "./lifecycle";
import { DetailRows, ICONS, Icon, ProfileCard, SectionTitle, StatusCard } from "./shared";
import { useLifecycleHistory } from "./useLifecycleHistory";

const STATUS_TONE: Record<LeaveStatus, PillTone> = { "Pending approval": "amber", Approved: "green", Completed: "slate", Rejected: "red", Withdrawn: "slate" };
const STATUSES = Object.keys(STATUS_TONE) as LeaveStatus[];

function StatTile({ label, value, unit, note, children }: { label: string; value: number; unit?: string; note: string; children?: React.ReactNode }) {
  return (
    <Card className="flex flex-col gap-1.5 px-5 py-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-bold leading-none text-ink">{value}</span>
        {unit && <span className="text-[14px] text-ink-soft">{unit}</span>}
      </p>
      <p className="text-[13px] text-ink-soft">{note}</p>
      {children}
    </Card>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={["All", ...options]}
      align="right"
      className="sm:w-auto [&>button]:h-10 [&>button]:rounded-lg [&>button]:border-zinc-200"
      renderValue={(o) => <span className="whitespace-nowrap pr-1 text-[13.5px] text-ink">{label}: {o.label}</span>}
    />
  );
}

// Leave and suspension requests for the DA: balances, then every request (this session's first) with filters.
export function LeaveHistory() {
  const requests = Object.values(useLifecycleHistory((s) => s.requests));
  const records = leaveRecords(requests);
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("All");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [viewing, setViewing] = useState<LeaveRecord | null>(null);

  const annual = leaveBalance("Annual leave", requests)!;
  const sick = leaveBalance("Sick leave", requests)!;
  const pendingAnnual = records.some((r) => r.hasPage && r.type === "Annual leave" && r.status === "Pending approval");
  const taken = records.filter((r) => r.status === "Completed" && r.start.startsWith(String(LEAVE_YEAR)));
  const takenBy = (t: string) => taken.filter((r) => r.type === t).reduce((sum, r) => sum + r.days, 0);
  const takenTypes = [...new Set(taken.map((r) => r.type))];
  const pending = records.filter((r) => r.status === "Pending approval");

  const years = [...new Set(records.map((r) => r.start.slice(0, 4)))];
  const shown = records.filter(
    (r) =>
      r.id.toLowerCase().includes(query.trim().toLowerCase()) &&
      (year === "All" || r.start.startsWith(year)) &&
      (type === "All" || r.type === type) &&
      (status === "All" || r.status === status)
  );

  const exportCsv = () =>
    downloadCsv(`leave-history-${LIFECYCLE_DA.name.toLowerCase().replace(/\s+/g, "-")}-${fileDate()}.csv`, shown, [
      { header: "Request ID", value: (r) => r.id },
      { header: "Type", value: (r) => r.type },
      { header: "Start", value: (r) => formatDate(r.start) },
      { header: "End", value: (r) => formatDate(r.end) },
      { header: "Working days", value: (r) => String(r.days) },
      { header: "Status", value: (r) => r.status },
      { header: "Approver", value: (r) => r.approver },
      { header: "Submitted", value: (r) => formatDate(r.submitted) },
      { header: "Reason", value: (r) => r.reason },
    ]);

  const viewClass = "inline-flex items-center gap-1 whitespace-nowrap text-[14px] font-semibold text-brand-green hover:underline";
  const columns: Column<LeaveRecord>[] = [
    { key: "id", header: "Request ID", cell: (r) => <span className="font-semibold text-ink">{r.id}</span> },
    { key: "type", header: "Type", cell: (r) => r.type },
    { key: "dates", header: "Dates", cell: (r) => <span className="whitespace-nowrap">{dateRange(r.start, r.end)}</span> },
    { key: "days", header: "Days", cell: (r) => r.days },
    { key: "status", header: "Status", cell: (r) => <Pill tone={STATUS_TONE[r.status]} className="px-2.5 py-0.5">{r.status}</Pill> },
    { key: "approver", header: "Approver", cell: (r) => <span className="whitespace-nowrap">{r.approver}</span> },
    { key: "submitted", header: "Submitted", cell: (r) => <span className="whitespace-nowrap">{formatDate(r.submitted)}</span> },
    {
      key: "view",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (r) =>
        r.hasPage ? (
          <Link href={`/lifecycle/requests/${r.id}`} className={viewClass}>View <Icon d={ICONS.arrow} className="h-3.5 w-3.5" /></Link>
        ) : (
          <button type="button" onClick={() => setViewing(r)} className={viewClass}>View <Icon d={ICONS.arrow} className="h-3.5 w-3.5" /></button>
        ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href="/lifecycle" />
      <ProfileCard />
      <StatusCard title="Current status" transitionTone="amber" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-ink">Leave history</h2>
          <p className="text-[13.5px] text-ink-soft">All leave and suspension requests for {LIFECYCLE_DA.name}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportCsv} className="gap-2">
            <Icon d={ICONS.download} /> Export CSV
          </Button>
          <Link href="/lifecycle/initiate/leave" className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-green px-4 text-[14px] font-semibold text-white transition-colors hover:bg-brand-green-dark">
            <Icon d="M12 5v14M5 12h14" /> Request leave
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Annual leave left" value={annual.left} unit="days" note={`of ${annual.total} days · ${pendingAnnual ? "after the pending request" : `${annual.taken} days used`}`}>
          <div className="mt-1 w-2/3"><BalanceBar total={annual.total} taken={annual.taken} held={annual.held} /></div>
        </StatTile>
        <StatTile label="Sick leave left" value={sick.left} unit="days" note={`of ${sick.total} days · ${sick.taken} days used`} />
        <StatTile
          label={`Days taken in ${LEAVE_YEAR}`}
          value={taken.reduce((sum, r) => sum + r.days, 0)}
          unit="days"
          note={takenTypes.map((t) => `${takenBy(t)} ${t.replace(" leave", "").toLowerCase()}`).join(" · ") || "No leave taken yet"}
        />
        <StatTile
          label="Pending requests"
          value={pending.length}
          note={pending.length === 0 ? "Nothing awaiting approval" : pending.length === 1 ? `${pending[0].id} is awaiting approval` : `${pending.length} requests awaiting approval`}
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <SectionTitle title="Leave requests" subtitle="Newest first" />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <SearchInput value={query} onChange={setQuery} placeholder="Search by request ID" className="sm:[&_input]:w-[180px]" />
            <FilterSelect label="Year" value={year} onChange={setYear} options={years} />
            <FilterSelect label="Type" value={type} onChange={setType} options={LEAVE_TYPES} />
            <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUSES} />
          </div>
        </div>
        <DataTable columns={columns} rows={shown} rowKey={(r) => r.id} itemLabel="requests" minWidth="960px" emptyTitle="No leave requests match these filters" emptyHint="Clear a filter or search for another request ID." />
      </Card>

      {viewing && (
        <Modal
          isOpen
          onClose={() => setViewing(null)}
          title={`${viewing.type} · ${viewing.id}`}
          subtitle={`${dateRange(viewing.start, viewing.end, true)} · ${viewing.days} working days`}
          size="lg"
          bodyClassName="p-4 sm:px-6 sm:py-5"
          footer={<Button variant="outline" onClick={() => setViewing(null)}>Close</Button>}
        >
          <DetailRows
            boxed
            rows={[
              { label: "Status", value: <Pill tone={STATUS_TONE[viewing.status]} className="px-2.5 py-0.5">{viewing.status}</Pill> },
              { label: "Reason", value: viewing.reason },
              { label: "Approver", value: viewing.approver },
              { label: "Submitted", value: formatDate(viewing.submitted) },
            ]}
          />
        </Modal>
      )}
    </div>
  );
}
