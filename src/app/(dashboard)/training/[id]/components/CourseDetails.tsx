import type { ReactNode } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { AGRILEARN_URL, COURSE_STATUS_TONE, coursePercent, type Course } from "@/features/performance";
import { cn } from "@/lib/utils";
import { MandatoryPill } from "../../components/CoursesTable";

const EXTERNAL_ICON = "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3";
const INFO_ICON = "M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01";

function Icon({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Sample directory details per course category until the Agrilearn / MoA directory feed is wired.
const DIRECTORY: Record<Course["category"], { expertise: string; unit: string }> = {
  "Digital tools": { expertise: "Digital extension", unit: "ICT & Digital Agriculture Directorate" },
  Agronomy: { expertise: "Crop protection", unit: "Plant Protection Directorate" },
  "Safety & compliance": { expertise: "Agrochemical safety", unit: "Plant Protection Directorate" },
  Livestock: { expertise: "Animal health", unit: "Livestock Development Directorate" },
  "Extension methods": { expertise: "Extension services", unit: "Agricultural Extension Directorate" },
};

const initials = (title: string) => title.split(/[\s-]+/).filter((w) => w.length > 3).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[13.5px] text-muted">{label}</p>
      <p className="mt-1 text-[14.5px] font-semibold text-ink">{value}</p>
    </div>
  );
}

function SectionCard({ title, addon, children }: { title: string; addon?: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-0 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
        <h2 className="text-[15.5px] font-semibold text-ink">{title}</h2>
        {addon}
      </div>
      <div className="px-5 py-5">{children}</div>
    </Card>
  );
}

// Read-only reflection of the DA's Agrilearn course; learning and completion happen in Agrilearn only.
export function CourseDetails({ course }: { course: Course }) {
  const pct = coursePercent(course);
  const statusPill = <Pill tone={COURSE_STATUS_TONE[course.status]} className={cn("px-2.5 py-0.5 text-[12.5px]", course.status === "Not started" && "text-ink")}>{course.status}</Pill>;

  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href="/training?tab=courses" />

      <Card className="px-5 py-4">
        <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-2xl">Courses Details</h1>
        <p className="mt-1 text-[13.5px] text-ink-soft">Reflected learning information only. All learning activity and completion changes happen in Agrilearn.</p>
      </Card>

      <Card className="p-0 shadow-card">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-green text-[22px] font-semibold text-white">{initials(course.title)}</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-[19px] font-bold text-ink">{course.title}</h2>
                <MandatoryPill course={course} />
              </div>
              <p className="mt-1 text-[14px] text-ink-soft">{course.category} • {course.id}</p>
            </div>
          </div>
          {statusPill}
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Expertise area" value={DIRECTORY[course.category].expertise} />
          <Field label="MoA unit / directorate" value={DIRECTORY[course.category].unit} />
          <Field label="Directory status" value="Active • available in directory" />
          <Field label="Region" value="Oromia" />
          <Field label="Woreda" value="Bako Tibe" />
          <Field label="Directory last updated" value={`${course.lastSync} EAT`} />
        </div>
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-4">
          <SectionCard title={course.title} addon={<span className="flex gap-2"><MandatoryPill course={course} />{statusPill}</span>}>
            <p className="text-[14px] leading-relaxed text-ink-soft">{course.summary}</p>
            <div className="mt-4 rounded-lg bg-brand-mint px-4 py-4">
              <div className="flex items-center justify-between text-[14.5px] font-semibold">
                <span className="text-ink">Your reflected progress</span>
                <span className="text-brand-green">{pct}%</span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-brand-green" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2.5 text-[12.5px] text-ink-soft">Agrilearn reported {pct}% at the last successful sync. This portal cannot mark the course complete.</p>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Course code" value={course.id} />
              <Field label="Due date" value={course.dueDate} />
              <Field label="Requirement" value={course.mandatory ? "Mandatory" : "Optional"} />
            </div>
          </SectionCard>

          <SectionCard title="Source & Certification">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Provider / record source" value={course.provider === "Agrilearn" ? "Agrilearn" : `${course.provider} via Agrilearn`} />
              <Field label="Last successful sync" value={`${course.lastSync} EAT`} />
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
              {course.certificateId
                ? `Certificate ${course.certificateId} for ${course.id} is reflected from Agrilearn and verified automatically.`
                : `No earned certificate for ${course.id} is reflected yet. Earned Agrilearn certificates appear automatically after sync.`}
            </p>
          </SectionCard>
        </div>

        <SectionCard title="Continue in Agrilearn">
          <p className="text-[14px] leading-relaxed text-ink-soft">Leave OpenAgriNet to access learning content in Agrilearn. An internet connection is required; you may need to sign in there.</p>
          <a
            href={AGRILEARN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-brand-green px-5 text-[14.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark"
          >
            <Icon d={EXTERNAL_ICON} />
            Open in Agrilearn
          </a>
          <div className="mt-5 flex gap-3 rounded-lg bg-brand-mint px-4 py-4">
            <Icon d={INFO_ICON} className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
            <div>
              <p className="text-[14.5px] font-semibold text-brand-green">External service</p>
              <p className="mt-1 text-[13.5px] text-ink-soft">Course content, assessments and completion are managed by Agrilearn. There is no native course player or quiz in this portal.</p>
            </div>
          </div>
          <p className="mt-5 text-[14px] leading-relaxed text-ink-soft">Returning to this page does not itself prove new progress. The source and sync timestamp will show the next reflected update.</p>
        </SectionCard>
      </div>
    </div>
  );
}
