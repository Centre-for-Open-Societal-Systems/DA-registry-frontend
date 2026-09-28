import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Banner } from "@/components/ui/Banner";
import { Card } from "@/components/ui/Card";
import { getFarmer } from "@/features/farmers/data";
import { PlanVisitButton } from "@/features/farmers/components/PlanVisitButton";
import { getVisit } from "@/features/visits/data";
import { BackLink } from "../../components/BackLink";
import { LogOutcomeForm } from "./components/LogOutcomeForm";
import { ActivityReport } from "./components/ActivityReport";

export const metadata: Metadata = {
  title: "Visit outcome | OpenAgriNet",
};

export default async function VisitOutcomePage(props: PageProps<"/visits/[id]/outcome">) {
  const { id } = await props.params;
  // Set by Start visit: the check-in that opened this outcome form.
  const { started, farmer: startedWith, gps } = (await props.searchParams) as Record<string, string | undefined>;
  const visit = getVisit(id);
  if (!visit) notFound();
  const farmer = getFarmer(visit.farmerId);

  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href={`/visits/${visit.id}`} />

      <Card className="flex flex-col gap-4 px-4 py-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[#1a2b3c] sm:text-[22px]">Visit outcome &amp; activity report</h1>
          <p className="mt-1 text-[13.5px] text-[#4a5568]">
            Log what happened at each visit; outcomes roll up into the weekly activity report.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/visits/${visit.id}`}
            className="inline-flex h-9 items-center whitespace-nowrap rounded-md border border-brand-green bg-white px-3.5 text-[13.5px] font-semibold text-brand-green transition-colors hover:bg-[#F0FAF5]"
          >
            Today&apos;s visits &rarr;
          </Link>
          <PlanVisitButton farmer={farmer} />
        </div>
      </Card>

      {started && (
        <Banner tone="success" title={`Visit started${startedWith ? ` with ${startedWith}` : ""} at ${started}`}>
          {gps ? "Arrival time and GPS location recorded." : "Arrival time recorded; the farmer's parcel location will be used as the visit location."} Record what happened below, then submit to close the visit.
        </Banner>
      )}

      <LogOutcomeForm />
      <ActivityReport />
    </div>
  );
}
