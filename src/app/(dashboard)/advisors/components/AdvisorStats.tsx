import { StatCard } from "@/components/ui/StatCard";
import { ADVISOR_REGIONS, EXPERTISE_AREAS, type Advisor } from "@/features/communication";

function Icon({ d }: { d: string }) {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const USERS = "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75";
const CHECK = "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3";
const LAYERS = "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5";
const MAP = "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z";

export function AdvisorStats({ advisors }: { advisors: Advisor[] }) {
  const active = advisors.filter((a) => a.status === "Active").length;
  const areas = new Set(advisors.map((a) => a.expertise)).size;
  const regions = new Set(advisors.map((a) => a.region)).size;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total advisors" value={String(advisors.length)} hint="In the MoA directory" accent="border-l-blue-600" tile="bg-blue-50 text-blue-600" icon={<Icon d={USERS} />} />
      <StatCard label="Active" value={String(active)} hint={`${advisors.length - active} on leave or inactive`} accent="border-l-brand-green" tile="bg-brand-tint text-brand-green" icon={<Icon d={CHECK} />} />
      <StatCard label="Expertise areas" value={String(areas)} hint={`of ${EXPERTISE_AREAS.length} tracked areas`} accent="border-l-amber-600" tile="bg-warning-wash text-amber-600" icon={<Icon d={LAYERS} />} />
      <StatCard label="Regions covered" value={String(regions)} hint={`of ${ADVISOR_REGIONS.length} regions`} accent="border-l-red-600" tile="bg-danger-wash text-danger" icon={<Icon d={MAP} />} />
    </div>
  );
}
