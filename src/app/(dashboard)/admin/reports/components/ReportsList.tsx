"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ExportButton } from "@/components/ui/ExportButton";
import { Pill } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { Select } from "@/components/ui/Select";
import { useAuthStore } from "@/store/useAuthStore";

interface Report {
  id: string;
  name: string;
  description: string;
  scope: "Woreda" | "Region" | "National";
  part: 1 | 2;
  lastRun: string;
  formats: string[];
}

const REPORTS: Report[] = [
  { id: "r-registry", name: "DA master registry extract", description: "All DAs with Fayda status, active status, kebele, farmer count and approval/publication state.", scope: "Region", part: 1, lastRun: "14 Sep 2026, 06:00", formats: ["CSV", "XLSX"] },
  { id: "r-coverage", name: "Kebele coverage", description: "Agents, linked farmers and households per kebele; uncovered and flagged kebeles.", scope: "Woreda", part: 1, lastRun: "14 Sep 2026, 06:00", formats: ["PDF", "CSV"] },
  { id: "r-sync", name: "MoA reconciliation report", description: "Every registry-sync event with direction, outcome, retry count and reconciliation decision.", scope: "National", part: 1, lastRun: "08 Sep 2026, 10:30", formats: ["CSV"] },
  { id: "r-exceptions", name: "Data-quality exceptions", description: "Open and resolved exceptions by kind, age and owning module.", scope: "Region", part: 1, lastRun: "14 Sep 2026, 06:00", formats: ["XLSX"] },
  { id: "r-visits", name: "Visit activity", description: "Planned vs completed visits, on-time rate, missed/rescheduled by agent and kebele.", scope: "Woreda", part: 1, lastRun: "15 Sep 2026, 06:00", formats: ["PDF", "CSV"] },
  { id: "r-broadcast", name: "Dissemination log", description: "Broadcast dispatches with audience, channels and delivery outcomes.", scope: "Woreda", part: 1, lastRun: "15 Sep 2026, 06:00", formats: ["CSV"] },
  { id: "r-grievance", name: "Grievance summary (external)", description: "Case IDs and categories by kebele — identity fields withheld per FR-12a.", scope: "Woreda", part: 1, lastRun: "15 Sep 2026, 06:00", formats: ["PDF"] },
  { id: "r-sla", name: "SLA compliance", description: "Visit cadence and response timeliness at DA, Woreda and regional level.", scope: "Region", part: 2, lastRun: "—", formats: ["PDF"] },
];

export function ReportsList() {
  const role = useAuthStore((s) => s.role);
  const [period, setPeriod] = useState("This month");
  const [notice, setNotice] = useState<string | null>(null);
  const scopeNote = role === "Executive" ? "Regional roll-ups; operational DA detail by drill-down only." : role === "Supervisor" ? "Scoped to your Woreda." : "All regions.";

  return (
    <>
      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}
      <Card className="flex flex-col gap-3 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13.5px] text-ink-soft">{scopeNote}</p>
        <label className="flex items-center gap-2 text-[13px] text-ink-soft">Period
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-9 w-44 text-[13.5px]"><option>This week</option><option>This month</option><option>This quarter</option><option>Meher 2026</option></Select>
        </label>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {REPORTS.map((r) => (
          <Card key={r.id} className="flex flex-col shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] font-semibold text-ink">{r.name}</h3>
              <div className="flex gap-1.5"><Pill tone="slate">{r.scope}</Pill>{r.part === 2 && <Pill tone="purple">Part 2</Pill>}</div>
            </div>
            <p className="mt-1.5 flex-1 text-[13.5px] text-ink-soft">{r.description}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-muted">Last run {r.lastRun}</span>
              <div className="flex gap-1.5">
                {r.formats.map((f) => (
                  <ExportButton key={f} label={f} disabled={r.part === 2} onClick={() => setNotice(`${r.name} (${f}, ${period}) queued — you'll be notified when the export is ready.`)} />
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
