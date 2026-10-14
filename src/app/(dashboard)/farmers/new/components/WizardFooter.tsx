import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface WizardFooterProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  onSaveDraft?: () => void;
  /** Time of the last saved draft, shown next to the save button. */
  savedAt?: string | null;
}

export function WizardFooter({
  currentStep,
  onBack,
  onNext,
  nextLabel = "Next Step",
  nextDisabled = false,
  onSaveDraft,
  savedAt,
}: WizardFooterProps) {
  const isFirst = currentStep === 1;

  return (
    <Card className="flex flex-col gap-4 px-4 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
      <div className="flex items-center justify-between gap-4 sm:justify-start sm:gap-6">
        <Button variant="outline" size="md" onClick={onSaveDraft} className="whitespace-nowrap">
          Save Draft
        </Button>
        <span className="flex items-center gap-2 text-[14px] text-ink-soft">
          {savedAt && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
          {savedAt ? `Draft saved · ${savedAt}` : "Not saved yet"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {!isFirst && (
          <Button variant="outline" size="md" onClick={onBack} className="flex-1 gap-2 whitespace-nowrap sm:flex-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Previous Step
          </Button>
        )}
        <Button variant="brand" size="md" onClick={onNext} disabled={nextDisabled} className="flex-1 gap-2 whitespace-nowrap sm:flex-none">
          {nextLabel}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </Card>
  );
}
