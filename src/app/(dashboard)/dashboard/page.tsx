import { Metadata } from "next";
import { RoleDashboard } from "./components/RoleDashboard";
import { TopHeader } from "./components/TopHeader";
import { SummarySection } from "./components/SummarySection";
import { TodayPlanListSection } from "./components/TodayPlanListSection";
import { QuickActionsSection } from "./components/QuickActionsSection";
import { SupervisorDashboard } from "./components/SupervisorDashboard";
import { ExecutiveDashboard } from "./components/ExecutiveDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { CommsDashboard } from "./components/CommsDashboard";

export const metadata: Metadata = {
  title: "Dashboard | OpenAgriNet",
  description: "Overview of your agricultural tasks and progress.",
};

export default function DashboardPage() {
  return (
    <RoleDashboard
      supervisor={<SupervisorDashboard />}
      executive={<ExecutiveDashboard />}
      admin={<AdminDashboard />}
      comms={<CommsDashboard />}
      agent={
        <div className="flex w-full flex-col gap-4">
          <TopHeader />
          <SummarySection />
          <TodayPlanListSection />
          <QuickActionsSection />
        </div>
      }
    />
  );
}
