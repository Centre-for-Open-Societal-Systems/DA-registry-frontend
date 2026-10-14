"use client";

import { useRouter } from "next/navigation";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BulkImportSteps } from "./BulkImportSteps";
import { EntryModeSwitch } from "./EntryModeSwitch";
import { ManualEntrySteps } from "./ManualEntrySteps";
import { useKpiEntryForm } from "./useKpiEntryForm";

export function KpiEntryForm() {
  const router = useRouter();
  const k = useKpiEntryForm();

  return (
    <div className="flex flex-col gap-4">
      <EntryModeSwitch mode={k.mode} onChange={k.changeMode} />

      {k.notice && (
        <Banner tone={k.notice.tone} onDismiss={() => k.setNotice(null)}>
          {k.notice.text}
        </Banner>
      )}

      {k.mode === "bulk" ? (
        <BulkImportSteps fileInputRef={k.fileInputRef} file={k.file} fileError={k.fileError} onPick={k.pickFile} onRemove={k.removeFile} onNotice={k.setNotice} />
      ) : (
        <ManualEntrySteps form={k.form} errors={k.errors} setField={k.setField} />
      )}

      {/* Footer actions */}
      <Card className="flex flex-col-reverse gap-3 px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={k.saveDraft}>
          Save Draft
        </Button>
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => router.push("/performance")}>
            Cancel
          </Button>
          <Button type="button" variant="brand" onClick={k.submit}>
            Submit Entry
          </Button>
        </div>
      </Card>
    </div>
  );
}
