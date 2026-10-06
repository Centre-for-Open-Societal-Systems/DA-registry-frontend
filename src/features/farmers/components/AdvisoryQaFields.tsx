"use client";

import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { AdvisoryQa } from "./planVisit";

interface AdvisoryQaFieldsProps {
  items: AdvisoryQa[];
  onChange: (items: AdvisoryQa[]) => void;
}

// Advisory visit: the farmer's questions and the advice to give, one card per question.
export function AdvisoryQaFields({ items, onChange }: AdvisoryQaFieldsProps) {
  const update = (id: number, patch: Partial<AdvisoryQa>) => onChange(items.map((qa) => (qa.id === id ? { ...qa, ...patch } : qa)));
  const remove = (id: number) => onChange(items.filter((qa) => qa.id !== id));
  const add = () => onChange([...items, { id: Math.max(0, ...items.map((qa) => qa.id)) + 1, question: "", answer: "" }]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-medium text-ink">
          Questions &amp; answers <span className="text-danger">*</span>
        </p>
        <span className="text-[12.5px] text-muted">{items.length} question{items.length === 1 ? "" : "s"}</span>
      </div>

      {items.map((qa, i) => (
        <div key={qa.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface-alt p-3.5">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-brand-mint px-2.5 py-0.5 text-[12px] font-semibold text-brand-green">Q{i + 1}</span>
            {items.length > 1 && (
              <button type="button" onClick={() => remove(qa.id)} className="text-[12.5px] font-medium text-danger hover:underline">
                Remove
              </button>
            )}
          </div>
          <FormField label="Question" htmlFor={`qa-question-${qa.id}`} required>
            <Input
              id={`qa-question-${qa.id}`}
              className="h-10 bg-white"
              value={qa.question}
              onChange={(e) => update(qa.id, { question: e.target.value })}
              placeholder="What does the farmer want to know?"
              required
            />
          </FormField>
          <FormField label="Answer / advice" htmlFor={`qa-answer-${qa.id}`} hint="Can be completed during the visit.">
            <Textarea
              id={`qa-answer-${qa.id}`}
              rows={2}
              className="bg-white"
              value={qa.answer}
              onChange={(e) => update(qa.id, { answer: e.target.value })}
              placeholder="Advice to give the farmer"
            />
          </FormField>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dashed border-brand-green/50 text-[13.5px] font-semibold text-brand-green transition-colors hover:bg-brand-wash"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add question
      </button>
    </div>
  );
}
