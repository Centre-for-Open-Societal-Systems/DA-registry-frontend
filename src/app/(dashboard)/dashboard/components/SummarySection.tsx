import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { cn } from "@/lib/utils";
import { timeAgo, type AgentSummary } from "@/features/dashboard";

interface SummarySectionProps {
  /** Range label shown in the heading, e.g. "Last 30 days". */
  rangeLabel: string;
  summary: AgentSummary | null;
  loading: boolean;
  error: string | null;
}

// Placeholder while the first summary loads, so the cards keep their size.
const Pending = () => <span className="inline-block h-[22px] w-10 animate-pulse rounded bg-slate-200 align-middle" />;

// Sync health in priority order: what the DA must act on first.
function syncState(sync: AgentSummary["sync"]): { label: string; tone: "ok" | "warn" | "bad" } {
  const issues = [sync.failed && `${sync.failed} failed`, sync.conflicts && `${sync.conflicts} conflict${sync.conflicts === 1 ? "" : "s"}`].filter(Boolean);
  if (issues.length > 0) return { label: issues.join(" · "), tone: "bad" };
  if (sync.server_pending > 0) return { label: `${sync.server_pending} pending`, tone: "warn" };
  return { label: "All data synced", tone: "ok" };
}

const SYNC_TONE = { ok: "text-brand-green", warn: "text-amber-600", bad: "text-danger" } as const;

export function SummarySection({ rangeLabel, summary, loading, error }: SummarySectionProps) {
  const visits = summary?.visits;
  const tasks = summary?.tasks;
  const sync = summary ? syncState(summary.sync) : null;
  const visitPct = visits && visits.planned > 0 ? Math.min(100, Math.round((visits.completed / visits.planned) * 100)) : 0;
  const lastSync = summary ? timeAgo(summary.sync.last_received_at) : null;

  return (
    <div className="flex flex-col">
      <h2 className="mb-3 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wide text-slate-600">
        Summary · {rangeLabel}
        {loading && summary && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" aria-label="Updating" />}
      </h2>
      {error && <Banner tone="error" title="Could not load your summary" className="mb-3">{error}</Banner>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Farm Visits — opens the visits list */}
        <Link href="/visits" className="block rounded-xl focus-visible:outline-2 focus-visible:outline-brand-green">
        <Card className="group flex h-[128px] flex-col justify-between overflow-hidden p-4 shadow-card border-l-4 border-l-blue-500 transition-shadow hover:shadow-md">
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="mb-1 text-[14px] font-medium text-ink-soft">Farm visits</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[26px] font-semibold leading-none text-ink">{visits ? visits.completed : <Pending />}</span>
                  {visits && <span className="text-[14px] text-muted">of {visits.planned} planned</span>}
                </div>
              </div>

              <div className="h-[60px] w-[60px] rounded-xl bg-info-tint flex items-center justify-center text-blue-500 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.15] group-hover:-translate-y-1.5 group-hover:shadow-sm">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-auto">
              <div className="h-1.5 rounded-full bg-brand-green transition-all duration-1000 ease-out" style={{ width: `${visitPct}%` }}></div>
            </div>
          </div>
        </Card>
        </Link>

        {/* Tasks */}
        <Card className="group flex h-[128px] flex-col justify-between overflow-hidden p-4 shadow-card border-l-4 border-l-violet-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-start h-full">
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="mb-1 text-[14px] font-medium text-ink-soft">Tasks</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[26px] font-semibold leading-none text-ink">{tasks ? tasks.open : <Pending />}</span>
                  {tasks && <span className="text-[14px] text-muted">open · {tasks.done} done</span>}
                </div>
              </div>
              <div className="flex gap-2 mt-auto mb-1">
                {tasks && tasks.urgent > 0 && <span className="bg-red-50 border-red-200 border text-danger text-[10px] tracking-wider font-semibold px-2.5 py-1 rounded-full">{tasks.urgent} URGENT</span>}
                {tasks && tasks.due_today > 0 && <span className="bg-amber-100 border-amber-200 border text-amber-600 text-[10px] tracking-wider font-semibold px-2.5 py-1 rounded-full">{tasks.due_today} DUE TODAY</span>}
                {tasks && tasks.urgent === 0 && tasks.due_today === 0 && <span className="text-[12.5px] text-muted">Nothing urgent or due today</span>}
              </div>
            </div>

            <div className="h-[60px] w-[60px] rounded-xl bg-purple-100 flex items-center justify-center text-violet-500 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.15] group-hover:-translate-y-1.5 group-hover:shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 22h2c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3.1 4 3.6 4 4v3"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <circle cx="8" cy="16" r="6"></circle>
                <path d="M8 14v2l1.5 1.5"></path>
              </svg>
            </div>
          </div>
        </Card>

        {/* Sync Status */}
        <Card className="group flex h-[128px] flex-col justify-between overflow-hidden p-4 shadow-card border-l-4 border-l-brand-green transition-shadow hover:shadow-md">
          <div className="flex justify-between items-start h-full">
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="mb-1 text-[14px] font-medium text-ink-soft">Sync status</p>
                <div className="flex items-center gap-2">
                  {sync ? (
                    <>
                      <svg className={cn("w-[18px] h-[18px]", SYNC_TONE[sync.tone])} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        {sync.tone === "ok" ? (
                          <path d="M8 12.5l3 3 5-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <path d="M12 7v6M12 16.5v.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        )}
                      </svg>
                      <span className="text-[15px] font-semibold text-ink">{sync.label}</span>
                    </>
                  ) : (
                    <Pending />
                  )}
                </div>
              </div>
              {summary && <p className="text-[13px] text-muted mt-auto">{lastSync ? `Last received ${lastSync}` : "Nothing received yet"}</p>}
            </div>

            <div className="h-[60px] w-[60px] rounded-xl bg-emerald-100 flex items-center justify-center text-brand-green shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.15] group-hover:-translate-y-1.5 group-hover:shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_707_7085)">
                  <path d="M21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.48395 3.00947 7.06897 3.99122 5.26 5.74L3 8M8 8H3V3M3 12C3 14.3869 3.94821 16.6761 5.63604 18.364C7.32387 20.0518 9.61305 21 12 21C14.516 20.9905 16.931 20.0088 18.74 18.26L21 16M21 21V16H16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </g>
                <defs>
                  <clipPath id="clip0_707_7085">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>

            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
