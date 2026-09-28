"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Pill } from "@/components/ui/Pill";
import type { Farmer } from "../types";

// The farmer's consent records (FR-03c): counterparty, data categories, validity.
const CONSENTS = [
  { id: "c-bank", counterparty: "Cooperative Bank of Oromia", categories: ["Identity", "Holding & plots", "Credit history"], validTo: "30 Jun 2027", openTx: "Credit application ATC-2026-04471 (in assessment)" },
  { id: "c-moa", counterparty: "Ministry of Agriculture (registry publication)", categories: ["Identity", "Holding & plots", "Household"], validTo: "Indefinite (statutory)", openTx: null },
  { id: "c-coop", counterparty: "Bako Farmers' Cooperative", categories: ["Contact", "Primary crop"], validTo: "31 Dec 2026", openTx: null },
];

const REASONS = ["Farmer request", "Service no longer needed", "Concern about data use", "Other"];

// FR-03c consent withdrawal: states the four truthful consequences before confirming; records DA-ID, timestamp, reason.
export function ConsentWithdrawalModal({ farmer, isOpen, onClose }: { farmer: Farmer; isOpen: boolean; onClose: () => void }) {
  const [consentId, setConsentId] = useState(CONSENTS[0].id);
  const [reason, setReason] = useState(REASONS[0]);
  const [done, setDone] = useState(false);
  const consent = CONSENTS.find((c) => c.id === consentId)!;

  const close = () => {
    setDone(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Withdraw consent" subtitle={`${farmer.name} · ${farmer.id}`} size="lg"
      footer={done ? <Button variant="brand" onClick={close}>Done</Button> : (
        <>
          <Button variant="outline" onClick={close}>Keep consent</Button>
          <Button className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={() => setDone(true)}>Withdraw</Button>
        </>
      )}
    >
      {done ? (
        <Banner tone="success" title="Consent withdrawn">
          Recorded against {farmer.name}&apos;s record with your DA-ID, timestamp and reason (“{reason}”); visible in the audit trail. No further data is shared with {consent.counterparty} from now on.
          {consent.openTx && <> {consent.openTx} is marked withdrawn and cannot continue.</>}
        </Banner>
      ) : (
        <div className="flex flex-col gap-4">
          <FormField label="Consent record" htmlFor="consent-id" required>
            <Select id="consent-id" value={consentId} onChange={(e) => setConsentId(e.target.value)}>{CONSENTS.map((c) => <option key={c.id} value={c.id}>{c.counterparty}</option>)}</Select>
          </FormField>
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-3 text-[13px]">
            <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[#64748b]">Data categories shared</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">{consent.categories.map((c) => <Pill key={c} tone="blue">{c}</Pill>)}</div>
            <p className="mt-2 text-[#4a5568]">Valid until <span className="font-medium text-[#1a2b3c]">{consent.validTo}</span>{consent.openTx && <> · Open transaction: <span className="font-medium text-[#1a2b3c]">{consent.openTx}</span></>}</p>
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-[#1a2b3c]">Withdrawing means:</p>
            <ol className="mt-1.5 list-decimal space-y-1.5 pl-5 text-[13.5px] text-[#4a5568]">
              <li>No further data is shared with {consent.counterparty} from the moment of withdrawal.</li>
              <li>Data already shared remains with them under their own retention terms — <span className="font-semibold text-[#1a2b3c]">withdrawal is not deletion</span>.</li>
              <li>{consent.openTx ? <>The open transaction ({consent.openTx}) is marked withdrawn and cannot continue.</> : "Any open transaction depending on this consent is marked withdrawn and cannot continue."}</li>
              <li>A new consent must be captured before an equivalent transaction can be started again.</li>
            </ol>
            <p className="mt-2 text-[12.5px] text-[#64748b]">Erasure requests are a separate right handled by the Farmer Registry, not by this application.</p>
          </div>
          <FormField label="Reason" htmlFor="consent-reason" required>
            <Select id="consent-reason" value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</Select>
          </FormField>
        </div>
      )}
    </Modal>
  );
}
