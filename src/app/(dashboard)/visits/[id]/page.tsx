import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { getFarmer } from "@/features/farmers";
import { PlanVisitButton } from "@/features/farmers";
import { getVisit, PLANNER_WEEK } from "@/features/visits";
import { BackLink } from "@/components/ui/BackLink";
import { WeekCalendar } from "./components/WeekCalendar";
import { PriorityList } from "./components/PriorityList";
import { TodaysVisits } from "./components/TodaysVisits";

export const metadata: Metadata = {
  title: "Visit Planner | OpenAgriNet",
};

export default async function VisitPlannerPage(props: PageProps<"/visits/[id]">) {
  const { id } = await props.params;
  const visit = getVisit(id);
  if (!visit) notFound();
  const farmer = getFarmer(visit.farmerId);

  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href="/visits" />

      <Card className="flex flex-col gap-4 px-4 py-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-ink sm:text-[22px]">Visit Planner</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">{PLANNER_WEEK.range}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/visits/${visit.id}/outcome`}
            className="inline-flex h-9 items-center whitespace-nowrap rounded-md border border-brand-green bg-white px-3.5 text-[13.5px] font-semibold text-brand-green transition-colors hover:bg-brand-wash"
          >
            Log visit outcome &rarr;
          </Link>
          <PlanVisitButton farmer={farmer} />
        </div>
      </Card>

      <WeekCalendar />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PriorityList />
        <TodaysVisits visitId={visit.id} />
      </div>
    </div>
  );
}
