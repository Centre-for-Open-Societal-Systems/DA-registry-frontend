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
import { SURVEY_TASKS, useSurveyTemplatesStore, type SurveyTask } from "@/features/surveys";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { CreateTemplateModal } from "./CreateTemplateModal";
import { useAuthStore } from "@/store/useAuthStore";
import { matchesQuery, searchPlaceholder } from "@/lib/search";

const STATUS_TONE = { Open: "green", "Closing soon": "amber", Closed: "slate" } as const;

const SEARCH_PLACEHOLDER = searchPlaceholder(["Survey", "Window", "Languages", "Responses", "Status"]);

const optionsOf = (values: string[], order?: readonly string[]): FilterOption[] =>
  (order ?? [...new Set(values)]).map((value) => ({ value, label: value, count: values.filter((v) => v === value).length }));

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
  const created = useSurveyTemplatesStore((s) => s.created);
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const canCreateTemplate = role === "Supervisor" || role === "Admin";

  // Templates published by a Supervisor this session come first, then the seeded surveys.
  const allSurveys = [...created, ...SURVEY_TASKS];
  const typeOptions = optionsOf(allSurveys.map((s) => s.type), ["Satisfaction", "Service quality", "Needs assessment"]);
  const languageOptions = optionsOf(allSurveys.flatMap((s) => s.languages));
  const statusOptions = optionsOf(allSurveys.map((s) => s.status), Object.keys(STATUS_TONE));
  const filterFields: FilterFieldConfig[] = [
    { key: "type", label: "Survey type", allLabel: "All survey types", placeholder: "All Types", options: typeOptions },
    { key: "language", label: "Languages", allLabel: "All languages", placeholder: "All Languages", options: languageOptions },
    { key: "status", label: "Status", allLabel: "All Status", placeholder: "All Status", options: statusOptions },
  ];

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof SurveyFilters) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));

  const rows = allSurveys.filter(
    (s) =>
      (filters.type.size === 0 || filters.type.has(s.type)) &&
      (filters.language.size === 0 || s.languages.some((l) => filters.language.has(l))) &&
      (filters.status.size === 0 || filters.status.has(s.status)) &&
      matchesQuery(query, s.name, s.type, s.templateVersion, s.window, s.languages, s.status, `${s.collected} of ${s.targetFarmers}`),
  );

  const columns: Column<SurveyTask>[] = [
    {
      key: "name",
      header: <FilterDropdown label="Survey" allLabel="All survey types" options={typeOptions} selected={filters.type} onApply={setFilter("type")} />,
      cell: (s) => <span><span className="font-medium text-ink">{s.name}</span><span className="block text-[12px] text-muted">{s.type} · template {s.templateVersion}</span></span>,
    },
    { key: "window", header: "Window", cell: (s) => <span className="whitespace-nowrap text-[13px]">{s.window.open} → {s.window.close}</span> },
    { key: "lang", header: <FilterDropdown label="Languages" allLabel="All languages" options={languageOptions} selected={filters.language} onApply={setFilter("language")} />, cell: (s) => <span className="text-[13px] text-ink-soft">{s.languages.join(" · ")}</span> },
    {
      key: "progress", header: "Responses", cell: (s) => (
        <div className="min-w-[140px]">
          <div className="flex items-center justify-between text-[12.5px]"><span className="font-medium text-ink">{s.collected} of {s.targetFarmers}</span><span className="text-muted">{Math.round((s.collected / s.targetFarmers) * 100)}%</span></div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-brand-green" style={{ width: `${(s.collected / s.targetFarmers) * 100}%` }} /></div>
          {s.queued > 0 && <span className="mt-1 block text-[11.5px] text-amber-700">{s.queued} queued on device</span>}
        </div>
      ),
    },
    { key: "status", header: <FilterDropdown label="Status" allLabel="All Status" options={statusOptions} selected={filters.status} onApply={setFilter("status")} />, cell: (s) => <Pill tone={STATUS_TONE[s.status]} dot>{s.status}</Pill> },
    {
      key: "actions", header: "Actions", align: "center",
      cell: (s) => s.status === "Closed" ? <span className="whitespace-nowrap text-[12.5px] text-subtle">Window closed</span> : (
        <RowAction href={`/surveys/${s.id}`} tone="solid">Collect response</RowAction>
      ),
    },
  ];

  return (
    <>
      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}
      <Card className="overflow-hidden p-0 shadow-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Assigned surveys</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">
              Responses are captured question by question, can be saved and resumed offline, and sync when connectivity returns. One response per farmer per survey.
              {role !== "DA" && " Templates you create are published to every DA here; results analysis — Part 2 preview."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

            <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
            {canCreateTemplate && (
              <Button type="button" variant="brand" size="md" className="gap-2" onClick={() => setCreateOpen(true)}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create template
              </Button>
            )}
          </div>
        </div>
        <DataTable itemLabel="surveys" columns={columns} rows={rows} rowKey={(s) => s.id} minWidth="980px" emptyTitle="No surveys match the selected filters" emptyHint="Clear a filter or try a different search." />

        <AdvancedFiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          fields={filterFields}
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

      {createOpen && (
        <CreateTemplateModal
          isOpen
          onClose={() => setCreateOpen(false)}
          onCreated={(task) => {
            setCreateOpen(false);
            setNotice(`“${task.name}” (template ${task.templateVersion}) is published and now appears under Assigned surveys for every DA.`);
          }}
        />
      )}
    </>
  );
}
