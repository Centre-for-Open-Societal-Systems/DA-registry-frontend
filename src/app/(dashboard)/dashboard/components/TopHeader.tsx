import { Card } from "@/components/ui/Card";
import { DateRangeDropdown } from "./DateRangeDropdown";

export function TopHeader() {
  return (
    <Card className="relative z-50 flex w-full flex-col justify-between gap-4 px-4 py-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] md:flex-row md:items-center">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-[#1a2b3c] sm:text-[22px]">Welcome back, Tadesse</h1>
        <p className="mt-1.5 text-[14px] text-[#4a5568]">
          <strong className="font-semibold text-[#1a2b3c]">Assigned:</strong> Kebeles - Kebele1, Kebele2 · Updated 2 minutes ago
        </p>
      </div>

      <DateRangeDropdown />
    </Card>
  );
}
