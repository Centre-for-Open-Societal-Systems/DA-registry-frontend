"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { BackLink } from "@/components/ui/BackLink";
import { useSurveyTemplatesStore } from "@/features/surveys";
import { SurveyCapture } from "./SurveyCapture";

// Surveys published from a Supervisor's template live in the client store, not the seeded list the server reads.
export function CreatedSurveyCapture({ id }: { id: string }) {
  const task = useSurveyTemplatesStore((s) => s.created.find((t) => t.id === id));
  if (task) return <SurveyCapture task={task} />;
  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href="/surveys" label="Back to Surveys" />
      <EmptyState title="Survey not found" hint="It may have been created in another session. Open it again from Assigned surveys." />
    </div>
  );
}
