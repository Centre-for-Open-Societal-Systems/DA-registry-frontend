import type { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { RECENT_SA_ACTIVITY, SA_STATS } from "@/features/superadmin";

const icon = (path: ReactNode) => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

const STATS: { label: string; value: number; accent: string; tile: string; href: string; icon: ReactNode }[] = [
  { label: "Departments", value: SA_STATS.departments, accent: "border-l-brand-green", tile: "bg-brand-tint text-brand-green", href: "/department", icon: icon(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />) },
  { label: "Active departments", value: SA_STATS.activeDepartments, accent: "border-l-blue-500", tile: "bg-blue-100 text-blue-600", href: "/department", icon: icon(<path d="M9 12l2 2 4-4M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />) },
  { label: "Users", value: SA_STATS.users, accent: "border-l-violet-500", tile: "bg-violet-100 text-violet-600", href: "/users", icon: icon(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></>) },
  { label: "Roles", value: SA_STATS.roles, accent: "border-l-orange-500", tile: "bg-orange-100 text-orange-700", href: "/roles", icon: icon(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>) },
];

// Super Admin home: platform-wide counts and the latest administrative activity (mock data).
export function SuperAdminDashboard() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="flex w-full flex-col gap-1 px-4 py-5 shadow-card">
        <h1 className="text-[20px] font-semibold tracking-tight text-ink sm:text-[22px]">Dashboard</h1>
        <p className="text-[14px] text-ink-soft">Platform overview · all regions</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href} className="block">
            <StatCard label={s.label} value={String(s.value)} accent={s.accent} tile={s.tile} icon={s.icon} />
          </Link>
        ))}
      </div>

      <Card className="p-0 shadow-card">
        <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-semibold text-ink">Recent activity</h2>
        <ul className="divide-y divide-line-soft">
          {RECENT_SA_ACTIVITY.map((a) => (
            <li key={a.id} className="flex flex-col gap-0.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[14px] text-ink">{a.text}</span>
              <span className="text-[12.5px] text-muted">{a.by} · {a.when}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
