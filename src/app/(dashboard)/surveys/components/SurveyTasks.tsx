"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { RowAction } from "@/components/ui/RowAction";
import { Pill } from "@/components/ui/Pill";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { SURVEY_TASKS, type SurveyTask } from "@/features/surveys/data";
import { useAuthStore } from "@/store/useAuthStore";
import { matchesQuery, searchPlaceholder } from "@/lib/search";

const STATUS_TONE = { Open: "green", "Closing soon": "amber", Closed: "slate" } as const;

const SEARCH_PLACEHOLDER = searchPlaceholder(["Survey", "Window", "Languages", "Responses", "Status"]);

const optionsOf = (values: string[], order?: readonly string[]): FilterOption[] =>
  (order ?? [...new Set(values)]).map((value) => ({ value, label: value, count: values.filter((v) => v === value).length }));

const TYPE_OPTIONS = optionsOf(SURVEY_TASKS.map((s) => s.type), ["Satisfaction", "Service quality", "Needs assessment"]);
const LANGUAGE_OPTIONS = optionsOf(SURVEY_TASKS.flatMap((s) => s.languages));
const STATUS_OPTIONS = optionsOf(SURVEY_TASKS.map((s) => s.status), Object.keys(STATUS_TONE));

const FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "type", label: "Survey type", allLabel: "All survey types", placeholder: "All types", options: TYPE_OPTIONS },
  { key: "language", label: "Languages", allLabel: "All languages", placeholder: "All languages", options: LANGUAGE_OPTIONS },
  { key: "status", label: "Status", allLabel: "All Status", placeholder: "All Status", options: STATUS_OPTIONS },
];

interface SurveyFilters extends FilterSelection {
  type: Set<string>;
  language: Set<string>;
  status: Set<string>;
}
const EMPTY: SurveyFilters = { type: new Set(), language: new Set(), status: new Set() };

// FR-09d: assigned survey tasks for the DA — template version, window, progress (n of N), queued responses.
export function SurveyTasks() {
  const role = useAuthStore((s) => s.role);
  const [filters, setFilters] = useState<SurveyFilters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof SurveyFilters) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));

  const rows = SURVEY_TASKS.filter(
    (s) =>
      (filters.type.size === 0 || filters.type.has(s.type)) &&
      (filters.language.size === 0 || s.languages.some((l) => filters.language.has(l))) &&
      (filters.status.size === 0 || filters.status.has(s.status)) &&
      matchesQuery(query, s.name, s.type, s.templateVersion, s.window, s.languages, s.status, `${s.collected} of ${s.targetFarmers}`),
  );

  const columns: Column<SurveyTask>[] = [
    {
      key: "name",
      header: <FilterDropdown label="Survey" allLabel="All survey types" options={TYPE_OPTIONS} selected={filters.type} onApply={setFilter("type")} />,
      cell: (s) => <span><span className="font-medium text-[#1a2b3c]">{s.name}</span><span className="block text-[12px] text-[#64748b]">{s.type} · template {s.templateVersion}</span></span>,
    },
    { key: "window", header: "Window", cell: (s) => <span className="whitespace-nowrap text-[13px]">{s.window.open} → {s.window.close}</span> },
    { key: "lang", header: <FilterDropdown label="Languages" allLabel="All languages" options={LANGUAGE_OPTIONS} selected={filters.language} onApply={setFilter("language")} />, cell: (s) => <span className="text-[13px] text-[#4a5568]">{s.languages.join(" · ")}</span> },
    {
      key: "progress", header: "Responses", cell: (s) => (
        <div className="min-w-[140px]">
          <div className="flex items-center justify-between text-[12.5px]"><span className="font-medium text-[#1a2b3c]">{s.collected} of {s.targetFarmers}</span><span className="text-[#64748b]">{Math.round((s.collected / s.targetFarmers) * 100)}%</span></div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-[#E2E8F0]"><div className="h-1.5 rounded-full bg-brand-green" style={{ width: `${(s.collected / s.targetFarmers) * 100}%` }} /></div>
          {s.queued > 0 && <span className="mt-1 block text-[11.5px] text-[#B45309]">{s.queued} queued on device</span>}
        </div>
      ),
    },
    { key: "status", header: <FilterDropdown label="Status" allLabel="All Status" options={STATUS_OPTIONS} selected={filters.status} onApply={setFilter("status")} />, cell: (s) => <Pill tone={STATUS_TONE[s.status]} dot>{s.status}</Pill> },
    {
      key: "actions", header: "Actions", align: "center",
      cell: (s) => s.status === "Closed" ? <span className="whitespace-nowrap text-[12.5px] text-[#94A3B8]">Window closed</span> : (
        <RowAction href={`/surveys/${s.id}`} tone="solid">Collect response</RowAction>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Assigned surveys</h2>
          <p className="mt-0.5 text-[12.5px] text-[#4a5568]">
            Responses are captured question by question, can be saved and resumed offline, and sync when connectivity returns. One response per farmer per survey.
            {role !== "DA" && " Template design, deployment and results are Part 2 (Performance › Surveys)."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

          <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
        </div>
      </div>
      <DataTable itemLabel="surveys" columns={columns} rows={rows} rowKey={(s) => s.id} minWidth="980px" emptyTitle="No surveys match the selected filters" emptyHint="Clear a filter or try a different search." />

      <AdvancedFiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        fields={FILTER_FIELDS}
        filters={filters}
        onApply={(next) =>
          setFilters({
            type: next.type ?? new Set(),
            language: next.language ?? new Set(),
            status: next.status ?? new Set(),
          })
        }
      />
    </Card>
  );
}
