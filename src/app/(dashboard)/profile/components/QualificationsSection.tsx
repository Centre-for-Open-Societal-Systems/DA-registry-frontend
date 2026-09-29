"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { CertificateDocuments } from "@/features/farmers";
import { EDUCATION_TIERS, SAMPLE_CERTIFICATES, SPECIALIZATIONS, type Certificate } from "@/features/farmers";
import { LEARNING_SUMMARY } from "@/features/farmers";
import { UploadCertificateModal } from "./UploadCertificateModal";

export function QualificationsSection() {
  const [certificates, setCertificates] = useState<Certificate[]>(SAMPLE_CERTIFICATES);
  const [isUploading, setIsUploading] = useState(false);

  const addCertificates = (added: Certificate[]) => setCertificates((prev) => [...prev, ...added]);
  const learning = LEARNING_SUMMARY;

  return (
    <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Qualifications &amp; learning</h2>
          <p className="mt-1 text-[12.5px] text-ink-soft">Learning completion is reflected from Agrilearn</p>
        </div>
        <Button type="button" variant="brand" size="md" onClick={() => setIsUploading(true)} className="w-fit shrink-0 gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          Upload certificate
        </Button>
      </div>

      <form className="flex flex-col gap-5 px-5 py-5" onSubmit={(e) => e.preventDefault()}>
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

        {/* Read-only learning summary mirrored from Agrilearn */}
        <div className="flex flex-col gap-3 rounded-lg bg-blue-50 px-4 py-3.5 md:flex-row md:items-center">
          <Pill tone="blue" className="w-fit shrink-0">Agrilearn</Pill>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-ink">
              Learning completion — {learning.completed} of {learning.assigned} assigned courses complete ·{" "}
              {learning.certificationsCurrent} certifications current
            </p>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">{learning.note}</p>
          </div>
          <a
            href={learning.agrilearnUrl}
            className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-blue-700 hover:underline"
          >
            View in Agrilearn
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </a>
        </div>

        <CertificateDocuments certificates={certificates} onAdd={addCertificates} className="border-t border-line pt-5" />
      </form>

      <UploadCertificateModal isOpen={isUploading} onClose={() => setIsUploading(false)} onSubmit={(cert) => addCertificates([cert])} />
    </Card>
  );
}
