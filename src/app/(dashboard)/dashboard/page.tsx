import { Metadata } from "next";
import { RoleDashboard } from "./components/RoleDashboard";

export const metadata: Metadata = {
  title: "Dashboard | OpenAgriNet",
  description: "Overview of your agricultural tasks and progress.",
};

export default function DashboardPage() {
  return <RoleDashboard />;
}
