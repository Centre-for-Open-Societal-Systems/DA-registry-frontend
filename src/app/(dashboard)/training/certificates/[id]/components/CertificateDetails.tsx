"use client";

import type { ReactNode } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { CERTIFICATE_STATUS_TONE, useCertificatesStore, type Certificate } from "@/features/performance";
import { downloadTable } from "@/lib/export";

const BACK_HREF = "/training?tab=certificates";
const FILE_ICON = "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8";
const AWARD_ICON = "M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12";

function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const initials = (text: string) => text.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w) && w.length > 2).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

function Field({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[13.5px] text-muted">{label}</p>
      <p className="mt-1 text-[14.5px] font-semibold text-ink">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white shadow-card">
      <h3 className="border-b border-line px-5 py-4 text-[15.5px] font-semibold text-ink">{title}</h3>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

const DESCRIPTION: Record<Certificate["status"], string> = {
  "Pending verification": "An external upload awaiting Woreda review. This record is separate from read-only Agrilearn earned certificates.",
  Verified: "An external upload verified by the Woreda. This record is separate from read-only Agrilearn earned certificates.",
  "Agrilearn-auto": "A certificate earned in Agrilearn and synced automatically. It is read-only in OpenAgriNet.",
};

// Opens the DA's own file when it was picked this session; sample records download a placeholder PDF summary.
function openDocument(c: Certificate) {
  if (c.document?.url) {
    window.open(c.document.url, "_blank", "noopener");
    return;
  }
  downloadTable("pdf", c.credentialId, [c], [
    { header: "Certificate", value: (r) => r.name },
    { header: "Issuing organisation", value: (r) => r.issuer },
    { header: "Credential ID", value: (r) => r.credentialId },
    { header: "Type", value: (r) => r.type },
    { header: "Issued", value: (r) => r.issuedOn },
    { header: "Status", value: (r) => r.status },
  ], `${c.name} (placeholder document)`);
}

export function CertificateDetails({ id }: { id: string }) {
  const certificate = useCertificatesStore((s) => s.rows.find((c) => c.id === id));

  if (!certificate) {
    return (
      <div className="flex w-full flex-col gap-4">
        <BackLink href={BACK_HREF} />
        <Card className="shadow-card">
          <EmptyState title="Certificate not found" hint="It may have been added in an earlier session. Uploads are kept in memory until the API is connected." />
        </Card>
      </div>
    );
  }

  const c = certificate;
  const external = c.provenance === "External upload";

  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href={BACK_HREF} />

      <Card className="px-5 py-4">
        <h1 className="text-[20px] font-bold tracking-tight text-ink sm:text-2xl">Certificate Details</h1>
        <p className="mt-1 text-[13.5px] text-ink-soft">{DESCRIPTION[c.status]}</p>
      </Card>

      <Card className="p-0 shadow-card">
        <div className="flex items-center gap-4 border-b border-line px-5 py-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-green text-[22px] font-semibold text-white">{initials(c.issuer) || initials(c.name)}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-[19px] font-bold text-ink">{c.name}</h2>
              <Pill tone={CERTIFICATE_STATUS_TONE[c.status]} className="px-2.5 py-0.5 text-[12.5px]">{c.status}</Pill>
            </div>
            <p className="mt-1 text-[13.5px] text-ink-soft">{c.issuer} • {c.credentialId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 p-5 lg:grid-cols-[1.5fr_1fr]">
          <Panel title="Certificate Metadata">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Issuing organisation" value={c.issuer} className="sm:col-span-2" />
              <Field label="Certificate type" value={c.type} />
              <Field label="Credential / reference ID" value={c.credentialId} />
              <Field label="Issue date" value={c.issuedOn} />
              <Field label="Expiry date" value={c.expiresOn ?? "Not provided"} />
              {c.notes && <Field label="Notes" value={c.notes} className="sm:col-span-2" />}
              {external ? (
                <>
                  <Field label="Upload by" value={`${c.uploadedBy ?? "—"} • DA`} />
                  <Field label="Review owner" value={c.reviewOwner ?? "—"} />
                </>
              ) : (
                <>
                  <Field label="Record source" value="Agrilearn auto-sync" />
                  <Field label="Editable here" value="No — read-only earned record" />
                </>
              )}
            </div>
            <p className="mt-5 text-[12.5px] text-ink-soft">
              {external
                ? "Replacing an external document sends the replacement through verification. No verification date or approval is promised."
                : "Agrilearn certificates are issued and updated in Agrilearn; changes appear here after the next sync."}
            </p>
          </Panel>

          <Panel title="Supporting document">
            {c.document ? (
              <>
                <div className="flex items-start gap-3">
                  <Icon d={FILE_ICON} className="mt-0.5 h-6 w-6 shrink-0 text-brand-green" />
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-semibold text-ink">{c.document.name}</p>
                    <p className="text-[12.5px] text-muted">{c.document.meta}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col items-center rounded-lg border border-line bg-surface px-6 py-8 text-center">
                  <Icon d={AWARD_ICON} className="h-9 w-9 text-brand-green" />
                  <p className="mt-3 text-[16px] font-semibold text-ink">{c.name}</p>
                  <p className="mt-2 text-[14px] text-ink-soft">{c.uploadedBy ?? "Abebe Kebede"}</p>
                  <span className="my-3 h-px w-44 bg-line" />
                  <p className="text-[12px] uppercase tracking-wide text-muted">Document preview placeholder</p>
                  <p className="text-[12px] text-muted">Editable layout · not an issued certificate</p>
                </div>
                <p className="mt-4 text-[12.5px] text-ink-soft">{external ? "Page 1 • External file supplied by the DA" : "Page 1 • Issued by Agrilearn"}</p>
                <button
                  type="button"
                  onClick={() => openDocument(c)}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-[14px] font-semibold text-brand-green transition-colors hover:bg-brand-mint"
                >
                  <Icon d={FILE_ICON} className="h-4 w-4" />
                  View document
                </button>
              </>
            ) : (
              <p className="text-[14px] text-ink-soft">No supporting document was attached. The Woreda reviewer may ask for one before verifying.</p>
            )}
          </Panel>
        </div>
      </Card>
    </div>
  );
}
