import Link from "next/link";
import { cn } from "@/lib/utils";
import { AGENTS, DATA_EXCEPTIONS, FAYDA_CHECKS, ISSUANCE_EVENTS, SYNC_EVENTS, TOTAL_AGENTS } from "../data";

// Appendix C.2: the Agents master view carries a module strip → Master registry / DAID / Fayda / Registry Sync.
// Also rendered on those sub-screens so the strip doubles as their local navigation.
export function ModuleStrip({ activeHref }: { activeHref?: string }) {
  const modules = [
    { href: "/agents", title: "Agents", stat: `${TOTAL_AGENTS.toLocaleString()} agents · ${AGENTS.filter((a) => a.approvalStatus === "Awaiting review").length} awaiting review` },
    { href: "/agents/daid", title: "DA-ID management", stat: `${ISSUANCE_EVENTS.filter((e) => e.state !== "Generated").length} in pipeline · ${DATA_EXCEPTIONS.length} exceptions` },
    { href: "/agents/fayda", title: "Fayda verification", stat: `${FAYDA_CHECKS.filter((c) => c.result !== "Verified").length} awaiting resolution` },
    { href: "/registry-sync", title: "Registry sync", stat: `${SYNC_EVENTS.filter((e) => e.outcome === "Failed").length} failed · ${SYNC_EVENTS.filter((e) => e.outcome === "Pending").length} pending` },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {modules.map((m) => {
        const active = m.href === activeHref;
        return (
          <Link
            key={m.href}
            href={m.href}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 shadow-card transition-colors",
              active ? "border-brand-green bg-brand-wash" : "border-line hover:border-brand-green/60",
            )}
          >
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-ink">{m.title}</p>
              <p className="mt-0.5 truncate text-[12px] text-muted">{m.stat}</p>
            </div>
            <svg className="h-4 w-4 shrink-0 text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </Link>
        );
      })}
    </div>
  );
}
