"use client";

import { useState } from "react";
import { Banner } from "@/components/ui/Banner";

export function ServiceStatusBanner() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState("2 min ago");
  const [queuedCount, setQueuedCount] = useState(2);

  // Placeholder until the Grievance Service sync endpoint exists
  const retrySync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced("just now");
      setQueuedCount(0);
    }, 1200);
  };

  return (
    <Banner tone="success">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-green" aria-hidden />
          <div>
            <p className="font-semibold">Connected to OAN Grievance Service (external)</p>
            <p className="mt-0.5">
              Native raise/track surfaces backed by the Grievance Service API — the full portal is a separate service.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          <span className="rounded-md border border-[#A7E3C7] bg-[#EBFAF2] px-3 py-1.5 text-[12.5px] font-semibold text-brand-green">
            API: Synced · {lastSynced}
          </span>
          {queuedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#FCD9A8] bg-[#FFF7EB] px-3 py-1.5 text-[12.5px] font-semibold text-[#C2410C]">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2h12M6 22h12M8 2v4l4 5 4-5V2M8 22v-4l4-5 4 5v4" />
              </svg>
              {queuedCount} queued offline
            </span>
          )}
          <button
            type="button"
            onClick={retrySync}
            disabled={isSyncing}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#1a2b3c] transition-colors hover:bg-zinc-50 disabled:opacity-60"
          >
            {isSyncing ? "Syncing…" : "Retry sync"}
          </button>
        </div>
      </div>
    </Banner>
  );
}
