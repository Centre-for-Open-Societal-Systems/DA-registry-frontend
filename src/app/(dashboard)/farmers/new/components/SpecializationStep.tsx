"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { CertificateDocuments } from "@/features/farmers/components/CertificateDocuments";
import { EDUCATION_TIERS, SAMPLE_CERTIFICATES, SPECIALIZATIONS, type Certificate } from "@/features/farmers/qualifications";

export function SpecializationStep() {
  const [certificates, setCertificates] = useState<Certificate[]>(SAMPLE_CERTIFICATES);

  return (
    <Card className="min-h-[480px] p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#E5E7EB] px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Specialization &amp; qualifications</h2>
      </div>

      <form className="flex flex-col gap-6 px-5 py-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label="Education tier" htmlFor="educationTier" required>
            <Select id="educationTier" name="educationTier" defaultValue="Diploma">
              {EDUCATION_TIERS.map((tier) => (
                <option key={tier} value={tier}>{tier}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Specialization" htmlFor="specialization" required>
            <Select id="specialization" name="specialization" defaultValue={SPECIALIZATIONS[0]}>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </FormField>
        </div>

        <CertificateDocuments certificates={certificates} onAdd={(added) => setCertificates((prev) => [...prev, ...added])} />
      </form>
    </Card>
  );
}
