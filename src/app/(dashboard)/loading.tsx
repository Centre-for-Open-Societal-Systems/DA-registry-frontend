import { PageLoader } from "@/components/ui/PageLoader";

// Shown inside the dashboard shell (sidebar and header stay put) while a page renders.
export default function DashboardLoading() {
  return <PageLoader />;
}
