"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { ExportButton } from "@/components/ui/ExportButton";
import { downloadCsv, fileDate } from "@/lib/download";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { KEBELES, WOREDAS } from "@/features/agents/data";

const AUDIT_LOG = [
  ["16 Sep 2026, 09:02", "Yonas Haile (Admin)", "Updated sync schedule → Every 6 hours"],
  ["14 Sep 2026, 07:56", "System", "MoA publication failed for DA-OR-000355 (retry 2/3)"],
  ["11 Sep 2026, 16:05", "Kebede Alemu (Supervisor)", "Requested changes on DA-OR-000353"],
  ["08 Sep 2026, 10:30", "Yonas Haile (Admin)", "Mapped kebele code OR-DN-017 → Ginchi (reconciled)"],
  ["16 Aug 2026, 09:40", "Kebede Alemu (Supervisor)", "Approved DA-OR-000355 — published to Gen 2"],
];

type Tab = "sync" | "routing" | "master" | "audit";

// Administration › Settings: routing, sync configuration, master data (§3.1.1 Admin function) + audit access.
export function SettingsWorkspace() {
  const [tab, setTab] = useState<Tab>("sync");
  const [notice, setNotice] = useState<string | null>(null);
  const [sync, setSync] = useState({ moaBase: "https://api.moa.gov.et/extension/v2", schedule: "Every 6 hours", batch: "500", retries: "3", faydaFallback: "OTP via registered mobile", conflict: "Merge with review" });
  const [routing, setRouting] = useState({ onboarding: "Woreda Supervisor of proposed kebele", issues: "Woreda Supervisor of reporter", grievances: "External Grievance Service (API)", broadcasts: "Communications Officer — region" });

  const save = (what: string) => setNotice(`${what} saved. Change recorded in the audit log.`);

  return (
    <>
      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}
      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <SegmentTabs<Tab> tabs={[{ key: "sync", label: "Sync configuration" }, { key: "routing", label: "Routing" }, { key: "master", label: "Master data" }, { key: "audit", label: "Audit" }]} active={tab} onChange={setTab} />

        {tab === "sync" && (
          <div className="flex flex-col gap-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="MoA master registry endpoint" htmlFor="s-moa" hint="Governed API contract v2 — versioned and auditable."><Input id="s-moa" value={sync.moaBase} onChange={(e) => setSync({ ...sync, moaBase: e.target.value })} /></FormField>
              <FormField label="Sync schedule" htmlFor="s-sched" hint="Batch must complete within 30 minutes (NFR)."><Select id="s-sched" value={sync.schedule} onChange={(e) => setSync({ ...sync, schedule: e.target.value })}><option>Every hour</option><option>Every 6 hours</option><option>Daily at 06:00</option></Select></FormField>
              <FormField label="Batch size" htmlFor="s-batch"><Input id="s-batch" type="number" value={sync.batch} onChange={(e) => setSync({ ...sync, batch: e.target.value })} /></FormField>
              <FormField label="Automatic retries on failure" htmlFor="s-retries"><Input id="s-retries" type="number" value={sync.retries} onChange={(e) => setSync({ ...sync, retries: e.target.value })} /></FormField>
              <FormField label="Fayda outage fallback" htmlFor="s-fayda" hint="Applies to DA authentication during Fayda outages (FR-01)."><Select id="s-fayda" value={sync.faydaFallback} onChange={(e) => setSync({ ...sync, faydaFallback: e.target.value })}><option>OTP via registered mobile</option><option>Officer-attested temporary credential</option></Select></FormField>
              <FormField label="Device-sync conflict policy" htmlFor="s-conflict" hint="Unresolved conflicts are always recorded for supervisor attention (FR-08)."><Select id="s-conflict" value={sync.conflict} onChange={(e) => setSync({ ...sync, conflict: e.target.value })}><option>Merge with review</option><option>Last-write-wins (timestamp)</option></Select></FormField>
            </div>
            <div className="flex justify-end"><Button variant="brand" onClick={() => save("Sync configuration")}>Save</Button></div>
          </div>
        )}

        {tab === "routing" && (
          <div className="flex flex-col gap-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Onboarding proposals route to" htmlFor="r-onb"><Input id="r-onb" value={routing.onboarding} onChange={(e) => setRouting({ ...routing, onboarding: e.target.value })} /></FormField>
              <FormField label="Internal issues route to" htmlFor="r-iss" hint="No separate support-desk role (FR-13a)."><Input id="r-iss" value={routing.issues} onChange={(e) => setRouting({ ...routing, issues: e.target.value })} /></FormField>
              <FormField label="Grievances route to" htmlFor="r-grv"><Input id="r-grv" value={routing.grievances} readOnly className="bg-zinc-50" /></FormField>
              <FormField label="Broadcast approvals" htmlFor="r-bc"><Input id="r-bc" value={routing.broadcasts} onChange={(e) => setRouting({ ...routing, broadcasts: e.target.value })} /></FormField>
            </div>
            <div className="flex justify-end"><Button variant="brand" onClick={() => save("Routing")}>Save</Button></div>
          </div>
        )}

        {tab === "master" && (
          <div className="p-5">
            <p className="text-[13.5px] text-[#4a5568]">Administrative units used for scope, assignment and geofence validation. Unknown inbound codes (e.g. OR-DN-017) surface as “Invalid Kebele reference” exceptions until mapped here.</p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {WOREDAS.map((w) => (
                <div key={w} className="rounded-lg border border-[#E5E7EB] p-4">
                  <div className="flex items-center justify-between"><h3 className="text-[14px] font-semibold text-[#1a2b3c]">{w}</h3><Pill tone="slate">Oromia · West Shewa</Pill></div>
                  <ul className="mt-2 flex flex-wrap gap-1.5">{KEBELES[w].map((k) => <li key={k} className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[12.5px] text-[#475569]">{k}</li>)}</ul>
                  <button type="button" onClick={() => setNotice(`Kebele mapping for ${w} opened — add or map inbound MoA codes to master kebeles.`)} className="mt-3 text-[12.5px] font-semibold text-brand-green hover:underline">Manage kebeles</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "audit" && (
          <div className="p-5">
            <p className="text-[13.5px] text-[#4a5568]">Immutable audit log — every actor, role, entity, action, decision and timestamp. Records cannot be deleted, including by administrators.</p>
            <ul className="mt-4 divide-y divide-[#F1F3F4] rounded-lg border border-[#E5E7EB]">
              {AUDIT_LOG.map(([at, actor, action]) => (
                <li key={at} className="flex flex-col gap-0.5 px-4 py-3 text-[13.5px] sm:flex-row sm:gap-4"><span className="w-44 shrink-0 text-[12.5px] text-[#64748b]">{at}</span><span className="text-[#1a2b3c]"><span className="font-semibold">{actor}</span> — {action}</span></li>
              ))}
            </ul>
            <ExportButton label="Export audit log" onClick={() => {
                downloadCsv(`audit-log-${fileDate()}.csv`, AUDIT_LOG, [
                  { header: "Timestamp", value: (r) => r[0] },
                  { header: "Actor", value: (r) => r[1] },
                  { header: "Action", value: (r) => r[2] },
                ]);
                setNotice(`Audit log exported — ${AUDIT_LOG.length} entries (CSV).`);
              }} className="mt-4" />
          </div>
        )}
      </Card>
    </>
  );
}
