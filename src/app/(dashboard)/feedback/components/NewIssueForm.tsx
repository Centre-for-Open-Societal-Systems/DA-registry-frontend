"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import {
  ISSUE_CATEGORIES,
  ISSUE_SEVERITIES,
  RELATED_OPTIONS,
  type IssueCategory,
  type IssueSeverity,
} from "../types";

export interface NewIssueInput {
  category: IssueCategory;
  severity: IssueSeverity;
  subject: string;
  description: string;
  relatedTo?: string;
}

interface NewIssueFormProps {
  onSubmit: (issue: NewIssueInput) => void;
}

// Selected-state colours per severity: green / amber / red
const SEVERITY_ACTIVE: Record<IssueSeverity, string> = {
  Low: "border-brand-green bg-[#EBFAF2] text-brand-green",
  Medium: "border-[#D97706] bg-[#FFFBEB] text-[#B45309]",
  High: "border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]",
};

// Draft kept on this device (the form already works offline); cleared once the issue is submitted.
const DRAFT_KEY = "oan:new-issue-draft";
const DRAFT_FIELDS = ["category", "subject", "description", "relatedTo"] as const;

interface IssueDraft {
  fields: Partial<Record<(typeof DRAFT_FIELDS)[number], string>>;
  severity: IssueSeverity;
  attachments: string[];
  savedAt: string;
}

const formatTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const removeDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // storage unavailable — nothing to clear
  }
};

export function NewIssueForm({ onSubmit }: NewIssueFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [severity, setSeverity] = useState<IssueSeverity>("High");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ tone: "success" | "info" | "error"; text: string } | null>(null);

  // Restore a saved draft once mounted (deferred a tick so server and first client render match).
  useEffect(() => {
    const t = setTimeout(() => {
      let draft: IssueDraft | null = null;
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        draft = raw ? (JSON.parse(raw) as IssueDraft) : null;
      } catch {
        draft = null;
      }
      const form = formRef.current;
      if (!draft || !form) return;
      for (const name of DRAFT_FIELDS) {
        const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
        const value = draft.fields[name];
        if (el && value !== undefined) el.value = value;
      }
      setSeverity(draft.severity);
      setAttachments(draft.attachments ?? []);
      setNotice({ tone: "info", text: `Draft from ${formatTime(draft.savedAt)} restored.` });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const handleSaveDraft = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const draft: IssueDraft = {
      fields: Object.fromEntries(DRAFT_FIELDS.map((name) => [name, String(data.get(name) ?? "")])),
      severity,
      attachments,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setNotice({
        tone: "success",
        text: `Draft saved on this device at ${formatTime(draft.savedAt)}.${attachments.length ? " Attachment names are kept — re-attach the files before submitting." : ""}`,
      });
    } catch {
      setNotice({ tone: "error", text: "Couldn't save the draft — browser storage is unavailable (private mode or storage full)." });
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const subject = String(data.get("subject") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    if (!subject || !description) return;

    onSubmit({
      category: data.get("category") as IssueCategory,
      severity,
      subject,
      description,
      relatedTo: String(data.get("relatedTo") ?? "") || undefined,
    });
    form.reset();
    setSeverity("Medium");
    setAttachments([]);
    removeDraft();
    setNotice(null);
  };

  return (
    <Card className="flex h-full flex-col p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#E5E7EB] px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-[#1a2b3c]">New issue</h2>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 px-4 py-4">
        <FormField
          label="Category"
          htmlFor="category"
          required
          hint={ISSUE_CATEGORIES.join(" · ")}
        >
          <Select id="category" name="category" defaultValue="Equipment / supplies">
            {ISSUE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </FormField>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-[14px] font-medium text-[#1a2b3c]">
            Severity<span className="ml-1 text-[#DC2626]">*</span>
          </legend>
          <div className="mt-2 flex gap-2">
            {ISSUE_SEVERITIES.map((level) => {
              const isActive = severity === level;
              return (
                <button
                  key={level}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSeverity(level)}
                  className={cn(
                    "h-8 rounded-full border px-4 text-[13.5px] font-medium transition-colors",
                    isActive ? SEVERITY_ACTIVE[level] : "border-[#E5E7EB] bg-white text-[#1a2b3c] hover:bg-[#F8FAFC]"
                  )}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </fieldset>

        <FormField label="Subject" htmlFor="subject" required>
          <Input id="subject" name="subject" placeholder="Short summary of the issue" required />
        </FormField>

        <FormField label="Description" htmlFor="description" required>
          <Textarea
            id="description"
            name="description"
            rows={3}
            placeholder="What happened, since when, and what it is blocking"
            required
          />
        </FormField>

        <FormField label="Related to (optional)" htmlFor="relatedTo">
          <Select id="relatedTo" name="relatedTo" defaultValue="">
            <option value="">Not related to a specific record</option>
            {RELATED_OPTIONS.filter((o) => !o.startsWith("Not related")).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Select>
        </FormField>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#D1D5DB] bg-[#F8FAFC] text-[14px] text-[#1a2b3c] transition-colors hover:border-brand-green/50 hover:bg-[#F3F4F6]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add photo or document
          </button>
          {attachments.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {attachments.map((name) => (
                <li key={name} className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[12px] text-[#4a5568]">{name}</li>
              ))}
            </ul>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              setAttachments((prev) => [...prev, ...Array.from(e.target.files ?? []).map((f) => f.name)]);
              e.target.value = "";
            }}
          />
        </div>

        <div className="mt-auto flex flex-col gap-4">
          {notice && <Banner tone={notice.tone} onDismiss={() => setNotice(null)}>{notice.text}</Banner>}
          <Banner tone="warning">Works offline — saved to device and queued until the app next syncs.</Banner>

          {/* Stacked full-width on phones so neither label wraps; side by side from sm up */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
            <Button type="button" variant="outline" onClick={handleSaveDraft} className="whitespace-nowrap sm:shrink-0">
              Save draft
            </Button>
            <Button type="submit" variant="brand" className="whitespace-nowrap sm:flex-1">
              Submit to supervisor
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
