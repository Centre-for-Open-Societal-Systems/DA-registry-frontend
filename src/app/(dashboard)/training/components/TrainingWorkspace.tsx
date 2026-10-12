"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import { COURSES, UPCOMING_SESSIONS, isEarnedCertificate, useCertificatesStore } from "@/features/performance";
import { TrainingStats } from "./TrainingStats";
import { CoursesTable } from "./CoursesTable";
import { IncentiveEligibility } from "./IncentiveEligibility";
import { TrainingCalendar } from "./TrainingCalendar";
import { CertificatesTable } from "./CertificatesTable";

export type TrainingTab = "courses" | "calendar" | "certificates";

// DA training & certification: Agrilearn courses, the session calendar and earned certificates.
export function TrainingWorkspace({ initialTab = "courses" }: { initialTab?: TrainingTab }) {
  const [tab, setTab] = useState<TrainingTab>(initialTab);
  const earnedCertificates = useCertificatesStore((s) => s.rows.filter(isEarnedCertificate).length);

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="Training & certification"
        description="Your Agrilearn courses, certificates and upcoming training sessions."
        tabBar={
          <SegmentTabs<TrainingTab>
            label="Training sections"
            tabs={[
              { key: "courses", label: "Courses" },
              { key: "calendar", label: "Calendar" },
              { key: "certificates", label: "Certificates" },
            ]}
            active={tab}
            onChange={setTab}
          />
        }
      />

      <TrainingStats courses={COURSES} certificates={earnedCertificates} sessions={UPCOMING_SESSIONS.length} />

      {tab === "courses" && (
        <>
          <CoursesTable courses={COURSES} />
          <IncentiveEligibility />
        </>
      )}
      {tab === "calendar" && (
        <>
          <TrainingCalendar sessions={UPCOMING_SESSIONS} />
          <IncentiveEligibility />
        </>
      )}
      {tab === "certificates" && <CertificatesTable />}
    </div>
  );
}
