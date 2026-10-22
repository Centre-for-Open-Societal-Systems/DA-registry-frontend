"use client";

import type { ReactNode } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { RowAction } from "@/components/ui/RowAction";
import { StatCard } from "@/components/ui/StatCard";
import {
  INCENTIVE_STATUS_TONE,
  MANDATORY_COURSE_COUNT,
  MANDATORY_COURSE_STATUS_TONE,
  type AgentCertificateRecord,
  type AgentTrainingDetail,
} from "@/features/performance";
import { downloadCsv, fileDate, type CsvColumn } from "@/lib/download";
import { cn } from "@/lib/utils";

const CHECK_FILE = "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 15l2 2 4-4";
const CERT = "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h6M14 2v6h6M20 8v3M8 9h2M8 13h6M17 21a3 3 0 100-6 3 3 0 000 6zM15.5 20.5L15 23l2-1 2 1-.5-2.5";
const CALENDAR = "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z";

const SYNC_DATE = "16 Oct 2026";
const SYNC_TIME = "06:00";

function Icon({ d, className = "h-6 w-6" }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const initialsOf = (name: string) => name.split(/\s+/).map((w) => w[0]?.toUpperCase()).join("").slice(0, 2);

function Meta({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-ink">{value}</p>
    </div>
  );
}

const th = "whitespace-nowrap px-5 py-3 font-semibold";

const CERTIFICATE_COLUMNS: CsvColumn<AgentCertificateRecord>[] = [
  { header: "Certificate", value: (c) => c.title },
  { header: "Course code", value: (c) => c.code },
  { header: "Issuer", value: (c) => c.issuer },
  { header: "Issued", value: (c) => c.issuedOn },
  { header: "Credential / reference ID", value: (c) => c.credentialId },
  { header: "Source", value: (c) => c.source },
];

// One agent's mandatory Agrilearn courses and certificates, reached from the Supervisor's compliance table. Read-only.
export function AgentTrainingDetails({ detail }: { detail: AgentTrainingDetail }) {
  const { agent, courses, certificates, outstanding, nextDue } = detail;

  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href="/training" />

      <Card className="px-5 py-4">
        <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-2xl">Agent training &amp; compliance details</h1>
        <p className="mt-1 text-[13.5px] text-ink-soft">Agrilearn-reflected learning and recorded eligibility for one agent.</p>
      </Card>

      <Card className="p-0 shadow-card">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4 border-b border-line px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-green text-[22px] font-semibold text-white">{initialsOf(agent.name)}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-[19px] font-bold text-ink">{agent.name}</h2>
                <Pill tone={INCENTIVE_STATUS_TONE[agent.incentive]}>{agent.incentive}</Pill>
              </div>
              <p className="mt-1 text-[14px] text-ink-soft">{agent.daId}</p>
            </div>
          </div>
          <Meta label="Kebele" value={agent.kebele} />
          <Meta label="Woreda" value={agent.woreda} />
          <Meta label="Last sync" value={`05 Oct 2026, ${SYNC_TIME}`} className="sm:ml-auto sm:text-right" />
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Mandatory completion" value={`${agent.compliance}%`} hint={`${agent.mandatoryDone} of ${MANDATORY_COURSE_COUNT} mandatory courses`} accent="border-l-brand-green" tile="bg-brand-tint text-brand-green" icon={<Icon d={CHECK_FILE} />} />
            <StatCard label="Outstanding courses" value={`${outstanding} / ${MANDATORY_COURSE_COUNT}`} hint={nextDue ? `In progress · due ${nextDue.slice(0, 6)}` : "All mandatory courses complete"} accent="border-l-orange-500" tile="bg-orange-50 text-orange-600" icon={<Icon d={CERT} />} />
            <StatCard label="Certificates" value={String(certificates.length)} hint={`${certificates.length} Agrilearn-auto records`} accent="border-l-blue-600" tile="bg-blue-50 text-blue-600" icon={<Icon d={CHECK_FILE} />} />
            <StatCard label="Last sync / as of" value={SYNC_DATE} hint={`${SYNC_TIME} · Agrilearn reflected data`} accent="border-l-violet-600" tile="bg-violet-50 text-violet-600" icon={<Icon d={CALENDAR} />} />
          </div>

          <Card className="overflow-hidden p-0 shadow-card">
            <div className="px-5 py-4">
              <h2 className="text-[18px] font-semibold text-ink">Mandatory courses</h2>
              <p className="mt-0.5 text-[12.5px] text-ink-soft">Q4 2026 requirements · Illustrative learning records</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-y border-line bg-surface text-[13px] font-semibold text-slate-500">
                    <th className={th}>Course / code</th>
                    <th className={th}>Status</th>
                    <th className={th}>Due date</th>
                    <th className={th}>Progress</th>
                    <th className={th}>Completed</th>
                    <th className={th}>Source</th>
                  </tr>
                </thead>
                <tbody className="text-[14px] text-slate-700">
                  {courses.map((c) => {
                    const pct = Math.round((c.unitsDone / c.unitsTotal) * 100);
                    const complete = c.status === "Complete";
                    return (
                      <tr key={c.code} className={cn("border-b border-line-soft last:border-0", c.status === "In Progress" && "bg-warning-wash/60")}>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-ink">{c.title}</p>
                          <p className="text-[12.5px] text-muted">{c.code}</p>
                        </td>
                        <td className="px-5 py-3.5"><Pill tone={MANDATORY_COURSE_STATUS_TONE[c.status]}>{c.status}</Pill></td>
                        <td className="whitespace-nowrap px-5 py-3.5">{c.dueDate}</td>
                        <td className="px-5 py-3.5">
                          <p className={cn("text-[13px]", !complete && c.unitsDone > 0 && "font-semibold text-amber-700")}>
                            {complete || c.unitsDone === 0 ? `${c.unitsDone} of ${c.unitsTotal} units` : `${pct}% · ${c.unitsDone} of ${c.unitsTotal} units`}
                          </p>
                          <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-line-soft">
                            <div className={cn("h-full rounded-full", complete ? "bg-brand-green" : "bg-amber-700")} style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">{c.completedOn ?? "—"}</td>
                        <td className="px-5 py-3.5">
                          <p>Agrilearn</p>
                          <p className="text-[12.5px] text-muted">Read-only reflection</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden p-0 shadow-card">
            <div className="px-5 py-4">
              <h2 className="text-[18px] font-semibold text-ink">Certificates</h2>
              <p className="mt-0.5 text-[12.5px] text-ink-soft">
                {certificates.length} record{certificates.length === 1 ? "" : "s"} · One certificate for each completed mandatory course · Illustrative learning records
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="border-y border-line bg-surface text-[13px] font-semibold text-slate-500">
                    <th className={th}>Certificate / course</th>
                    <th className={th}>Issuer</th>
                    <th className={th}>Issued</th>
                    <th className={th}>Credential / reference ID</th>
                    <th className={th}>Source</th>
                    <th className={th}>Verification</th>
                    <th className={th}>Expiry</th>
                    <th className={cn(th, "text-center")}>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[14px] text-slate-700">
                  {certificates.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-ink-soft">No certificates yet. One is issued when a mandatory course is completed.</td></tr>
                  )}
                  {certificates.map((c) => (
                    <tr key={c.credentialId} className="border-b border-line-soft last:border-0">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-ink">{c.title}</p>
                        <p className="text-[12.5px] text-muted">{c.code}</p>
                      </td>
                      <td className="px-5 py-3.5">{c.issuer}</td>
                      <td className="whitespace-nowrap px-5 py-3.5">{c.issuedOn}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[13px]">{c.credentialId}</td>
                      <td className="whitespace-nowrap px-5 py-3.5">{c.source}</td>
                      <td className="px-5 py-3.5">
                        <Pill tone="green">Source-issued</Pill>
                        <p className="mt-1 text-[12.5px] text-muted">Auto-synced</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">No expiry</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-3">
                          <RowAction icon="view" onClick={() => downloadCsv(`certificate-${c.credentialId}-${fileDate()}`, [c], CERTIFICATE_COLUMNS)}>View</RowAction>
                          <button
                            type="button"
                            aria-label={`Download ${c.title} certificate`}
                            onClick={() => downloadCsv(`certificate-${c.credentialId}-${fileDate()}`, [c], CERTIFICATE_COLUMNS)}
                            className="text-brand-green transition-colors hover:text-brand-green-dark"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}
