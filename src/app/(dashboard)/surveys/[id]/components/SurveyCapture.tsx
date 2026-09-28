"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { FARMERS } from "@/features/farmers/data";
import { RESPONSE_TONE, type Parameter, type ResponseStatus, type SurveyTask } from "@/features/surveys/data";
import { cn } from "@/lib/utils";

type Answers = Record<string, string | string[]>;

const DA_KEBELE = "Bako 01";

// FR-09d DA mobile response task: assigned survey + template version, farmer/context identification, consent/attestation,
// question-by-question capture, save/resume offline, survey-specific queued/synced status, one-response-per-farmer guard.
export function SurveyCapture({ task }: { task: SurveyTask }) {
  const [answered, setAnswered] = useState<Set<string>>(new Set(task.answered));
  const [farmerId, setFarmerId] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [status, setStatus] = useState<ResponseStatus | "In progress" | "Declined" | null>(null);

  const farmer = FARMERS.find((f) => f.id === farmerId);
  const duplicate = Boolean(farmerId && answered.has(farmerId));

  // Skip logic: hide parameters whose condition isn't met
  const visibleParams = useMemo(
    () => task.parameters.filter((p) => !p.condition || answers[p.condition.parameterId] === p.condition.equals),
    [task.parameters, answers],
  );
  const current = visibleParams[step];
  const started = status === "In progress";

  const prefillFor = (p: Parameter) => (p.prefill === "Farmer Registry" ? farmer?.id ?? "" : p.prefill === "DA assignment" ? DA_KEBELE : "");
  const valueOf = (p: Parameter) => (p.type === "auto" ? prefillFor(p) : answers[p.id]);
  const isAnswered = (p: Parameter) => {
    const v = valueOf(p);
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  };
  const canContinue = current ? !current.required || isAnswered(current) : false;

  const set = (id: string, v: string | string[]) => setAnswers((a) => ({ ...a, [id]: v }));

  const start = () => {
    setAnswers({});
    setStep(0);
    setStatus("In progress");
  };

  const next = () => {
    if (!current) return;
    // Consent gating: a declined consent terminates the response
    if (current.type === "consent" && answers[current.id] === "declined") {
      setStatus("Declined");
      return;
    }
    if (step < visibleParams.length - 1) setStep(step + 1);
    else finish();
  };

  const finish = () => {
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    setAnswered((prev) => new Set(prev).add(farmerId));
    setStatus(offline ? "Queued" : "Synced");
  };

  const saveDraft = () => setStatus("Draft");

  const progress = started ? Math.round(((step + 1) / visibleParams.length) * 100) : 0;

  return (
    <div className="flex w-full flex-col gap-4">
      <Link href="/surveys" className="inline-flex w-fit items-center gap-2.5 text-[15px] font-medium text-[#1a2b3c] transition-colors hover:text-brand-green">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to Surveys
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        {/* Task context */}
        <Card className="shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
          <h1 className="text-[18px] font-semibold leading-tight text-[#1a2b3c]">{task.name}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5"><Pill tone="blue">Template {task.templateVersion}</Pill><Pill tone="slate">{task.type}</Pill><Pill tone="green">~{task.estMinutes} min</Pill></div>
          <dl className="mt-4 space-y-2 text-[13px]">
            <div><dt className="text-[11.5px] font-semibold uppercase tracking-wider text-[#64748b]">Window</dt><dd className="text-[#1a2b3c]">{task.window.open} → {task.window.close}</dd></div>
            <div><dt className="text-[11.5px] font-semibold uppercase tracking-wider text-[#64748b]">Languages</dt><dd className="text-[#1a2b3c]">{task.languages.join(" · ")}</dd></div>
            <div><dt className="text-[11.5px] font-semibold uppercase tracking-wider text-[#64748b]">Progress</dt><dd className="text-[#1a2b3c]">{task.collected + (status === "Synced" || status === "Queued" ? 1 : 0)} of {task.targetFarmers} farmers · {task.queued + (status === "Queued" ? 1 : 0)} queued on device</dd></div>
          </dl>

          <div className="mt-5">
            <label htmlFor="farmer" className="text-[14px] font-medium text-[#1a2b3c]">Farmer</label>
            <Select id="farmer" value={farmerId} disabled={started} onChange={(e) => { setFarmerId(e.target.value); setStatus(null); }} className="mt-1.5">
              <option value="">Select farmer…</option>
              {FARMERS.map((f) => <option key={f.id} value={f.id}>{f.name} — {f.kebele}{answered.has(f.id) ? " (answered)" : ""}</option>)}
            </Select>
            {duplicate && <p className="mt-1.5 text-[12.5px] font-medium text-[#DC2626]">A response for this farmer already exists for this survey — one response per farmer.</p>}
          </div>

          {!started && (
            <Button type="button" variant="brand" disabled={!farmerId || duplicate || task.status === "Closed"} onClick={start} className="mt-4 w-full">
              {status === "Draft" ? "Resume draft" : "Start response"}
            </Button>
          )}
          {status && status !== "In progress" && status !== "Declined" && (
            <div className="mt-4 flex items-center gap-2 text-[13px]"><span className="text-[#64748b]">Response status</span><Pill tone={RESPONSE_TONE[status]} dot>{status}</Pill></div>
          )}
        </Card>

        {/* Capture */}
        <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
          {status === "Synced" || status === "Queued" ? (
            <div className="p-5">
              <Banner tone={status === "Synced" ? "success" : "warning"} title={status === "Synced" ? "Response synced" : "Response queued on this device"}>
                {status === "Synced"
                  ? `Response for ${farmer?.name} uploaded and counted toward ${task.name}. Duplicate protection now blocks a second response for this farmer.`
                  : `No connectivity — the response for ${farmer?.name} is stored on the device and will upload on reconnection. It is already counted as collected and the farmer is locked against duplicates.`}
              </Banner>
              <Button type="button" variant="brandOutline" onClick={() => { setFarmerId(""); setStatus(null); setAnswers({}); setStep(0); }} className="mt-4">Next farmer</Button>
            </div>
          ) : status === "Declined" ? (
            <div className="p-5">
              <Banner tone="info" title="Consent declined — response ended">Nothing is recorded beyond the declined consent and timestamp. The farmer is not counted as a respondent and can be asked again later.</Banner>
              <Button type="button" variant="outline" onClick={() => { setStatus(null); setAnswers({}); setStep(0); }} className="mt-4">Back</Button>
            </div>
          ) : status === "Draft" ? (
            <div className="p-5">
              <Banner tone="info" title="Draft saved on this device">Progress for {farmer?.name} is kept offline. Resume from the left panel; nothing is uploaded until the response is completed.</Banner>
            </div>
          ) : !started || !current ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 p-8 text-center">
              <p className="text-[15px] font-semibold text-[#1a2b3c]">Select a farmer to begin</p>
              <p className="max-w-md text-[13.5px] text-[#4a5568]">{task.parameters.length} questions · consent first, registry fields pre-filled and read-only, skip logic applied automatically.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
                <span className="text-[13px] font-medium text-[#4a5568]">Question {step + 1} of {visibleParams.length}</span>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-32 rounded-full bg-[#E2E8F0]"><div className="h-1.5 rounded-full bg-brand-green transition-all" style={{ width: `${progress}%` }} /></div>
                  <Pill tone="slate">{current.type}</Pill>
                </div>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <p className="text-[17px] font-semibold leading-snug text-[#1a2b3c]">{current.prompt}{current.required && <span className="ml-1 text-[#DC2626]">*</span>}</p>
                {current.helper && <p className="-mt-2 text-[13px] text-[#64748b]">{current.helper}</p>}
                <QuestionInput param={current} value={valueOf(current)} onChange={(v) => set(current.id, v)} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E7EB] bg-[#F8FAFC] px-5 py-3">
                <button type="button" onClick={saveDraft} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center rounded-md border border-zinc-200 bg-white px-3.5 text-[13.5px] font-medium text-[#1a2b3c] transition-colors hover:bg-zinc-50">Save draft</button>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center rounded-md border border-zinc-200 bg-white px-3.5 text-[13.5px] font-medium text-[#1a2b3c] transition-colors hover:bg-zinc-50 disabled:opacity-50">Back</button>
                  <button type="button" disabled={!canContinue} onClick={next} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark disabled:opacity-50">
                    {current.type === "consent" && answers[current.id] === "declined" ? "End response" : step === visibleParams.length - 1 ? "Submit response" : "Save & continue"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function QuestionInput({ param, value, onChange }: { param: Parameter; value: string | string[] | undefined; onChange: (v: string | string[]) => void }) {
  const str = typeof value === "string" ? value : "";
  const arr = Array.isArray(value) ? value : [];
  const option = (label: string, selected: boolean, onClick: () => void) => (
    <button key={label} type="button" onClick={onClick} className={cn("flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-[14px] transition-all", selected ? "border-brand-green bg-[#F0FAF5] text-brand-green" : "border-[#E5E7EB] bg-white text-[#1a2b3c] hover:border-brand-green/30 hover:shadow-sm")}>
      {label}
    </button>
  );

  switch (param.type) {
    case "consent":
      return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {option("Farmer consents — continue", str === "granted", () => onChange("granted"))}
          {option("Farmer declines — end response", str === "declined", () => onChange("declined"))}
        </div>
      );
    case "auto":
      return <input readOnly value={str} className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 font-mono text-sm text-[#4a5568]" aria-label={`${param.prompt} (pre-filled from ${param.prefill})`} />;
    case "lookup":
    case "single":
      return <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{param.options?.map((o) => option(o, str === o, () => onChange(o)))}</div>;
    case "multi":
      return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {param.options?.map((o) => (
            <label key={o} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-[14px]", arr.includes(o) ? "border-brand-green bg-[#F0FAF5]" : "border-[#E5E7EB] bg-white")}>
              <Checkbox checked={arr.includes(o)} onChange={() => onChange(arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o])} /> {o}
            </label>
          ))}
        </div>
      );
    case "rating":
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => onChange(String(n))} aria-label={`${n} of 5`} className={cn("flex h-12 w-12 items-center justify-center rounded-lg border text-[16px] font-semibold transition-colors", str === String(n) ? "border-brand-green bg-brand-green text-white" : "border-[#E5E7EB] bg-white text-[#1a2b3c] hover:border-brand-green")}>{n}</button>
          ))}
        </div>
      );
    case "text":
      return <Textarea rows={4} maxLength={500} value={str} onChange={(e) => onChange(e.target.value)} />;
  }
}
