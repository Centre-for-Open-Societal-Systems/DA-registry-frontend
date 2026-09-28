"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { CURRENT_AGENT } from "@/features/farmers/data";
import { AttributionCard } from "@/features/farmers/components/AttributionCard";
import type { Farmer } from "@/features/farmers/types";

interface SuggestCorrectionModalProps {
  farmer: Farmer;
  isOpen: boolean;
  onClose: () => void;
}

export function SuggestCorrectionModal({ farmer, isOpen, onClose }: SuggestCorrectionModalProps) {
  // Fields of the read-only registry record that an agent can propose a change to.
  const fields = [
    { key: "phone", label: "Mobile phone", value: farmer.phone },
    { key: "email", label: "Email address", value: farmer.email },
    { key: "kebele", label: "Kebele", value: farmer.kebele },
    { key: "woreda", label: "Woreda", value: farmer.woreda },
    { key: "crop", label: "Primary crop", value: farmer.crop },
  ];
  const [fieldKey, setFieldKey] = useState(fields[0].key);
  const current = fields.find((f) => f.key === fieldKey) ?? fields[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Suggest a correction"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="suggest-correction-form" variant="brand">
            Submit correction
          </Button>
        </>
      }
    >
      <form
        id="suggest-correction-form"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <AttributionCard name={CURRENT_AGENT.name} avatar={CURRENT_AGENT.avatar} subtitle="Today · will be attributed to you" />

        <FormField label="Field to correct" htmlFor="correction-field">
          <Select
            id="correction-field"
            className="h-10"
            value={fieldKey}
            onChange={(e) => setFieldKey(e.target.value)}
          >
            {fields.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Current value" htmlFor="correction-current">
            <Input id="correction-current" value={current.value} readOnly className="h-10 border-transparent bg-[#F1F5F9] text-[#475569]" />
          </FormField>
          <FormField label="Suggested value" htmlFor="correction-suggested">
            <Input id="correction-suggested" placeholder="Enter corrected value" className="h-10" required />
          </FormField>
        </div>

        <FormField label="Reason for correction" htmlFor="correction-reason">
          <Textarea id="correction-reason" rows={2} placeholder="e.g. Farmer provided a new phone number during last visit." required />
        </FormField>

        <Banner tone="info">
          This record is sourced from the Farmer Registry and is read-only here. Your suggestion will be routed to the
          Registry team for review.
        </Banner>
      </form>
    </Modal>
  );
}
