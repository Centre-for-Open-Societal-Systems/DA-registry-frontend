"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { ProfilePhotoUpload } from "@/features/farmers";
import { isFieldVisible, type RegistryField, type RegistryTab } from "../registrySpec";

const INPUT_TYPE = { text: "text", number: "number", date: "date", tel: "tel", select: "text" } as const;

function Field({ field, value, onChange }: { field: RegistryField; value: string; onChange: (value: string) => void }) {
  return (
    <FormField label={field.label} htmlFor={field.name} required={field.required} hint={field.hint}>
      {field.type === "select" ? (
        <Select id={field.name} name={field.name} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="" disabled>{`Select ${field.label.toLowerCase()}`}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </Select>
      ) : (
        <Input
          id={field.name}
          name={field.name}
          type={INPUT_TYPE[field.type]}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.type === "tel" ? "+251 9XXXXXXXX" : `Enter ${field.label.toLowerCase()}`}
        />
      )}
    </FormField>
  );
}

/** One Farmer Registry tab as a card per section. `initial` restores a saved draft (field name → value). */
export function RegistryStep({ tab, initial = {} }: { tab: RegistryTab; initial?: Record<string, string> }) {
  const [values, setValues] = useState(initial);
  const set = (name: string) => (value: string) => setValues((current) => ({ ...current, [name]: value }));

  return (
    <div className="flex flex-col gap-4">
      {tab.sections.map((section) => {
        const withPhoto = tab.key === "farmer" && section.title === "Personal Information";
        return (
          <Card key={section.title} className="p-0 shadow-card">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[15px] font-semibold text-ink">{section.title}</h2>
            </div>

            <div className={withPhoto ? "grid grid-cols-1 gap-8 px-5 py-5 lg:grid-cols-[250px_1fr]" : "px-5 py-5"}>
              {withPhoto && <ProfilePhotoUpload />}
              <div className="grid grid-cols-1 content-start gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
                {section.fields.filter((field) => isFieldVisible(field, values)).map((field) => (
                  <Field key={field.name} field={field} value={values[field.name] ?? ""} onChange={set(field.name)} />
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
