import Link from "next/link";
import { cn } from "@/lib/utils";
import { DATA_EXCEPTIONS, FAYDA_CHECKS, ISSUANCE_EVENTS, SYNC_EVENTS } from "../data";

// Appendix C.2: the Agents master view carries a module strip → DAID / Fayda / Registry Sync.
// Also rendered on those sub-screens so the strip doubles as their local navigation.
export function ModuleStrip({ activeHref }: { activeHref?: string }) {
  const modules = [
    { href: "/agents/daid", title: "DA-ID management", stat: `${ISSUANCE_EVENTS.filter((e) => e.state !== "Generated").length} in pipeline · ${DATA_EXCEPTIONS.length} exceptions` },
    { href: "/agents/fayda", title: "Fayda verification", stat: `${FAYDA_CHECKS.filter((c) => c.result !== "Verified").length} awaiting resolution` },
    { href: "/registry-sync", title: "Registry sync", stat: `${SYNC_EVENTS.filter((e) => e.outcome === "Failed").length} failed · ${SYNC_EVENTS.filter((e) => e.outcome === "Pending").length} pending` },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {modules.map((m) => {
        const active = m.href === activeHref;
        return (
          <Link
            key={m.href}
            href={m.href}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] transition-colors",
              active ? "border-brand-green bg-[#F0FAF5]" : "border-[#E5E7EB] hover:border-brand-green/60",
            )}
          >
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-[#1a2b3c]">{m.title}</p>
              <p className="mt-0.5 truncate text-[12px] text-[#64748b]">{m.stat}</p>
            </div>
            <svg className="h-4 w-4 shrink-0 text-[#94A3B8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </Link>
        );
      })}
    </div>
  );
}
