import type { Metadata } from "next";
import { ReviewsWorkspace } from "./components/ReviewsWorkspace";

export const metadata: Metadata = {
  title: "Reviews | OpenAgriNet",
  description: "Review and support development agents in your woreda.",
};

const TABS = ["Reviews", "Goals", "Dev plan", "Coaching", "Recognition", "Trends"] as const;

export default async function ReviewsPage(props: PageProps<"/reviews">) {
  const { tab } = await props.searchParams;
  const activeTab = typeof tab === "string" ? TABS.find((item) => item.toLowerCase() === tab.toLowerCase()) ?? "Reviews" : "Reviews";
  return <ReviewsWorkspace key={activeTab} initialTab={activeTab} />;
}
