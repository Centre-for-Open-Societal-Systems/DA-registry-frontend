import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { INCENTIVE_CRITERIA } from "@/features/performance";

// Quarterly incentive criteria; the incentive is paid through the external MoA scheme, not this portal.
export function IncentiveEligibility() {
  const met = INCENTIVE_CRITERIA.filter((c) => c.met).length;
  const eligible = met === INCENTIVE_CRITERIA.length;

  return (
    <Card className="p-0 shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-[18px] font-semibold text-ink">Incentive eligibility</h2>
        <Pill tone={eligible ? "green" : "amber"} dot>{eligible ? "Eligible" : "At risk"}</Pill>
      </div>
      <div className="px-5 py-5">
        <p className="text-[15px] text-ink-soft">
          You meet {met} of {INCENTIVE_CRITERIA.length} criteria this quarter. The incentive itself is paid through the external MoA scheme.
        </p>
        <ul className="mt-4 flex flex-col gap-4">
          {INCENTIVE_CRITERIA.map((c) => (
            <li key={c.title} className="flex gap-4">
              {c.met ? (
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand-green text-white" aria-label="Met">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
                </span>
              ) : (
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-danger" aria-label="Not met">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </span>
              )}
              <div>
                <p className="text-[15.5px] font-semibold text-ink">{c.title}</p>
                <p className="mt-0.5 text-[14.5px] text-ink-soft">{c.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
