import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pill } from "@/components/ui/Pill";

export function SubmittedHeader() {
  return (
    <PageHeader
      title="Register a farmer"
      titleAddon={<Pill tone="green" dot>Submitted</Pill>}
      description="The registration is with the Woreda office for verification. Track it with the ticket number below."
    />
  );
}

export function SubmittedStep({ ticketNumber }: { ticketNumber: string }) {
  return (
    <Card className="min-h-[640px] p-0 shadow-card">
      <div className="border-b border-line px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-ink">Registration Submitted</h2>
      </div>

      <div className="flex flex-col items-center px-5 pb-10 pt-14 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-tint text-brand-green">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 12l2.5 2.5 4.5-5" />
          </svg>
        </span>

        <h3 className="mt-7 text-[20px] font-semibold text-ink">Registration Submitted</h3>
        <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">
          The farmer registration has been submitted.
          <br />
          Acknowledgement sent via SMS/email.
        </p>

        <div className="mt-5 w-full max-w-[385px] rounded-lg bg-line-soft px-4 py-3 text-left">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Ticket number</p>
          <p className="mt-1 font-mono text-[14.5px] font-medium text-ink">{ticketNumber}</p>
        </div>

        <p className="mt-4 text-[12.5px] text-gray-500">
          Keep this number for tracking. You will be notified of all updates.
        </p>
      </div>
    </Card>
  );
}
