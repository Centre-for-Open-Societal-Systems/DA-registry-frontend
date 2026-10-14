import { Card } from "@/components/ui/Card";
import { AGENT_PROFILE } from "@/features/farmers";
import { DateRangeDropdown } from "./DateRangeDropdown";

export function TopHeader() {
  const p = AGENT_PROFILE;
  const firstName = p.name.split(" ")[0];

  return (
    <Card className="relative z-50 flex w-full flex-col justify-between gap-4 px-4 py-5 shadow-card md:flex-row md:items-center">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-ink sm:text-[22px]">Welcome back, {firstName}</h1>
        <p className="mt-1.5 text-[13.5px] text-slate-600">
          {p.location}
        </p>
      </div>

      <DateRangeDropdown />
    </Card>
  );
}
