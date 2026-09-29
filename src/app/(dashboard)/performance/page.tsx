import { Metadata } from "next";
import { RolePerformance } from "./components/RolePerformance";
import { SupervisorPerformance } from "./components/SupervisorPerformance";
import { PerformanceHeader } from "./components/PerformanceHeader";
import { PerformanceStats } from "./components/PerformanceStats";
import { GoalsCard } from "./components/GoalsCard";
import { StatusCard, SupervisorFeedbackCard, UpcomingReviewsCard } from "./components/SidePanels";

export const metadata: Metadata = {
  title: "My Performance | OpenAgriNet",
  description: "Your goals and KPIs, or your woreda's agent performance for supervisors.",
};

export default function PerformancePage() {
  return (
    <RolePerformance
      supervisor={<SupervisorPerformance />}
      agent={
        <div className="flex w-full flex-col gap-4">
          <PerformanceHeader />
          <PerformanceStats />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
            <GoalsCard />
            <div className="flex flex-col gap-4">
              <StatusCard />
              <UpcomingReviewsCard />
              <SupervisorFeedbackCard />
            </div>
          </div>
        </div>
      }
    />
  );
}
