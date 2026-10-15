"use client";

import { Banner } from "@/components/ui/Banner";

interface ServiceStatusBannerProps {
  loading: boolean;
  /** Message from the last failed load (503 when the Grievance Service is down). */
  error: string | null;
  lastLoaded: Date | null;
  /** Tickets the service holds for this user, and how many of them were loaded. */
  total: number;
  shown: number;
  onRetry: () => void;
}

// Live state of the link to the external Grievance Service, from the last GET /grievances.
export function ServiceStatusBanner({ loading, error, lastLoaded, total, shown, onRetry }: ServiceStatusBannerProps) {
  const down = !!error;
  const time = lastLoaded?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <Banner tone={down ? "warning" : "success"}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className={down ? "mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" : "mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-green"} aria-hidden />
          <div>
            <p className="font-semibold">{down ? "OAN Grievance Service unavailable" : "Connected to OAN Grievance Service (external)"}</p>
            <p className="mt-0.5">
              {down
                ? `${error} New grievances are still accepted and queued; they are forwarded once the service is back.`
                : "Native raise/track surfaces backed by the Grievance Service API — the full portal is a separate service."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          {time && !down && (
            <span className="rounded-md border border-brand-border bg-brand-mint px-3 py-1.5 text-[12.5px] font-semibold text-brand-green">
              API: Synced · {time}
            </span>
          )}
          {total > shown && (
            <span className="rounded-md border border-warning-border bg-warning-wash px-3 py-1.5 text-[12.5px] font-semibold text-orange-700">
              Showing the latest {shown} of {total}
            </span>
          )}
          <button
            type="button"
            onClick={onRetry}
            disabled={loading}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-ink transition-colors hover:bg-zinc-50 disabled:opacity-60"
          >
            {loading ? "Syncing…" : down ? "Retry" : "Refresh"}
          </button>
        </div>
      </div>
    </Banner>
  );
}
