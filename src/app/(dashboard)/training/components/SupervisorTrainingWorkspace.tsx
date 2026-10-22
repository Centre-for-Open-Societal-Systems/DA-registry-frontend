"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import { StatCard } from "@/components/ui/StatCard";
import { AGRILEARN_URL, COURSES, INCENTIVE_CRITERIA, TEAM_COMPLIANCE, UPCOMING_SESSIONS } from "@/features/performance";
import { CoursesTable } from "./CoursesTable";
import { TeamComplianceTable } from "./TeamComplianceTable";
import { TrainingCalendar } from "./TrainingCalendar";

type SupervisorTab = "compliance" | "courses" | "calendar";

const CHECK_FILE = "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 15l2 2 4-4";
const CERT = "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h6M14 2v6h6M20 8v3M8 9h2M8 13h6M17 21a3 3 0 100-6 3 3 0 000 6zM15.5 20.5L15 23l2-1 2 1-.5-2.5";
const CERT_FILE = "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 15l2 2 4-4";
const CAP = "M22 10L12 5 2 10l10 5 10-5zM6 12v5c3 2 9 2 12 0v-5";
const CALENDAR = "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z";

function Icon({ d }: { d: string }) {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function TeamIncentiveEligibility() {
  return (
    <Card className="p-0 shadow-card">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-[18px] font-semibold text-ink">Incentive eligibility</h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          Each agent&apos;s eligibility combines their KPI scorecard with Agrilearn training compliance. The incentive itself is paid through the external MoA scheme.
        </p>
      </div>
      <ul className="flex flex-col gap-4 px-5 py-5">
        {INCENTIVE_CRITERIA.map((c) => (
          <li key={c.title} className="flex gap-4">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-green text-white" aria-hidden="true">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
            </span>
            <div>
              <p className="text-[15.5px] font-semibold text-ink">{c.title}</p>
              <p className="mt-0.5 text-[14.5px] text-ink-soft">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// Supervisor's Training & certification: team compliance, the course catalogue and the session calendar.
export function SupervisorTrainingWorkspace() {
  const [tab, setTab] = useState<SupervisorTab>("compliance");

  const agents = TEAM_COMPLIANCE.length;
  const compliance = Math.round(TEAM_COMPLIANCE.reduce((sum, r) => sum + r.compliance, 0) / agents);
  const eligible = TEAM_COMPLIANCE.filter((r) => r.incentive === "Eligible").length;
  const certificates = TEAM_COMPLIANCE.reduce((sum, r) => sum + r.certificates, 0);
  const mandatory = COURSES.filter((c) => c.mandatory);
  const mandatoryDone = mandatory.filter((c) => c.status === "Completed").length;
  const coursesDone = COURSES.filter((c) => c.status === "Completed").length;

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="Training & certification"
        description="Agrilearn-reflected learning, mandatory-course compliance across your agents, and the training calendar."
        actions={
          <a
            href={AGRILEARN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md bg-brand-green px-4 text-[14px] font-semibold text-white transition-colors hover:bg-brand-green-dark"
          >
            Open Agrilearn
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tab === "calendar" ? (
          <>
            <StatCard label="Course Completed" value={`${coursesDone}/${COURSES.length}`} hint="Agrilearn record" accent="border-l-brand-green" tile="bg-brand-tint text-brand-green" icon={<Icon d={CAP} />} />
            <StatCard label="Mandatory compliance" value={`${Math.round((mandatoryDone / mandatory.length) * 100)}%`} hint={`${mandatoryDone} of ${mandatory.length} mandatory courses`} accent="border-l-blue-600" tile="bg-blue-50 text-blue-600" icon={<Icon d={CERT_FILE} />} />
            <StatCard label="Certificates" value={String(certificates)} hint="Agrilearn-auto, verified" accent="border-l-orange-500" tile="bg-orange-50 text-orange-600" icon={<Icon d={CERT} />} />
            <StatCard label="Upcoming sessions" value={String(UPCOMING_SESSIONS.length)} hint="Next 90 days" accent="border-l-violet-600" tile="bg-violet-50 text-violet-600" icon={<Icon d={CALENDAR} />} />
          </>
        ) : (
          <>
            <StatCard label="Team compliance" value={`${compliance}%`} hint="Mandatory courses completed" accent="border-l-brand-green" tile="bg-brand-tint text-brand-green" icon={<Icon d={CHECK_FILE} />} />
            <StatCard label="Incentive eligible" value={`${eligible} / ${agents}`} hint="Agents meeting training criteria" accent="border-l-orange-500" tile="bg-orange-50 text-orange-600" icon={<Icon d={CERT} />} />
            <StatCard label="Certificates" value={String(certificates)} hint="Agrilearn-auto, verified" accent="border-l-blue-600" tile="bg-blue-50 text-blue-600" icon={<Icon d={CERT_FILE} />} />
            <StatCard label="Upcoming sessions" value={String(UPCOMING_SESSIONS.length)} hint="Next 90 days" accent="border-l-violet-600" tile="bg-violet-50 text-violet-600" icon={<Icon d={CALENDAR} />} />
          </>
        )}
      </div>

      <Card className="overflow-hidden p-0 shadow-card">
        <SegmentTabs<SupervisorTab>
          label="Training sections"
          className="rounded-none border-0 border-b shadow-none"
          tabs={[
            { key: "compliance", label: "Compliance" },
            { key: "courses", label: "Course" },
            { key: "calendar", label: "Calendar" },
          ]}
          active={tab}
          onChange={setTab}
        />
        <div className="flex flex-col gap-4 p-4">
          {tab === "compliance" && (
            <>
              <TeamComplianceTable />
              <TeamIncentiveEligibility />
            </>
          )}
          {tab === "courses" && (
            <>
              <CoursesTable courses={COURSES} exportable />
              <TeamIncentiveEligibility />
            </>
          )}
          {tab === "calendar" && (
            <>
              <TrainingCalendar sessions={UPCOMING_SESSIONS} />
              <TeamIncentiveEligibility />
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
