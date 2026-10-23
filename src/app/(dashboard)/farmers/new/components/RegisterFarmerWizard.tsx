"use client";

import { useEffect, useRef, useState } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Banner } from "@/components/ui/Banner";
import { readDraft, removeDraft, writeDraft } from "@/lib/drafts";
import { REGISTRATION_STEPS, TOTAL_STEPS } from "../steps";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stepper } from "./Stepper";
import { EnumeratorStep } from "./EnumeratorStep";
import { LocationStep } from "./LocationStep";
import { RegistryStep } from "./RegistryStep";
import { REGISTRY_TABS } from "../registrySpec";
import { farmerFullName, ReviewStep, tabCompletion } from "./ReviewStep";
import { SubmitConfirmModal } from "./SubmitConfirmModal";
import { SubmittedHeader, SubmittedStep, type Submission } from "./SubmittedStep";
import { WizardFooter } from "./WizardFooter";

// Placeholder until the registry returns the real farmer ID
function generateFarmerId() {
  return `FRM-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0")}`;
}

// Draft kept for this browser session only (see lib/drafts). Every step's named fields are captured.
const DRAFT_KEY = "farmer-registration";

interface WizardDraft {
  step: number;
  fields: Record<string, string>;
  savedAt: string;
}

type FieldEl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const fieldsIn = (root: HTMLElement | null) =>
  Array.from(root?.querySelectorAll<FieldEl>("input[name], select[name], textarea[name]") ?? []).filter((el) => el.type !== "file" && el.type !== "checkbox");

const formatTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const clearDraft = () => removeDraft(DRAFT_KEY);

