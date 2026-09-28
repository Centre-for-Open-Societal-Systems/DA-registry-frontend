import { Metadata } from "next";
import { RolePerformance } from "./components/RolePerformance";

export const metadata: Metadata = {
  title: "My Performance | OpenAgriNet",
  description: "Your goals and KPIs, or your woreda's agent performance for supervisors.",
};

export default function PerformancePage() {
  return <RolePerformance />;
}
