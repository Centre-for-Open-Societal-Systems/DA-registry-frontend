"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import { readDraft, removeDraft, writeDraft } from "@/lib/drafts";
import {
  CROP_SOWN_FORM,
  FARMERS,
  FarmerAvatar,
  findFarmersById,
  getCropSownPrefill,
  registryCode,
  valueKey,
  type CropSownValues,
  type Farmer,
} from "@/features/farmers";
import { SectionCard } from "../../[id]/components/SectionCard";
import { CropSownFieldInput } from "./CropSownFieldInput";

const DRAFT_KEY = "crop-report";
const SAMPLE_ID = registryCode(FARMERS[0]);

interface Draft {
  farmerId: string;
  values: CropSownValues;
  savedAt: string;
}

type Notice = { tone: "success" | "info" | "error"; title: string; body?: string };

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Submit Crop Report: find the farmer by Farmer ID, start from what the registries already hold for them,
// then complete the Crop Sown Registry stages tab by tab. No Crop Sown API yet — drafts stay in this session.
export function CropReportForm() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Farmer[] | null>(null);
  const [farmer, setFarmer] = useState<Farmer>();
  const [values, setValues] = useState<CropSownValues>({});
  const [prefilled, setPrefilled] = useState<CropSownValues>({});
  const [tab, setTab] = useState(CROP_SOWN_FORM[0].key);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Restore a draft saved in this session (after mount, so server and client render the same markup first).
  useEffect(() => {
    const t = setTimeout(() => {
      const draft = readDraft<Draft>(DRAFT_KEY);
      const saved = draft && FARMERS.find((f) => f.id === draft.farmerId);
      if (!draft || !saved) return;
      setFarmer(saved);
      setPrefilled(getCropSownPrefill(saved));
      setValues(draft.values);
      setNotice({ tone: "info", title: `Draft restored for ${saved.name}`, body: `Saved at ${draft.savedAt}.` });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const search = () => {
    const found = findFarmersById(query);
    setMatches(found);
    if (found.length === 1) choose(found[0]);
  };

  const choose = (f: Farmer) => {
    const prefill = getCropSownPrefill(f);
    setFarmer(f);
    setPrefilled(prefill);
    setValues(prefill);
    setTab(CROP_SOWN_FORM[0].key);
    setSubmitted(false);
    setNotice({
      tone: "success",
      title: `${Object.keys(prefill).length} fields auto-filled for ${f.name}`,
      body: "Taken from the farmer's Farmer, Land and Cluster registry records (marked Auto-filled, read-only). Enter the remaining fields.",
    });
  };

  const changeFarmer = () => {
    setFarmer(undefined);
    setMatches(null);
    setValues({});
    setPrefilled({});
    setSubmitted(false);
    setNotice(null);
  };

  /** Stores the form as a session draft; `title` names what was saved. False when storage is blocked. */
  const saveDraft = (title = "Draft saved for this session"): boolean => {
    if (!farmer) return false;
    const savedAt = now();
    try {
      writeDraft<Draft>(DRAFT_KEY, { farmerId: farmer.id, values, savedAt });
      setNotice({ tone: "success", title, body: `Saved at ${savedAt}. It will be restored if you reopen this form before signing out.` });
      return true;
    } catch {
      setNotice({ tone: "error", title: "Draft not saved", body: "This browser is blocking storage. Keep this page open, or submit the report." });
      return false;
    }
  };

  // Each stage is saved before moving on, so a closed tab or lost connection costs at most the current stage.
  const saveAndNext = () => {
    if (saveDraft(`${current.label} saved`)) goTo(tabIndex + 1);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!farmer) return;
    removeDraft(DRAFT_KEY);
    setSubmitted(true);
    const filled = Object.values(values).filter(Boolean).length;
    setNotice({
      tone: "success",
      title: `Crop report submitted for ${farmer.name}`,
      body: `${filled} fields recorded at ${now()}. Queued for sync to the Crop Sown Registry.`,
    });
  };

  const tabIndex = CROP_SOWN_FORM.findIndex((t) => t.key === tab);
  const current = CROP_SOWN_FORM[tabIndex];
  const isLast = tabIndex === CROP_SOWN_FORM.length - 1;
  const goTo = (i: number) => {
    setTab(CROP_SOWN_FORM[i].key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="px-4 py-5 shadow-card">
        <h1 className="text-[20px] font-semibold tracking-tight text-ink sm:text-[22px]">Submit Crop Report</h1>
        <p className="mt-1 text-[13.5px] text-ink-soft">
          Find the farmer by Farmer ID. Their registry details fill in automatically; complete each Crop Sown stage and submit.
        </p>
      </Card>

      {/* Step 1 — find the farmer */}
      <SectionCard title="Find farmer">
        {farmer ? (
          <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-mint px-3.5 py-3">
            <FarmerAvatar name={farmer.name} avatar={farmer.avatar} className="h-9 w-9 bg-white text-[13px]" />
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-semibold text-ink">{farmer.name}</p>
              <p className="mt-0.5 truncate text-[13px] text-slate-600">
                {registryCode(farmer)} · {farmer.kebele}, {farmer.woreda} · {farmer.crop} · {farmer.landHa} ha
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={changeFarmer}>
              Change
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <form
              className="flex flex-col gap-2.5 sm:flex-row sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                search();
              }}
            >
              <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="farmer-id" className="text-[14px] font-medium text-ink">
                  Farmer ID <span className="text-danger">*</span>
                </label>
                <Input id="farmer-id" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`e.g. ${SAMPLE_ID}`} autoComplete="off" required />
              </div>
              <Button type="submit" variant="brand" className="h-11 px-6">
                Search
              </Button>
            </form>

            {matches?.length === 0 && (
              <Banner tone="error" title={`No farmer found with ID "${query.trim()}"`}>
                Check the ID on the farmer&apos;s registration card (format FR-00000), or find them under{" "}
                <Link href="/farmers" className="font-semibold underline">My Farmers</Link>.
              </Banner>
            )}
            {matches && matches.length > 1 && (
              <ul className="overflow-hidden rounded-lg border border-line">
                <li className="border-b border-line-soft bg-surface px-3.5 py-2 text-[12.5px] text-muted">
                  {matches.length} farmers share ID {query.trim().toUpperCase()} — pick the right one
                </li>
                {matches.map((f) => (
                  <li key={f.id} className="border-b border-line-soft last:border-0">
                    <button type="button" onClick={() => choose(f)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-brand-wash">
                      <FarmerAvatar name={f.name} avatar={f.avatar} className="h-8 w-8 text-[12px]" />
                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold text-ink">{f.name}</span>
                        <span className="block truncate text-[12.5px] text-muted">{f.kebele}, {f.woreda} · {f.crop} · {f.phone}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </SectionCard>

      {notice && (
        <Banner tone={notice.tone} title={notice.title} onDismiss={() => setNotice(null)}>
          {notice.body}
          {submitted && farmer && (
            <>
              {" "}
              <Link href={`/farmers/${farmer.id}`} className="font-semibold underline">
                Open farmer profile
              </Link>
            </>
          )}
        </Banner>
      )}

      {/* Step 2 — the Crop Sown stages */}
      {farmer && (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Card className="overflow-hidden p-0 shadow-card">
            <SegmentTabs
              label="Crop Sown stages"
              tabs={CROP_SOWN_FORM.map((t) => ({
                key: t.key,
                label: t.label,
                // Fields still to enter on this stage.
                count: t.sections.reduce((n, s) => n + s.fields.filter((f) => !values[valueKey(s.id, f.key)]).length, 0),
              }))}
              active={tab}
              onChange={setTab}
            />
          </Card>

          <fieldset key={current.key} disabled={submitted} className="flex animate-fade-in flex-col gap-4 disabled:opacity-80">
            {current.sections.map((section) => (
              <SectionCard key={section.id} title={section.title}>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {section.fields.map((field) => {
                    const k = valueKey(section.id, field.key);
                    return (
                      <CropSownFieldInput
                        key={k}
                        id={k}
                        field={field}
                        value={values[k] ?? ""}
                        onChange={(v) => setValues((prev) => ({ ...prev, [k]: v }))}
                        // Registry data stays as fetched; the DA enters only what they observe on the plot.
                        autoFilled={k in prefilled}
                      />
                    );
                  })}
                </div>
              </SectionCard>
            ))}
          </fieldset>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={() => goTo(tabIndex - 1)} disabled={tabIndex === 0}>
              Previous
            </Button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => saveDraft()} disabled={submitted}>
                Save draft
              </Button>
              {isLast ? (
                <Button type="submit" variant="brand" disabled={submitted}>
                  {submitted ? "Report submitted" : "Submit crop report"}
                </Button>
              ) : (
                <Button type="button" variant="brand" onClick={saveAndNext} disabled={submitted} title={`Save and continue to ${CROP_SOWN_FORM[tabIndex + 1].label}`}>
                  Save &amp; Next
                </Button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
