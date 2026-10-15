"use client";

import { useEffect, useState } from "react";
import { fetchAgentSummary, rangeFor, type AgentSummary } from "@/features/dashboard";
import { TopHeader } from "./TopHeader";
import { SummarySection } from "./SummarySection";

// Ranges the summary API can be asked for; a custom range needs a date picker the header does not have yet.
const RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "This quarter", "This year"] as const;
const DEFAULT_RANGE = "Last 30 days";

// DA home header + summary cards: the date range picked in the header drives GET /dashboard/summary.
export function AgentOverview() {
  const [range, setRange] = useState(DEFAULT_RANGE);
  // Last answer and the range it was for; the cards keep showing it while a newer range loads.
  const [result, setResult] = useState<{ range: string; summary: AgentSummary | null; error: string | null } | null>(null);

  useEffect(() => {
    const dates = rangeFor(range);
    if (!dates) return;
    // A slower answer for a range the DA has already moved away from must not overwrite the newer one.
    let current = true;
    fetchAgentSummary(dates)
      .then((summary) => current && setResult({ range, summary, error: null }))
      .catch((err: unknown) => current && setResult((prev) => ({ range, summary: prev?.summary ?? null, error: err instanceof Error ? err.message : "Please try again in a moment." })));
    return () => {
      current = false;
    };
  }, [range]);

  return (
    <>
      <TopHeader ranges={RANGES} range={range} onRangeChange={setRange} />
      <SummarySection rangeLabel={range} summary={result?.summary ?? null} loading={result?.range !== range} error={result?.range === range ? result.error : null} />
    </>
  );
}
