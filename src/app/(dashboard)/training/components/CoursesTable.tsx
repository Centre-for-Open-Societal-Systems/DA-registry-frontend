"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { RowAction } from "@/components/ui/RowAction";
import { SearchInput } from "@/components/ui/SearchInput";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { COURSE_STATUS_TONE, coursePercent, type Course } from "@/features/performance";
import { ExportButton } from "@/components/ui/ExportButton";
import { fileDate, type CsvColumn } from "@/lib/download";
import { downloadTable } from "@/lib/export";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { cn } from "@/lib/utils";

const SEARCH_PLACEHOLDER = searchPlaceholder(["Name", "Category", "Provider", "Course ID"]);

const optionsOf = (values: string[]): FilterOption[] =>
  [...new Set(values)].sort().map((value) => ({ value, label: value, count: values.filter((v) => v === value).length }));

const EXPORT_COLUMNS: CsvColumn<Course>[] = [
  { header: "Course ID", value: (c) => c.id },
  { header: "Course", value: (c) => c.title },
  { header: "Category", value: (c) => c.category },
  { header: "Mandatory", value: (c) => (c.mandatory ? "Mandatory" : "Optional") },
  { header: "Provider", value: (c) => c.provider },
  { header: "Progress", value: (c) => `${c.done} of ${c.total} (${coursePercent(c)}%)` },
  { header: "Status", value: (c) => c.status },
  { header: "Due date", value: (c) => c.dueDate },
  { header: "Certificate", value: (c) => c.certificateId ?? "" },
];

const mandatoryLabel = (c: Course) => (c.mandatory ? "Mandatory" : "Optional");

interface CourseFilters extends FilterSelection {
  category: Set<string>;
  mandatory: Set<string>;
  status: Set<string>;
}
const EMPTY: CourseFilters = { category: new Set(), mandatory: new Set(), status: new Set() };

export function MandatoryPill({ course }: { course: Course }) {
  return (
    <Pill tone={course.mandatory ? "blue" : "slate"} className={cn("px-2.5 py-0.5 text-[12.5px]", !course.mandatory && "text-ink")}>
      {mandatoryLabel(course)}
    </Pill>
  );
}

export function CourseProgress({ course }: { course: Course }) {
  const pct = coursePercent(course);
  return (
    <div className="w-40">
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="text-muted"><span className="font-semibold text-ink">{course.done}</span> of {course.total}</span>
        <span className="text-ink-soft">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line-soft">
        <div className={cn("h-full rounded-full", pct === 100 ? "bg-brand-green" : "bg-blue-600")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// The DA's Agrilearn course list with column filters, the shared Advanced Filters drawer; View opens the course page.
export function CoursesTable({ courses, exportable = false }: { courses: Course[]; exportable?: boolean }) {
  const [filters, setFilters] = useState<CourseFilters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");

  const categoryOptions = optionsOf(courses.map((c) => c.category));
  const mandatoryOptions = optionsOf(courses.map(mandatoryLabel));
  const statusOptions = optionsOf(courses.map((c) => c.status));
  const filterFields: FilterFieldConfig[] = [
    { key: "category", label: "Category", allLabel: "All categories", placeholder: "All Categories", options: categoryOptions },
    { key: "mandatory", label: "Mandatory", allLabel: "All courses", placeholder: "All Courses", options: mandatoryOptions },
    { key: "status", label: "Status", allLabel: "All Status", placeholder: "All Status", options: statusOptions },
  ];

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof CourseFilters) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));
  const has = (set: Set<string>, value: string) => set.size === 0 || set.has(value);

  const rows = courses.filter(
    (c) =>
      has(filters.category, c.category) &&
      has(filters.mandatory, mandatoryLabel(c)) &&
      has(filters.status, c.status) &&
      matchesQuery(query, c.title, c.id, c.category, c.provider, c.status, c.certificateId ?? ""),
  );

  const columns: Column<Course>[] = [
    {
      key: "course",
      header: "Course",
      cell: (c) => (
        <span className="flex max-w-[200px] flex-col">
          <span className="font-semibold leading-snug text-ink">{c.title}</span>
          <span className="text-[12.5px] text-muted">{c.id}</span>
        </span>
      ),
    },
    {
      key: "category",
      header: <FilterDropdown label="Category" allLabel="All categories" options={categoryOptions} selected={filters.category} onApply={setFilter("category")} />,
      cell: (c) => c.category,
    },
    {
      key: "mandatory",
      header: <FilterDropdown label="Mandatory" allLabel="All courses" options={mandatoryOptions} selected={filters.mandatory} onApply={setFilter("mandatory")} />,
      cell: (c) => <MandatoryPill course={c} />,
    },
    { key: "provider", header: "Provider", cell: (c) => c.provider },
    { key: "progress", header: "Progress", cell: (c) => <CourseProgress course={c} /> },
    {
      key: "status",
      header: <FilterDropdown label="Status" allLabel="All Status" options={statusOptions} selected={filters.status} onApply={setFilter("status")} />,
      cell: (c) => <Pill tone={COURSE_STATUS_TONE[c.status]} className={cn("px-2.5 py-0.5 text-[12.5px]", c.status === "Not started" && "text-ink")}>{c.status}</Pill>,
    },
    { key: "due", header: "Due Date", cell: (c) => <span className="whitespace-nowrap">{c.dueDate}</span> },
    { key: "certificate", header: "Certificate", cell: (c) => (c.certificateId ? <span className="whitespace-nowrap">{c.certificateId}</span> : <span className="text-subtle">—</span>) },
    { key: "action", header: "Action", align: "center", cell: (c) => <RowAction icon="view" href={`/training/${c.id}`}>View</RowAction> },
  ];

  return (
    <Card className="overflow-hidden p-0 shadow-card">
      <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[16px] font-semibold text-ink">Courses</h2>
          {rows.length !== courses.length && <span className="text-[13px] text-muted">{rows.length} of {courses.length} courses</span>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />
          <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
          {exportable && (
            <ExportButton label="Export file" disabled={rows.length === 0} onExport={(format) => downloadTable(format, `team-courses-${fileDate()}`, rows, EXPORT_COLUMNS, "Courses")} />
          )}
        </div>
      </div>

      <DataTable
        itemLabel="courses"
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        minWidth="1150px"
        emptyTitle={courses.length === 0 ? "No courses assigned yet" : "No courses match the selected filters"}
        emptyHint={courses.length === 0 ? "Your Agrilearn courses will appear here once they are assigned." : "Clear a filter or try a different search."}
      />

      <AdvancedFiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        fields={filterFields}
        filters={filters}
        onApply={(next) => setFilters({ category: next.category ?? new Set(), mandatory: next.mandatory ?? new Set(), status: next.status ?? new Set() })}
      />
    </Card>
  );
}
