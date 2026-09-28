"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { downloadTemplate } from "@/lib/download";
import {
  ASSIGNED_KEBELES,
  DEVELOPMENT_AGENTS,
  KPI_IMPORT_MAX_BYTES,
  REPORTING_PERIODS,
  WOREDA_REGIONS,
} from "@/features/performance/supervisorData";

type Mode = "bulk" | "manual";

const MODES: { value: Mode; title: string; description: string }[] = [
  { value: "bulk", title: "Bulk Excel/CSV Import", description: "Upload large registers using standardized templates." },
  { value: "manual", title: "Manual Form Entry", description: "Type development agent KPI records individually." },
];

interface ManualForm {
  period: string;
  woreda: string;
  agent: string;
  kebele: string;
  visits: string;
  farmerCases: string;
  needs: string;
  supportActions: string;
  reviews: string;
  training: string;
  quality: string;
  notes: string;
}

const INITIAL_FORM: ManualForm = {
  period: REPORTING_PERIODS[0],
  woreda: WOREDA_REGIONS[0],
  agent: DEVELOPMENT_AGENTS[0],
  kebele: ASSIGNED_KEBELES[0],
  visits: "",
  farmerCases: "",
  needs: "",
  supportActions: "",
  reviews: "",
  training: "",
  quality: "",
  notes: "",
};

const REQUIRED: (keyof ManualForm)[] = ["period", "woreda", "agent", "kebele", "visits", "farmerCases", "training", "quality"];

type MetricKey = "visits" | "farmerCases" | "needs" | "supportActions" | "reviews" | "training" | "quality";

const METRICS: { key: MetricKey; label: string; unit: string; hint: string; max?: number }[] = [
  { key: "visits", label: "Visits Conducted", unit: "Visits", hint: "Target: 18 visits" },
  { key: "farmerCases", label: "Active Farmer Cases", unit: "Farmers", hint: "Target: 120 active" },
  { key: "needs", label: "Needs Identified", unit: "Issues", hint: "Agronomic / technical" },
  { key: "supportActions", label: "Support Actions Logged", unit: "Actions", hint: "Delivered this period" },
  { key: "reviews", label: "Reviews Conducted", unit: "Surveys", hint: "Mandatory review count" },
  { key: "training", label: "Training Completion", unit: "%", hint: "Agent training progress", max: 100 },
  { key: "quality", label: "Quality Score Assessed", unit: "%", hint: "Subjective coordinator score", max: 100 },
];

// Import template columns = the manual form's fields, in form order.
const TEMPLATE_HEADERS = [
  "Reporting Period",
  "Woreda / Region",
  "Development Agent",
  "Assigned Kebele",
  ...METRICS.map((m) => (m.unit === "%" ? `${m.label} (%)` : m.label)),
  "Operational Notes & Observations",
];
const TEMPLATE_EXAMPLE = [REPORTING_PERIODS[0], WOREDA_REGIONS[0], DEVELOPMENT_AGENTS[0], ASSIGNED_KEBELES[0], 18, 120, 6, 9, 4, 90, 85, "Met all agricultural milestones for Kebele 01."];

const DRAFT_KEY = "oan:kpi-entry-draft";

const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <h2 className="border-b border-[#E5E7EB] px-5 py-3.5 text-[15px] font-semibold text-[#1a2b3c]">{title}</h2>
      <div className="px-5 py-5">{children}</div>
    </Card>
  );
}

