import Link from "next/link";
import { Card } from "@/components/ui/Card";

// Farm visits open their record in the planner; the report item opens the outcome / activity report form.
const PLANS = [
  { time: "08:30", title: "Farm visit: Lelise Gudeta, Bako Tibe", desc: "Crop inspection", status: "UPCOMING", href: "/visits/v-1001" },
  { time: "10:00", title: "Farm visit: Abebe Kebede, Gedo", desc: "Input distribution", status: "UPCOMING", href: "/visits/v-1003" },
  { time: "13:00", title: "Submit weekly crop report", desc: "National agriculture statistics deadline", status: "DUE TODAY", href: "/visits/v-1001/outcome" },
  { time: "15:30", title: "Farm visit: Chaltu Dinkesa, Lume", desc: "Follow-up", status: "UPCOMING", href: "/visits/v-1002" },
];

export function TodayPlanListSection() {
  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
        <h3 className="text-[15px] font-semibold text-[#1a2b3c]">Today&apos;s Plan</h3>
        <Link href="/visits/v-1001" className="flex items-center gap-1 text-[13px] font-semibold text-brand-green transition-all hover:underline">
          View calendar <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
      <div className="flex flex-col">
        {PLANS.map((plan) => (
          <Link
            key={plan.time}
            href={plan.href}
            className="group flex items-center border-b border-[#F1F3F4] px-5 py-2.5 transition-colors last:border-0 hover:bg-[#F8FAFC]"
          >
            <div className="w-[68px] shrink-0">
              <span className="rounded-md bg-[#F1F5F9] px-2.5 py-1 text-[12.5px] font-medium text-[#475569]">
                {plan.time}
              </span>
            </div>

            <div className="flex-1 pr-4">
              <p className="text-[14px] font-medium text-[#1a2b3c] transition-colors group-hover:text-brand-green">{plan.title}</p>
              <p className="mt-0.5 text-[13px] text-[#718096]">{plan.desc}</p>
            </div>

            {plan.status === "UPCOMING" ? (
              <span className="rounded-full bg-[#E0EFFF] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#2563EB]">
                {plan.status}
              </span>
            ) : (
              <span className="rounded-full bg-[#FEF3C7] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#B45309]">
                {plan.status}
              </span>
            )}
          </Link>
        ))}
      </div>
    </Card>
  );
}
