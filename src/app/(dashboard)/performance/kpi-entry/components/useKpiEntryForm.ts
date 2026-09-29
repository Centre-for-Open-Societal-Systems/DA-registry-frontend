import { useEffect, useRef, useState } from "react";
import { readDraft, removeDraft, writeDraft } from "@/lib/drafts";
import {
  DRAFT_KEY,
  importFileError,
  INITIAL_FORM,
  validateManualForm,
  type FormErrors,
  type ManualForm,
  type Mode,
  type Notice,
} from "./kpiEntry";

// Mode, import file, manual form and draft handling for the KPI entry page.
export function useKpiEntryForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("bulk");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [form, setForm] = useState<ManualForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<Notice | null>(null);

  // Restore a saved manual-entry draft (deferred a tick so server and first client render match).
  useEffect(() => {
    const t = setTimeout(() => {
      const draft = readDraft<{ form: ManualForm; savedAt: string }>(DRAFT_KEY);
      if (!draft) return;
      setForm({ ...INITIAL_FORM, ...draft.form });
      setMode("manual");
      setNotice({ tone: "success", text: `Draft from ${new Date(draft.savedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} restored.` });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const changeMode = (next: Mode) => {
    setMode(next);
    setNotice(null);
  };

  const saveDraft = () => {
    if (mode === "bulk") {
      setNotice({ tone: "success", text: file ? `${file.name} stays selected on this page — submit it to queue the import. Only manual entries are saved as drafts.` : "Nothing to save yet — bulk imports are submitted as a file. Switch to Manual Form Entry to save a draft." });
      return;
    }
    try {
      writeDraft(DRAFT_KEY, { form, savedAt: new Date().toISOString() });
      setNotice({ tone: "success", text: `Draft for ${form.agent} saved for this session. It reopens here until you sign out or close the tab.` });
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
    const error = importFileError(picked);
    if (error) {
      setFileError(error);
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
    const next = validateManualForm(form);
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
    removeDraft(DRAFT_KEY);
  };

  return { fileInputRef, mode, changeMode, file, fileError, pickFile, removeFile, form, errors, setField, notice, setNotice, saveDraft, submit };
}