export function KpiEntryForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("bulk");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [form, setForm] = useState<ManualForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ManualForm, string>>>({});
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  // Restore a saved manual-entry draft (deferred a tick so server and first client render match).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const draft = JSON.parse(raw) as { form: ManualForm; savedAt: string };
        setForm({ ...INITIAL_FORM, ...draft.form });
        setMode("manual");
        setNotice({ tone: "success", text: `Draft from ${new Date(draft.savedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} restored.` });
      } catch {
        // unreadable draft — start fresh
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const saveDraft = () => {
    if (mode === "bulk") {
      setNotice({ tone: "success", text: file ? `${file.name} stays selected on this page — submit it to queue the import. Only manual entries are saved as drafts.` : "Nothing to save yet — bulk imports are submitted as a file. Switch to Manual Form Entry to save a draft." });
      return;
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, savedAt: new Date().toISOString() }));
      setNotice({ tone: "success", text: `Draft for ${form.agent} saved on this device. It reopens here next time.` });
    } catch {
      setNotice({ tone: "error", text: "Couldn't save the draft — browser storage is unavailable." });
    }
  };

  const setField = (key: keyof ManualForm) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const pickFile = (picked: File | undefined) => {
    if (!picked) return;
    const ext = picked.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "csv") {
      setFileError("Only .xlsx or .csv files are accepted.");
      return;
    }
    if (picked.size > KPI_IMPORT_MAX_BYTES) {
      setFileError("File is larger than 5 MB.");
      return;
    }
    setFileError(null);
    setFile(picked);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateManual = () => {
    const next: Partial<Record<keyof ManualForm, string>> = {};
    REQUIRED.forEach((key) => {
      if (!form[key].trim()) next[key] = "Required";
    });
    METRICS.forEach(({ key, max }) => {
      const raw = form[key].trim();
      if (!raw) return;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) next[key] = "Enter a positive number";
      else if (max !== undefined && n > max) next[key] = `Must be ${max} or less`;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (mode === "bulk") {
      if (!file) {
        setNotice({ tone: "error", text: "Choose an .xlsx or .csv file to import first." });
        return;
      }
      setNotice({ tone: "success", text: `${file.name} queued for validation. KPIs will be recomputed once the import passes checks.` });
      removeFile();
      return;
    }
    if (!validateManual()) {
      setNotice({ tone: "error", text: "Fix the highlighted fields before submitting." });
      return;
    }
    setNotice({ tone: "success", text: `KPI entry for ${form.agent} (${form.period.split(" (")[0]}) submitted.` });
    setForm(INITIAL_FORM);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // storage unavailable — nothing to clear
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Mode switch */}
      <div role="radiogroup" aria-label="Entry method" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {MODES.map((m) => {
          const selected = mode === m.value;
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setMode(m.value);
                setNotice(null);
              }}
              className={cn(
                "flex items-center justify-between gap-4 rounded-xl border bg-white px-3 py-3 text-left transition-all",
                selected ? "border-brand-green" : "border-[#E5E7EB] hover:border-brand-green/30 hover:shadow-sm",
              )}
            >
              <span>
                <span className="block text-[14px] font-semibold text-[#1a2b3c]">{m.title}</span>
                <span className="mt-0.5 block text-[12.5px] text-[#4a5568]">{m.description}</span>
              </span>
              <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", selected ? "border-brand-green" : "border-zinc-400")}>
                {selected && <span className="h-2 w-2 rounded-full bg-brand-green" />}
              </span>
            </button>
          );
        })}
      </div>

      {notice && (
        <Banner tone={notice.tone} onDismiss={() => setNotice(null)}>
          {notice.text}
        </Banner>
      )}

      {mode === "bulk" ? (
        <>
          <Section title="Step 1: Download template">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[14px] text-[#334155]">Download the Excel template with required fields and data validation rules.</p>
                <p className="mt-1 text-[12.5px] text-[#4a5568]">Columns match the manual form; one example row included. Open in Excel and save as .xlsx or .csv.</p>
              </div>
              <Button
                type="button"
                variant="brand"
                className="shrink-0 gap-2"
                onClick={() => {
                  downloadTemplate("kpi-import-template.csv", TEMPLATE_HEADERS, TEMPLATE_EXAMPLE);
                  setNotice({ tone: "success", text: "kpi-import-template.csv downloaded — fill one row per agent and period, then upload it in Step 2." });
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
                </svg>
                Download template
              </Button>
            </div>
          </Section>

          <Section title="Step 2: Upload File">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                pickFile(e.dataTransfer.files[0]);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
                isDragging ? "border-brand-green bg-[#F0FAF5]" : "border-[#CBD5E1] hover:border-brand-green",
              )}
            >
              <input ref={fileInputRef} type="file" accept=".xlsx,.csv" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
              <svg className="h-4 w-4 text-[#475569]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              <span className="text-[13px] font-semibold text-[#1a2b3c]">Drag and drop your file here or click to browse</span>
              <span className="text-[12.5px] text-[#4a5568]">Accepted formats: .xlsx, .csv (Max size: 5MB)</span>
              <span className="mt-1.5 rounded-md border border-brand-green px-3 py-1.5 text-[13px] font-semibold text-brand-green">Browse file</span>
            </label>
            {fileError && <p className="mt-2 text-[12.5px] text-[#DC2626]">{fileError}</p>}

            {file && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-green bg-[#EBFAF2] px-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-brand-green">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#1a2b3c]">{file.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-[#4a5568]">{formatSize(file.size)} · selected from this computer</p>
                </div>
                <button type="button" onClick={removeFile} className="text-[12.5px] font-semibold text-[#C2410C] hover:underline">
                  Remove
                </button>
              </div>
            )}
          </Section>
        </>
      ) : (
        <>
          <Section title="Step 1: Agent & reporting period">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {(
                [
                  { key: "period", label: "Reporting Period", options: REPORTING_PERIODS },
                  { key: "woreda", label: "Woreda / Region", options: WOREDA_REGIONS },
                  { key: "agent", label: "Development Agent", options: DEVELOPMENT_AGENTS },
                  { key: "kebele", label: "Assigned Kebele", options: ASSIGNED_KEBELES },
                ] as const
              ).map(({ key, label, options }) => (
                <FormField key={key} label={label} htmlFor={`kpi-${key}`} required hint={errors[key]} hintTone="error">
                  <Select id={`kpi-${key}`} value={form[key]} onChange={(e) => setField(key)(e.target.value)} className="h-10">
                    {options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </Select>
                </FormField>
              ))}
            </div>
          </Section>

          <Section title="Step 2: Enter KPIs">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {METRICS.map(({ key, label, unit, hint, max }) => (
                <FormField
                  key={key}
                  label={label}
                  htmlFor={`kpi-${key}`}
                  required={REQUIRED.includes(key)}
                  hint={errors[key] ?? hint}
                  hintTone={errors[key] ? "error" : "muted"}
                >
                  <Input
                    id={`kpi-${key}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={max}
                    value={form[key]}
                    onChange={(e) => setField(key)(e.target.value)}
                    className={cn("h-10 pr-20", errors[key] && "border-[#DC2626]")}
                    endAdornment={<span className="text-[13px] font-medium text-[#4a5568]">{unit}</span>}
                  />
                </FormField>
              ))}
              <FormField label="Operational Notes & Observations" htmlFor="kpi-notes" className="sm:col-span-2 xl:col-span-4">
                <Input
                  id="kpi-notes"
                  value={form.notes}
                  onChange={(e) => setField("notes")(e.target.value)}
                  placeholder="e.g. Met all agricultural milestones for Kebele 01."
                  className="h-10"
                />
              </FormField>
            </div>
          </Section>
        </>
      )}

      {/* Footer actions */}
      <Card className="flex flex-col-reverse gap-3 px-5 py-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={saveDraft}>
          Save Draft
        </Button>
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => router.push("/performance")}>
            Cancel
          </Button>
          <Button type="button" variant="brand" onClick={submit}>
            Submit Entry
          </Button>
        </div>
      </Card>
    </div>
  );
}
