import type { Metadata } from "next";
import { TrainingWorkspace, type TrainingTab } from "./components/TrainingWorkspace";

export const metadata: Metadata = {
  title: "Training | OpenAgriNet",
  description: "Your Agrilearn courses, certificates and upcoming training sessions.",
};

const TABS: TrainingTab[] = ["courses", "calendar", "certificates"];

// ?tab= lets detail pages send the DA back to the tab they came from.
export default async function TrainingPage(props: PageProps<"/training">) {
  const { tab } = await props.searchParams;
  const initialTab = TABS.find((t) => t === tab) ?? "courses";
  return <TrainingWorkspace key={initialTab} initialTab={initialTab} />;
}
