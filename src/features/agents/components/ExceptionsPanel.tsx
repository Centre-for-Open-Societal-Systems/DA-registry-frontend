"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Pill, type PillTone } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { DATA_EXCEPTIONS } from "../data";
import type { DataException, ExceptionKind } from "../types";

const KIND_TONE: Record<ExceptionKind, PillTone> = {
  "Duplicate identity": "red",
  "Fayda mismatch": "red",
  "Missing mandatory field": "amber",
  "Invalid Kebele reference": "amber",
  "Failed sync": "purple",
};

// Where each exception kind is resolved (§3.2.3 resolve actions route to the owning module).
const RESOLVE_ROUTE: Record<ExceptionKind, { label: string; href: string }> = {
  "Duplicate identity": { label: "Resolve in Fayda verification", href: "/agents/fayda" },
  "Fayda mismatch": { label: "Resolve in Fayda verification", href: "/agents/fayda" },
  "Missing mandatory field": { label: "Open record", href: "/agents" },
  "Invalid Kebele reference": { label: "Map kebele in Settings", href: "/admin/settings" },
  "Failed sync": { label: "Retry in Registry Sync", href: "/registry-sync" },
};

// Dedicated data-quality exceptions panel (FR-02 §3.2.3) with resolve / dismiss actions.
export function ExceptionsPanel({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<DataException[]>(DATA_EXCEPTIONS);
  const [notice, setNotice] = useState<string | null>(null);

  const dismiss = (id: string) => {
    setItems((prev) => prev.filter((e) => e.id !== id));
    setNotice(`${id} marked resolved — recorded in the audit trail.`);
  };

  return (
    <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            Data-quality exceptions
            <span className="rounded-full bg-danger-wash px-2 py-px text-[12px] font-semibold text-danger">{items.length}</span>
          </h2>
          {!compact && <p className="mt-0.5 text-[12.5px] text-ink-soft">Duplicate identity · Fayda mismatch · missing mandatory field · invalid Kebele reference · failed sync.</p>}
        </div>
      </div>
      {notice && <Banner tone="success" className="m-4 mb-0" onDismiss={() => setNotice(null)}>{notice}</Banner>}
      {items.length === 0 ? (
        <EmptyState title="No open exceptions" hint="New exceptions appear here as imports, Fayda checks and MoA sync run." />
      ) : (
        <ul className="divide-y divide-line-soft">
          {items.map((e) => (
            <li key={e.id} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={KIND_TONE[e.kind]}>{e.kind}</Pill>
                  <span className="text-[13px] font-semibold text-ink">{e.fullName}</span>
                  <span className="font-mono text-[12px] text-muted">{e.daId}</span>
                </div>
                <p className="mt-1 text-[13px] text-ink-soft">{e.detail}</p>
                <p className="mt-0.5 text-[11.5px] text-subtle">{e.id} · raised {e.raisedAt}</p>
              </div>
              {/* Buttons keep their label on one line and wrap onto a second row on phones instead of squashing */}
              <div className="mt-1 flex flex-wrap items-center gap-2 sm:mt-0 sm:shrink-0 sm:flex-nowrap">
                <Link href={RESOLVE_ROUTE[e.kind].href} className="inline-flex h-9 items-center whitespace-nowrap rounded-md border border-brand-green bg-white px-3 text-[12.5px] font-semibold text-brand-green hover:bg-brand-wash sm:h-8">
                  {RESOLVE_ROUTE[e.kind].label}
                </Link>
                <button type="button" onClick={() => dismiss(e.id)} className="inline-flex h-9 items-center whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 text-[12.5px] font-medium text-ink-soft hover:bg-zinc-50 sm:h-8">
                  Mark resolved
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
