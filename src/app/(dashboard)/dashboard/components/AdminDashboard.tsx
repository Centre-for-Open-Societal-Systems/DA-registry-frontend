import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { cn } from "@/lib/utils";
import { ADMIN_STATS, RECENT_ACTIVITY, REGISTRATIONS_TREND, type ActivityTone, type AdminStat } from "@/features/dashboard";
import { RegistrationsTrendChart } from "./RegistrationsTrendChart";
import { PendingRegistrations } from "./PendingRegistrations";
import { DateRangeDropdown } from "./DateRangeDropdown";

const ICONS: Record<AdminStat["icon"], ReactNode> = {
  handshake: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 17l2 2a1 1 0 003-3" /><path d="M14 14l2.5 2.5a1 1 0 003-3l-3.88-3.88a3 3 0 00-4.24 0l-.88.88a1 1 0 11-3-3l2.81-2.81a5.79 5.79 0 017.06-.87l.47.28a2 2 0 001.42.25L21 4" /><path d="M21 3l1 11h-2" /><path d="M3 3L2 14l6.5 6.5a1 1 0 003-3" /><path d="M3 4h8" />
    </svg>
  ),
  calendar: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
    </svg>
  ),
  shield: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  alert: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /><path d="M12 9v4M12 17h.01" />
    </svg>
  ),
};

const AVATAR_TONES: Record<ActivityTone, string> = {
  green: "bg-brand-border-soft text-brand-green",
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-violet-100 text-violet-600",
  amber: "bg-orange-100 text-orange-700",
};

// OAN / ATI Administrator home: registry KPIs, registration trend, recent activity and pending registrations.
export function AdminDashboard() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="relative z-50 flex w-full flex-col justify-between gap-4 px-4 py-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] md:flex-row md:items-center">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-ink sm:text-[22px]">Dashboard</h1>
          <p className="mt-1.5 text-[14px] text-ink-soft">National registry overview · all regions</p>
        </div>
        <DateRangeDropdown />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_STATS.map((stat) => (
          <StatCard key={stat.key} label={stat.label} value={stat.value} accent={stat.accent} tile={stat.tile} icon={ICONS[stat.icon]} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-semibold text-ink">Monthly Registrations Trend</h2>
          <div className="px-5 py-5">
            <RegistrationsTrendChart points={REGISTRATIONS_TREND} seriesLabel="New Farmers (2024)" />
          </div>
        </Card>

        <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-semibold text-ink">Recent Activity</h2>
          <ul className="flex flex-col gap-3 p-4">
            {RECENT_ACTIVITY.map((item) => (
              <li key={item.id} className="group flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 transition-all hover:border-brand-green/30 hover:bg-white hover:shadow-sm">
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110", AVATAR_TONES[item.tone])}>
                  {item.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-[13px] text-ink-soft">{item.place} · {item.at}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <PendingRegistrations />
    </div>
  );
}