export function RegisterFarmerWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "info" | "error"; text: string; restored?: boolean } | null>(null);
  // Restored/captured values keyed by field name; bumping `restoreKey` remounts the step so it re-reads them.
  const fieldsRef = useRef<Record<string, string>>({});
  const [restoreKey, setRestoreKey] = useState(0);
  // Render-safe copy of fieldsRef for controlled steps (LocationStep) to start from.
  const [fieldsSnapshot, setFieldsSnapshot] = useState<Record<string, string>>({});
  const stepRef = useRef<HTMLDivElement>(null);

  const stepLabel = REGISTRATION_STEPS[currentStep - 1].label;
  const isLastStep = currentStep === TOTAL_STEPS;

  // Reads the visible step's fields into the draft before it unmounts.
  const captureStep = () => {
    for (const el of fieldsIn(stepRef.current)) fieldsRef.current[el.name] = el.value;
    setFieldsSnapshot({ ...fieldsRef.current });
  };

  // Puts saved values back into the step's uncontrolled fields (controlled ones read `initial`).
  useEffect(() => {
    for (const el of fieldsIn(stepRef.current)) {
      const value = fieldsRef.current[el.name];
      if (value !== undefined && el.value !== value) el.value = value;
    }
  }, [currentStep, restoreKey]);

  // Autosave: every few seconds, write the draft if the form changed since the last write. The first pass only records
  // the untouched form, so opening the page does not create a draft by itself.
  const lastSnapshot = useRef<string | null>(null);
  useEffect(() => {
    const save = () => {
      const fields = { ...fieldsRef.current };
      for (const el of fieldsIn(stepRef.current)) fields[el.name] = el.value;
      const snapshot = JSON.stringify([currentStep, fields]);
      if (snapshot === lastSnapshot.current) return;
      const baseline = lastSnapshot.current === null;
      lastSnapshot.current = snapshot;
      if (baseline) return;
      const draft: WizardDraft = { step: currentStep, fields, savedAt: new Date().toISOString() };
      try {
        writeDraft(DRAFT_KEY, draft);
        setSavedAt(draft.savedAt);
      } catch {
        // Storage unavailable: the Save Draft button reports it when the agent asks.
      }
    };
    save();
    const timer = setInterval(save, 4000);
    return () => clearInterval(timer);
  }, [currentStep]);

  // Restore a saved draft on load (deferred a tick so the server render and first client render match).
  useEffect(() => {
    const t = setTimeout(() => {
      const draft = readDraft<WizardDraft>(DRAFT_KEY);
      if (!draft) return;
      fieldsRef.current = draft.fields ?? {};
      setFieldsSnapshot({ ...fieldsRef.current });
      setCurrentStep(Math.min(Math.max(draft.step, 1), TOTAL_STEPS));
      setSavedAt(draft.savedAt);
      setRestoreKey((k) => k + 1);
      setNotice({ tone: "info", text: `Draft restored from ${formatTime(draft.savedAt)} — you're back on step ${draft.step}.`, restored: true });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const goNext = () => { captureStep(); setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS)); };
  const goBack = () => { captureStep(); setCurrentStep((s) => Math.max(s - 1, 1)); };
  const goToStep = (step: number) => { captureStep(); setCurrentStep(Math.min(Math.max(step, 1), TOTAL_STEPS)); };

  const handleSaveDraft = () => {
    captureStep();
    const draft: WizardDraft = { step: currentStep, fields: fieldsRef.current, savedAt: new Date().toISOString() };
    try {
      writeDraft(DRAFT_KEY, draft);
      setSavedAt(draft.savedAt);
      setNotice({ tone: "success", text: `Draft saved for this session at ${formatTime(draft.savedAt)}. It will reopen on step ${currentStep} next time you start a registration.` });
    } catch {
      setNotice({ tone: "error", text: "Couldn't save the draft — browser storage is unavailable (private mode or storage full)." });
    }
  };

  const discardDraft = () => {
    clearDraft();
    fieldsRef.current = {};
    setFieldsSnapshot({});
    setSavedAt(null);
    setCurrentStep(1);
    setRestoreKey((k) => k + 1);
    setNotice({ tone: "success", text: "Draft discarded — starting a new registration." });
  };

  // The submit button asks first; confirming in the popup sends the registration.
  const handleSubmit = () => setConfirming(true);

  const confirmSubmit = () => {
    clearDraft();
    setConfirming(false);
    setSubmission({ farmerId: generateFarmerId(), submittedAt: new Date().toISOString() });
  };

  const registerAnother = () => {
    fieldsRef.current = {};
    lastSnapshot.current = null;
    setFieldsSnapshot({});
    setSavedAt(null);
    setNotice(null);
    setCurrentStep(1);
    setRestoreKey((k) => k + 1);
    setSubmission(null);
  };

  // Submitted state: header swaps to the confirmation banner, stepper is fully
  // complete, and there's no footer / back link to navigate away with.
  if (submission) {
    return (
      <div className="flex w-full flex-col gap-4">
        <SubmittedHeader />
        <Stepper currentStep={TOTAL_STEPS + 1} />
        <SubmittedStep
          submission={submission}
          farmerName={farmerFullName(fieldsSnapshot)}
          location={[fieldsSnapshot.region, fieldsSnapshot.zone, fieldsSnapshot.woreda, fieldsSnapshot.kebele].filter(Boolean).join(" › ")}
          onRegisterAnother={registerAnother}
        />
      </div>
    );
  }

  const renderStep = () => {
    const tab = REGISTRY_TABS[currentStep - 1];
    if (!tab) {
      return <ReviewStep values={fieldsSnapshot} onEditStep={goToStep} />;
    }
    if (tab.key === "location") return <LocationStep initial={fieldsSnapshot} />;
    if (tab.key === "enumerator") return <EnumeratorStep initial={fieldsSnapshot} />;
    return <RegistryStep key={tab.key} tab={tab} initial={fieldsSnapshot} />;
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Step 1 leaves the wizard for the farmers list; later steps go back one step */}
      {currentStep > 1 ? <BackLink onClick={goBack} /> : <BackLink href="/farmers" />}

      <PageHeader title="Register a farmer" description={`Step ${currentStep} of ${TOTAL_STEPS} - ${stepLabel}`} />
      <Stepper currentStep={currentStep} />

      {notice && (
        <Banner tone={notice.tone} onDismiss={() => setNotice(null)}>
          {notice.text}
          {notice.restored && (
            <button type="button" onClick={discardDraft} className="ml-2 font-semibold underline">Discard draft</button>
          )}
        </Banner>
      )}

      <div ref={stepRef} key={restoreKey}>{renderStep()}</div>

      <WizardFooter
        onSaveDraft={handleSaveDraft}
        savedAt={savedAt ? formatTime(savedAt) : null}
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onBack={goBack}
        onNext={isLastStep ? handleSubmit : goNext}
        nextLabel={isLastStep ? "Submit registration" : "Next Step"}
        nextIcon={isLastStep ? "check" : "arrow"}
      />

      {confirming && (
        <SubmitConfirmModal
          farmerName={farmerFullName(fieldsSnapshot)}
          place={[fieldsSnapshot.woreda, fieldsSnapshot.kebele].filter(Boolean).join(", ")}
          completeTabs={tabCompletion(fieldsSnapshot).complete}
          totalTabs={tabCompletion(fieldsSnapshot).total}
          onCancel={() => setConfirming(false)}
          onConfirm={confirmSubmit}
        />
      )}
    </div>
  );
}
