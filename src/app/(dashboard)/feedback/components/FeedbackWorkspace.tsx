"use client";

import { useState } from "react";
import { SAMPLE_ISSUES, type Issue } from "../types";
import { NewIssueForm, type NewIssueInput } from "./NewIssueForm";
import { SubmittedIssues } from "./SubmittedIssues";
import { IssueLifecycle } from "./IssueLifecycle";
import { IssueSubmittedModal } from "./IssueSubmittedModal";

const SUPERVISOR_NAME = "Kebede Alemu";

export function FeedbackWorkspace() {
  const [issues, setIssues] = useState<Issue[]>(SAMPLE_ISSUES);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = (input: NewIssueInput) => {
    // Next ID continues from the highest existing ticket number
    const maxId = Math.max(...issues.map((i) => Number(i.id.replace("ISS-", "")) || 0));
    const id = `ISS-${maxId + 1}`;
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

    const issue: Issue = {
      id,
      ...input,
      status: isOffline ? "Queued (offline)" : "Submitted",
      submittedLabel: "just now",
      note: isOffline ? "On this device · not yet sent" : "Awaiting triage",
    };
    setIssues((prev) => [issue, ...prev]);
    if (!isOffline) setSubmittedId(id);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[440px_1fr]">
        <NewIssueForm onSubmit={handleSubmit} />
        <div className="flex flex-col gap-5">
          <SubmittedIssues issues={issues} />
          <IssueLifecycle />
        </div>
      </div>

      <IssueSubmittedModal issueId={submittedId} supervisorName={SUPERVISOR_NAME} onClose={() => setSubmittedId(null)} />
    </>
  );
}
