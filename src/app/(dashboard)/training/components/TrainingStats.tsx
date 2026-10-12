import { StatCard } from "@/components/ui/StatCard";
import type { Course } from "@/features/performance";

function Icon({ d }: { d: string }) {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const CAP = "M22 10L12 5 2 10l10 5 10-5zM6 12v5c3 3 9 3 12 0v-5";
const FILE_CHECK = "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 15l2 2 4-4";
const CERT = "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h6M14 2v6h6M20 8v3M8 9h2M8 13h6M17 21a3 3 0 100-6 3 3 0 000 6zM15.5 20.5L15 23l2-1 2 1-.5-2.5";
const CALENDAR = "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z";

export function TrainingStats({ courses, certificates, sessions }: { courses: Course[]; certificates: number; sessions: number }) {
  const completed = courses.filter((c) => c.status === "Completed").length;
  const mandatory = courses.filter((c) => c.mandatory);
  const mandatoryDone = mandatory.filter((c) => c.status === "Completed").length;
  const compliance = mandatory.length ? Math.round((mandatoryDone / mandatory.length) * 100) : 100;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Course Completed" value={`${completed}/${courses.length}`} hint="Agrilearn record" accent="border-l-brand-green" tile="bg-brand-tint text-brand-green" icon={<Icon d={CAP} />} />
      <StatCard label="Mandatory compliance" value={`${compliance}%`} hint={`${mandatoryDone} of ${mandatory.length} mandatory courses`} accent="border-l-blue-600" tile="bg-blue-50 text-blue-600" icon={<Icon d={FILE_CHECK} />} />
      <StatCard label="Certificates" value={String(certificates)} hint="Agrilearn-auto, verified" accent="border-l-amber-600" tile="bg-warning-wash text-amber-600" icon={<Icon d={CERT} />} />
      <StatCard label="Upcoming sessions" value={String(sessions)} hint="Next 90 days" accent="border-l-violet-600" tile="bg-violet-50 text-violet-600" icon={<Icon d={CALENDAR} />} />
    </div>
  );
}
