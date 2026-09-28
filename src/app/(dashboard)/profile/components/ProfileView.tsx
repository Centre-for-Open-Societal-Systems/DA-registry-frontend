"use client";

import { useState } from "react";
import Link from "next/link";
import { Banner } from "@/components/ui/Banner";
import { AgentHeader } from "./AgentHeader";
import { AgentStats } from "./AgentStats";
import { DemographicsSection } from "./DemographicsSection";
import { DependentsSection } from "./DependentsSection";
import { QualificationsSection } from "./QualificationsSection";
import { LeaveSection } from "./LeaveSection";

const BACK_CLASS = "inline-flex w-fit items-center gap-2.5 text-[15px] font-medium text-[#1a2b3c] transition-colors hover:text-brand-green";

const BackIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

// The profile is read-only until the agent clicks "Edit profile", which swaps the page for the demographics form;
// edits are sent to the Woreda supervisor for approval.
export function ProfileView() {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState<string[] | null>(null);

  const startEditing = () => {
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (editing) {
    return (
      <>
        <button type="button" onClick={() => setEditing(false)} className={BACK_CLASS}>
          <BackIcon />
          Back
        </button>
        <DemographicsSection
          editing
          onCancel={() => setEditing(false)}
          onSubmit={(changed) => {
            setPending(changed);
            setEditing(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Link href="/dashboard" className={BACK_CLASS}>
        <BackIcon />
        Back
      </Link>

      <AgentHeader pending={!!pending} onEdit={startEditing} />

      {pending && (
        <Banner tone="success" title="Change submitted for approval" onDismiss={() => setPending(null)}>
          Your update to {pending.join(", ").toLowerCase()} was sent to your Woreda supervisor. Your profile shows the current values until it is approved.
        </Banner>
      )}

      <AgentStats />
      <DemographicsSection editing={false} onCancel={() => setEditing(false)} onSubmit={() => {}} />
      <DependentsSection />
      <QualificationsSection />
      <LeaveSection />
    </>
  );
}
