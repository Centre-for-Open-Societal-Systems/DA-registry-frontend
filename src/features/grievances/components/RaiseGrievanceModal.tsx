"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Banner } from "@/components/ui/Banner";
import { FARMERS } from "@/features/farmers/data";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Inputs", "Schemes", "Payments", "Markets", "Extension", "Land"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-selects "for a farmer" with this farmer (when launched from a farmer profile). */
  farmerId?: string;
}

// FR-12 / FR-12a: native raise form → Grievance Service API → external case ID; offline-queued when disconnected.
export function RaiseGrievanceModal({ isOpen, onClose, farmerId }: Props) {
  const [forWhom, setForWhom] = useState<"farmer" | "me">(farmerId ? "farmer" : "me");
  const [farmer, setFarmer] = useState(farmerId ?? FARMERS[0].id);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [result, setResult] = useState<{ offline: boolean; ref: string } | null>(null);

  const reset = () => {
    setSubject("");
    setDescription("");
    setAttachments([]);
    setResult(null);
  };

  const submit = (asDraft = false) => {
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    if (asDraft) {
      setResult({ offline: true, ref: "DRAFT (on device)" });
      return;
    }
    setResult({ offline, ref: offline ? "QUEUED — case ID assigned on sync" : `GRV-2026-${Math.floor(10000 + Math.random() * 89999)}` });
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Raise a grievance" subtitle="Submitted to the external OAN Grievance Service — triage, response and closure happen there." size="lg"
      footer={result ? <Button variant="brand" onClick={close}>Done</Button> : (
        <>
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button variant="brandOutline" onClick={() => submit(true)}>Save draft</Button>
          <Button variant="brand" disabled={subject.trim().length < 3 || description.trim().length < 10} onClick={() => submit()}>Submit</Button>
        </>
      )}
    >
      {result ? (
        <div className="flex flex-col gap-3">
          <Banner tone={result.offline ? "warning" : "success"} title={result.offline ? "Held on this device" : "Submitted to the Grievance Service"}>
            {result.offline
              ? "No connectivity — the grievance is stored on the device and will be forwarded to the Grievance Service on reconnection. The external case ID is assigned then."
              : `External case ID ${result.ref}. Status is sourced from the Grievance Service; the submitter is notified by SMS on every change.`}
          </Banner>
          <p className="text-[13px] text-[#4a5568]">Reference: <span className="font-mono font-medium text-[#1a2b3c]">{result.ref}</span></p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#F1F5F9] p-1">
            {(["farmer", "me"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setForWhom(k)} className={cn("h-9 rounded-md text-[13.5px] font-semibold transition-colors", forWhom === k ? "bg-white text-brand-green shadow-sm" : "text-[#4a5568]")}>
                {k === "farmer" ? "On behalf of a farmer" : "For myself"}
              </button>
            ))}
          </div>
          {forWhom === "farmer" && (
            <FormField label="Farmer" htmlFor="grv-farmer" required>
              <Select id="grv-farmer" value={farmer} onChange={(e) => setFarmer(e.target.value)}>{FARMERS.map((f) => <option key={f.id} value={f.id}>{f.name} — {f.kebele}</option>)}</Select>
            </FormField>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Category" htmlFor="grv-cat" required>
              <Select id="grv-cat" value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
            </FormField>
            <FormField label="Subject" htmlFor="grv-subject" required>
              <Input id="grv-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short title" />
            </FormField>
          </div>
          <FormField label="Description" htmlFor="grv-desc" required>
            <Textarea id="grv-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happened, where, and when" />
          </FormField>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setAttachments((a) => [...a, `photo-${a.length + 1}.jpg`])} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-[13px] font-medium text-[#334155] hover:bg-zinc-50">Add photo</button>
            <button type="button" onClick={() => setAttachments((a) => [...a, `voice-note-${a.length + 1}.m4a`])} className="inline-flex shrink-0 whitespace-nowrap h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-[13px] font-medium text-[#334155] hover:bg-zinc-50">Record voice note</button>
            {attachments.map((a) => <span key={a} className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 font-mono text-[12px] text-[#475569]">{a}</span>)}
          </div>
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-3 text-[12.5px] leading-relaxed text-[#4a5568]">
            <p><span className="font-semibold text-[#1a2b3c]">Shared with the Grievance Service:</span> farmer/DA name, Farmer-ID or DA-ID, kebele, contact number, category, description and attachments.</p>
            <p className="mt-1"><span className="font-semibold text-[#1a2b3c]">Withheld from woreda-level reports:</span> Fayda ID, phone number and household data — reports carry the case ID and category only.</p>
            <p className="mt-1">While offline the record is held on the device and forwarded on reconnection.</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
