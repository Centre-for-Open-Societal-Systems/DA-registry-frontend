"use client";

import type { ChangeEvent } from "react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { OutcomeValues } from "./logOutcome";

interface OutcomeFieldsProps {
  values: OutcomeValues;
  set: (key: keyof OutcomeValues) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function OutcomeFields({ values, set }: OutcomeFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Visit purpose" htmlFor="outcome-purpose">
          <Input id="outcome-purpose" value={values.purpose} onChange={set("purpose")} className="h-10" />
        </FormField>
        <FormField label="Farmer response" htmlFor="outcome-response">
          <Input id="outcome-response" value={values.farmerResponse} onChange={set("farmerResponse")} className="h-10" />
        </FormField>
      </div>

      <FormField label="What was observed" htmlFor="outcome-observed">
        <Textarea id="outcome-observed" rows={2} value={values.observed} onChange={set("observed")} />
      </FormField>

      <FormField label="Advice given" htmlFor="outcome-advice">
        <Textarea id="outcome-advice" rows={2} value={values.advice} onChange={set("advice")} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Inputs / actions logged" htmlFor="outcome-inputs">
          <Input id="outcome-inputs" value={values.inputs} onChange={set("inputs")} className="h-10" />
        </FormField>
        <FormField label="Next action & date" htmlFor="outcome-next">
          <Input id="outcome-next" value={values.nextAction} onChange={set("nextAction")} className="h-10" />
        </FormField>
      </div>
    </>
  );
}
