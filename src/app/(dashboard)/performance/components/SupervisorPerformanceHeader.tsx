"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { REGIONS, WOREDA_SUMMARY } from "@/features/performance/supervisorData";
import { DateRangeDropdown } from "../../dashboard/components/DateRangeDropdown";

export function SupervisorPerformanceHeader() {
  const [region, setRegion] = useState(REGIONS[0]);

  return (
    <Card className="relative z-50 flex flex-col gap-4 px-4 py-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-[#1a2b3c] sm:text-[22px]">My Performance</h1>
        <p className="mt-1.5 text-[14px] text-[#4a5568]">
          {WOREDA_SUMMARY.woreda} · {WOREDA_SUMMARY.agentCount} development agents
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
        <Dropdown
          value={region}
          onChange={setRegion}
          options={REGIONS}
          align="right"
          className="sm:w-[170px] [&>button]:h-9 [&>button]:rounded-lg [&>button]:border-zinc-200"
          renderValue={(o) => <span className="text-[13.5px] text-[#334155]">Region: {o.label}</span>}
        />
        {/* Same period picker as the role dashboards */}
        <DateRangeDropdown />
        <Link
          href="/performance/kpi-entry"
          className="inline-flex shrink-0 whitespace-nowrap h-9 items-center justify-center gap-1.5 rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          KPI entry / import
        </Link>
      </div>
    </Card>
  );
}
