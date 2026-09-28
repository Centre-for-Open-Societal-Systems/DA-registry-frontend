"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AGENT_SUMMARY, QUARTERS } from "@/features/performance/data";
import { QuarterDropdown } from "./QuarterDropdown";

export function PerformanceHeader() {
  const [quarter, setQuarter] = useState(QUARTERS[0]);
  const quarterShort = quarter.split(" (")[0]; // "Q2 2024"

  return (
    <Card className="flex flex-col gap-4 px-4 py-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-[#1a2b3c] sm:text-[22px]">My Performance</h1>
        <p className="mt-1.5 text-[13.5px] text-[#4a5568]">
          {AGENT_SUMMARY.name} · {AGENT_SUMMARY.role} · {AGENT_SUMMARY.kebele} · {quarterShort}
        </p>
      </div>
      <QuarterDropdown value={quarter} onChange={setQuarter} />
    </Card>
  );
}
