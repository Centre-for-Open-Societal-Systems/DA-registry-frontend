"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { TopHeader } from "./TopHeader";
import { SummarySection } from "./SummarySection";
import { TodayPlanListSection } from "./TodayPlanListSection";
import { QuickActionsSection } from "./QuickActionsSection";
import { SupervisorDashboard } from "./SupervisorDashboard";
import { ExecutiveDashboard } from "./ExecutiveDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { CommsDashboard } from "./CommsDashboard";

// Role home varies (FSD §2.4): every role lands on the view built for its own job.
export function RoleDashboard() {
  const role = useAuthStore((s) => s.role);

  switch (role) {
    case "Supervisor":
      return <SupervisorDashboard />;
    case "Executive":
      return <ExecutiveDashboard />;
    case "Admin":
      return <AdminDashboard />;
    case "CommsOfficer":
      return <CommsDashboard />;
    default:
      // DA — the field-agent home.
      return (
        <div className="flex w-full flex-col gap-4">
          <TopHeader />
          <SummarySection />
          <TodayPlanListSection />
          <QuickActionsSection />
        </div>
      );
  }
}
